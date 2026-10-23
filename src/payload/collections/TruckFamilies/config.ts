import type { CollectionConfig, Field } from "payload";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { link } from "../../fields/link.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";

const keyField = (name = "key", label = "Stabil nyckel"): Field => ({
  name,
  label,
  type: "text",
  required: true,
  localized: false,
  validate: (value: unknown) =>
    typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : "Använd endast gemener, siffror och bindestreck.",
});

/** Values for `truck-specs`: on the family, a model or an option, each overriding the one before. */
const specsField = (dbName: string, description: string): Field => ({
  name: "specs",
  label: "Specifikationer",
  dbName,
  type: "array",
  localized: false,
  admin: { description, initCollapsed: true },
  fields: [
    {
      name: "spec",
      label: "Specifikation",
      type: "relationship",
      relationTo: "truck-specs",
      required: true,
    },
    {
      name: "value",
      label: "Värde",
      type: "text",
      localized: true,
      required: true,
      admin: { description: 'Utan enheten, om specifikationen har en. Exempel: "1870 / 1850".' },
    },
  ],
});

type FamilyData = {
  models?: Array<{ key?: string }> | null;
  choices?: Array<{ key?: string; options?: Array<{ key?: string }> | null }> | null;
};

const unknownKeys = (value: unknown, known: Set<string>) =>
  (Array.isArray(value) ? value : []).filter(
    (key): key is string => typeof key === "string" && !known.has(key),
  );

/** An option's models must be the family's own, so a typo is stopped here, not in the configurator. */
const optionModels: Field = {
  name: "models",
  label: "Gäller modellerna",
  type: "text",
  hasMany: true,
  admin: { description: "Modellernas nycklar. Tomt betyder alla modeller." },
  validate: (value: unknown, { data }: { data?: unknown }) => {
    const known = new Set(
      ((data as FamilyData | undefined)?.models ?? []).flatMap((model) => model.key ?? []),
    );
    const unknown = unknownKeys(value, known);
    return unknown.length ? `Okända modeller: ${unknown.join(", ")}` : true;
  },
};

/** Other options, as `choice.option`; checked against the family's choices when it is saved. */
const optionReferences = (name: "requires" | "excludes", label: string): Field => ({
  name,
  label,
  type: "text",
  hasMany: true,
  admin: { description: 'Valets och alternativets nycklar. Exempel: "lift-height.6000-mm".' },
  validate: (value: unknown, { data }: { data?: unknown }) => {
    const known = new Set(
      ((data as FamilyData | undefined)?.choices ?? []).flatMap((choice) =>
        (choice.options ?? []).map((option) => `${choice.key}.${option.key}`),
      ),
    );
    const unknown = unknownKeys(value, known);
    return unknown.length ? `Okända val: ${unknown.join(", ")}` : true;
  },
});

/**
 * A truck family (Figma's product category): the one place for its name, image and prices, which
 * the hero, the navigation, the product cards and the configurator read. Its **models** carry the
 * prices and specifications; its **choices** are the configurator's steps after the model, each
 * adding to the price and able to set specifications. See `docs/truck-data-schema.md`.
 */
export const TruckFamilies: CollectionConfig = {
  slug: "truck-families",
  labels: { singular: "Truckfamilj", plural: "Truckfamiljer" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["name", "key", "sortOrder", "configurable", "updatedAt"],
    group: "Configurator",
    useAsTitle: "name",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Familjen",
          fields: [
            {
              name: "name",
              label: "Namn",
              type: "text",
              localized: true,
              required: true,
              admin: { description: 'I plural. Exempel: "Elektriska motviktstruckar".' },
            },
            {
              name: "singularName",
              label: "Namn i singular",
              type: "text",
              localized: true,
              required: true,
              admin: { description: 'Offertens rubrik. Exempel: "Elektrisk motviktstruck".' },
            },
            keyField(),
            {
              name: "sortOrder",
              label: "Ordning",
              type: "number",
              required: true,
              defaultValue: 0,
              localized: false,
              admin: { description: "Ordningen i navigationen och i konfiguratorns första val." },
            },
            { name: "description", label: "Beskrivning", type: "textarea", localized: true },
            {
              name: "image",
              label: "Huvudbild",
              type: "upload",
              relationTo: "images",
              localized: false,
              admin: {
                description:
                  "Frilagd truck med nederkanten mot marken. Heron, navigationen, produktkorten och konfiguratorn visar den.",
              },
            },
            { name: "brochure", label: "Broschyr", type: "upload", relationTo: "documents" },
            {
              name: "configurable",
              label: "Går att konfigurera",
              type: "checkbox",
              defaultValue: true,
              admin: { description: "Av för en familj som bara säljs via kontakt (Plocktruckar)." },
            },
            {
              ...link({ name: "contactLink", required: false }),
              label: "Länk när familjen inte går att konfigurera",
              admin: {
                hideGutter: true,
                condition: (data) => data?.configurable === false,
              },
            } as Field,
            {
              name: "deliveryTime",
              label: "Uppskattad leverans",
              type: "text",
              localized: true,
              admin: { description: 'Exempel: "4–6 veckor".' },
            },
            {
              name: "warranty",
              label: "Garanti",
              type: "text",
              localized: true,
              admin: {
                description: 'Kort, som "4 år". Förklaringen står i konfiguratorinställningarna.',
              },
            },
            specsField("truck_fam_specs", "Det som är lika för alla modeller i familjen."),
          ],
        },
        {
          label: "Modeller",
          fields: [
            {
              name: "modelChoice",
              label: "Steget",
              type: "group",
              admin: { description: "Modellen är konfiguratorns första steg." },
              fields: [
                {
                  name: "label",
                  label: "Etikett",
                  type: "text",
                  localized: true,
                  required: true,
                  defaultValue: "Modell",
                },
                {
                  name: "heading",
                  label: "Rubrik",
                  type: "text",
                  localized: true,
                  required: true,
                  defaultValue: "Välj modell",
                },
              ],
            },
            {
              name: "models",
              label: "Modeller",
              dbName: "truck_models",
              type: "array",
              localized: false,
              admin: { initCollapsed: true },
              fields: [
                keyField(),
                {
                  name: "label",
                  label: "Namn",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { description: 'Exempel: "1,8 ton".' },
                },
                { name: "description", label: "Text", type: "textarea", localized: true },
                { name: "sku", label: "Artikelnummer", type: "text" },
                { name: "price", label: "Pris", type: "number", required: true, min: 0 },
                {
                  name: "capacityKg",
                  label: "Lyftkapacitet (kg)",
                  type: "number",
                  min: 0,
                  admin: { description: "Produktkortet visar modellernas intervall." },
                },
                {
                  name: "defaultSelected",
                  label: "Förvald",
                  type: "checkbox",
                  defaultValue: false,
                },
                specsField("truck_model_specs", "Det som skiljer modellen från familjen."),
              ],
            },
          ],
        },
        {
          label: "Val",
          fields: [
            {
              name: "choices",
              label: "Val",
              dbName: "truck_choices",
              type: "array",
              localized: false,
              admin: {
                description: "Konfiguratorns steg efter modellen, i den här ordningen.",
                initCollapsed: true,
              },
              fields: [
                keyField(),
                { name: "label", label: "Etikett", type: "text", localized: true, required: true },
                { name: "heading", label: "Rubrik", type: "text", localized: true, required: true },
                {
                  name: "help",
                  label: "Hjälptext",
                  type: "textarea",
                  localized: true,
                  admin: {
                    description:
                      'Under steget, följd av "Kontakta oss". Exempel: "Behöver du hjälp med andra mastalternativ?".',
                  },
                },
                {
                  name: "selectionMode",
                  label: "Val",
                  type: "select",
                  required: true,
                  defaultValue: "single",
                  options: [
                    { label: "Enkelval", value: "single" },
                    { label: "Flerval", value: "multiple" },
                  ],
                },
                { name: "required", label: "Krävs", type: "checkbox", defaultValue: true },
                {
                  name: "display",
                  label: "Visning",
                  type: "select",
                  admin: {
                    description:
                      "Figmas stegtyp. Tomt väljer efter innehållet: bild ger bildtyperna, val utan text ger bara titel och pris.",
                  },
                  options: [
                    { label: "Två per rad med text (typ 1)", value: "grid" },
                    { label: "Under varandra (typ 2)", value: "stack" },
                    { label: "Bild, två per rad (typ 3)", value: "images" },
                    { label: "Bild till höger (typ 4)", value: "imageRows" },
                    { label: "Titel och pris (typ 5)", value: "prices" },
                  ],
                },
                {
                  name: "options",
                  label: "Alternativ",
                  dbName: "truck_options",
                  type: "array",
                  localized: false,
                  required: true,
                  minRows: 1,
                  fields: [
                    keyField(),
                    { name: "label", label: "Namn", type: "text", localized: true, required: true },
                    { name: "description", label: "Text", type: "textarea", localized: true },
                    { name: "image", label: "Bild", type: "upload", relationTo: "images" },
                    {
                      name: "price",
                      label: "Pris",
                      type: "number",
                      min: 0,
                      defaultValue: 0,
                      required: true,
                      admin: { description: 'Läggs till modellens pris. 0 visas som "Ingår".' },
                    },
                    {
                      name: "defaultSelected",
                      label: "Förvalt",
                      type: "checkbox",
                      defaultValue: false,
                    },
                    {
                      name: "sku",
                      label: "Artikelnummer",
                      type: "text",
                      admin: { description: "Om alternativet byter artikelnummer." },
                    },
                    optionModels,
                    optionReferences("requires", "Kräver"),
                    optionReferences("excludes", "Utesluter"),
                    specsField(
                      "truck_option_specs",
                      "Specifikationer alternativet sätter, som bygghöjden för en mast.",
                    ),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
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
