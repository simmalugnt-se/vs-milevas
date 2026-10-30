import type {
  ArrayField,
  CollectionConfig,
  FieldHook,
  PayloadRequest,
  Validate,
  Where,
} from "payload";
import {
  isModelStep,
  MODEL_STEPS,
  type ModelProperty,
  propertyValue,
} from "@/features/configurator/steps.ts";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { generatePreviewPath } from "../../utilities/preview.ts";
import { HYPHEN_HINT, optionFields, specsField } from "./fields.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";

const ADMIN = "/payload/collections/TruckFamilies";
const ROW_LABELS = `${ADMIN}/RowLabels.tsx`;

/** "Skjutstativ|truckar" → "skjutstativtruckar", for the key when none is written. */
const slugify = (text: string) =>
  text
    .replaceAll("|", "")
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const keyFromName: FieldHook = ({ value, data }) =>
  value || (typeof data?.name === "string" ? slugify(data.name) : value);

/** The truck type's own models, for its fields that point at one. */
const ownModels = ({ id }: { id?: number | string }): Where =>
  id ? { family: { equals: id } } : { id: { exists: false } };

/** The family's models, for the checks that need them on save. */
async function familyModels(req: PayloadRequest, id: number | string | undefined) {
  if (!id) return [];
  const found = await req.payload.find({
    collection: "truck-models",
    where: { family: { equals: id } },
    depth: 0,
    limit: 200,
    pagination: false,
    req,
  });
  return found.docs;
}

/**
 * The steps under Val: each step from the models' fields once, and together they tell every model
 * apart (or Modell among them, or none, when the customer chooses the model itself), so a
 * configuration always ends at one model.
 */
const stepsTellModelsApart: Validate = async (value, { req, id }) => {
  if (!Array.isArray(value)) return true;
  const keys = (value as Array<{ kind?: string | null }>)
    .map((row) => row.kind)
    .filter(isModelStep);
  if (new Set(keys).size !== keys.length) return "Varje steg från modellerna får bara finnas en gång.";
  // Without steps from the models' fields the customer chooses the model itself.
  const fields = keys.filter((key): key is ModelProperty => key !== "model");
  if (keys.includes("model") || fields.length === 0) return true;
  const seen = new Map<string, string[]>();
  for (const model of await familyModels(req, id)) {
    const key = fields.map((field) => propertyValue(field, model)?.label ?? "–").join(", ");
    seen.set(key, [...(seen.get(key) ?? []), model.name]);
  }
  const clashes = [...seen].filter(([, names]) => names.length > 1);
  if (clashes.length === 0) return true;
  return clashes
    .map(
      ([values, names]) =>
        `${names.join(" och ")} går inte att skilja åt (${values || "inga steg från modellerna"}). Lägg till Hjulantal, Serie eller Modell.`,
    )
    .join(" ");
};

/** A row under Val with its own options, not a step from the models' fields. */
const ownOptions = (_: unknown, sibling: { kind?: string | null }) =>
  !sibling?.kind || sibling.kind === "own";

/** A group's options: written once; the matrix sets which models have each. */
const optionsField = (dbName: string, specsDbName: string): ArrayField => ({
  name: "options",
  label: "Alternativ",
  labels: { singular: "Alternativ", plural: "Alternativ" },
  type: "array",
  dbName,
  localized: false,
  minRows: 1,
  admin: {
    condition: ownOptions,
    initCollapsed: true,
    components: { RowLabel: `${ROW_LABELS}#OptionRowLabel` },
  },
  fields: [
    ...optionFields(),
    specsField({ dbName: specsDbName, description: "Visas i offerten när alternativet är valt." }),
    {
      // Set with the group's matrix; none: every model.
      name: "models",
      type: "relationship",
      relationTo: "truck-models",
      hasMany: true,
      admin: { hidden: true },
    },
  ],
});

/**
 * "Val": the configurator's steps in order. A group of options (Batteri, Hytt, Bluespot …), one
 * option or any with "Flerval", with the options, which models have them and how it shows; or a
 * step from the models' fields (Lyftkapacitet, Hjulantal, Serie, Modell).
 */
const choicesField: ArrayField = {
  name: "choices",
  label: "Val",
  labels: { singular: "Val", plural: "Val" },
  type: "array",
  dbName: "truck_questions",
  localized: false,
  validate: stepsTellModelsApart,
  admin: {
    initCollapsed: true,
    description:
      "Stegen i den ordning kunden går igenom dem. Ett steg med ett enda alternativ visas inte. Det första alternativet en modell har är förvalt för den, utom vid flerval.",
    components: { RowLabel: `${ROW_LABELS}#GroupRowLabel` },
  },
  fields: [
    {
      name: "kind",
      label: "Typ",
      type: "select",
      defaultValue: "own",
      options: [
        { label: "Egna alternativ", value: "own" },
        ...MODEL_STEPS.map(({ key, label }) => ({ label: `${label} från modellerna`, value: key })),
      ],
    },
    {
      name: "label",
      label: "Namn",
      type: "text",
      localized: true,
      required: true,
      admin: {
        condition: ownOptions,
        description: 'Till exempel "Batteri". Visas som stegets rubrik.',
      },
    },
    {
      name: "multiple",
      label: "Flerval",
      type: "checkbox",
      defaultValue: false,
      admin: { condition: ownOptions },
    },
    optionsField("truck_question_options", "truck_option_specs"),
    {
      name: "modelMatrix",
      type: "ui",
      admin: {
        condition: ownOptions,
        components: { Field: `${ADMIN}/ModelMatrix.tsx#ModelMatrix` },
      },
    },
    {
      type: "row",
      admin: { condition: ownOptions },
      fields: [
        {
          name: "columns",
          label: "Kolumner",
          type: "select",
          defaultValue: "auto",
          options: [
            { label: "Automatiskt", value: "auto" },
            { label: "En kolumn", value: "one" },
            { label: "Två kolumner", value: "two" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "help",
          label: "Text under alternativen",
          type: "text",
          localized: true,
          admin: { width: "50%", description: 'Valfri. Följs av "Kontakta oss".' },
        },
      ],
    },
    {
      name: "withPrevious",
      label: "Visa med föregående steg",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};

/**
 * A truck family (Figma's product category): what it is, its models (`truck-models`), its groups of
 * options ("Val") with the models that have each option, and the steps' order. The hero, the
 * navigation, the product cards and the quote read it. Without published models it is not shown on
 * the site. See `docs/truck-data-schema.md`.
 */
export const TruckFamilies: CollectionConfig = {
  slug: "truck-families",
  labels: { singular: "Trucktyp", plural: "Trucktyper" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["name", "updatedAt"],
    components: {
      // Over the list only: the collection's description would show on every truck type too.
      beforeListTable: [
        {
          path: "/payload/components/Note.tsx#Note",
          clientProps: {
            text: "Dra raderna för att ändra ordningen i navigationen och i konfiguratorns första val.",
          },
        },
      ],
    },
    group: ADMIN_GROUPS.configurator,
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ collection: "truck-families", slug: data?.key, req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ collection: "truck-families", slug: data?.key as string, req }),
    useAsTitle: "name",
  },
  orderable: true,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Allmänt",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "name",
                  label: "Namn",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: {
                    width: "50%",
                    description: `Visas i menyn och på produktkorten. ${HYPHEN_HINT}`,
                  },
                },
                {
                  name: "singularName",
                  label: "Namn i singular",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { width: "50%", description: "Rubrik i offerten." },
                },
              ],
            },
            { name: "description", label: "Beskrivning", type: "textarea", localized: true },
            {
              type: "row",
              fields: [
                {
                  name: "image",
                  label: "Bild",
                  type: "upload",
                  relationTo: "images",
                  localized: false,
                  admin: { width: "50%", description: "Frilagd bild på trucken." },
                },
                {
                  name: "brochure",
                  label: "Broschyr",
                  type: "upload",
                  relationTo: "documents",
                  admin: { width: "50%", description: "Gäller modeller utan egen broschyr." },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "cardSpec",
                  label: "Text på produktkortet",
                  type: "text",
                  localized: true,
                  admin: { width: "33%", description: 'Till exempel "80 V 228 Ah".' },
                },
                {
                  name: "deliveryTime",
                  label: "Leveranstid",
                  type: "text",
                  localized: true,
                  admin: { width: "33%", description: 'Till exempel "4–6 veckor".' },
                },
                {
                  name: "warranty",
                  label: "Garanti",
                  type: "text",
                  localized: true,
                  admin: { width: "33%", description: 'Till exempel "4 år".' },
                },
              ],
            },
            specsField({
              dbName: "truck_family_specs",
              description: "Visas i offerten för alla modeller.",
            }),
          ],
        },
        {
          label: "Modeller",
          fields: [
            {
              name: "models",
              label: "Modeller",
              type: "join",
              collection: "truck-models",
              on: "family",
              defaultSort: "capacityKg",
              defaultLimit: 100,
              admin: {
                allowCreate: true,
                defaultColumns: ["name", "series", "capacityKg", "wheels", "price", "_status"],
                description: "En modell visas på sajten när den är publicerad.",
              },
            },
            {
              name: "series",
              label: "Serier",
              labels: { singular: "Serie", plural: "Serier" },
              type: "array",
              dbName: "truck_family_series",
              localized: false,
              admin: { description: "Listan modellerna väljer serie ur." },
              fields: [
                { name: "name", label: "Namn", type: "text", required: true },
                {
                  name: "description",
                  label: "Text",
                  type: "textarea",
                  localized: true,
                  admin: { description: "Visas på seriens kort i konfiguratorn." },
                },
              ],
            },
            {
              name: "defaultModel",
              label: "Förvald modell",
              type: "relationship",
              relationTo: "truck-models",
              filterOptions: ownModels,
              admin: { description: "Konfiguratorn och produktkorten börjar med den." },
            },
          ],
        },
        {
          label: "Val",
          fields: [choicesField],
        },
      ],
    },
    {
      name: "key",
      label: "Adress",
      type: "text",
      required: true,
      localized: false,
      hooks: { beforeValidate: [keyFromName] },
      // Shared links and saved configurations point at it once the truck type is published.
      access: { update: ({ doc }) => !doc?.publishedAt },
      admin: {
        position: "sidebar",
        description: "Används i konfiguratorns adress. Låses när trucktypen publiceras.",
      },
      validate: (value: unknown) =>
        typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : "Använd endast gemener, siffror och bindestreck.",
    },
    {
      name: "publishedAt",
      label: "Publicerad",
      type: "date",
      localized: false,
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    afterChange: [revalidateTruckFamily],
    afterDelete: [revalidateTruckFamilyDelete],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: { autosave: { interval: 300 }, schedulePublish: true },
    maxPerDoc: 50,
  },
};
