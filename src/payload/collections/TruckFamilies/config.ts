import type { CollectionConfig, Field, FieldHook, Validate } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { link } from "../../fields/link.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { generatePreviewPath } from "../../utilities/preview.ts";
import { type ConditionList, checkEveryRowHasOption } from "./conditions.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";

/** For a name that may be too long for its box; `hyphenate` in the configurator's data reads it. */
const HYPHEN_HINT =
  'Skriv | där ett långt ord får avstavas, till exempel "Skjutstativ|truckar". Ordet visas helt när det får plats och som "Skjutstativ-truckar" när det måste brytas.';

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

/** An option's extra cost; one alone is part of the truck, its cost in the base price. */
const extraPriceField: Field = {
  name: "price",
  label: "Pristillägg",
  type: "number",
  min: 0,
  defaultValue: 0,
  required: true,
  admin: { description: '0 visas som "Ingår".' },
};

type ListName = "models" | "batteries" | "liftHeights";

const rowCount = (data: unknown, list: ListName) => {
  const rows = (data as Record<string, unknown> | undefined)?.[list];
  return Array.isArray(rows) ? rows.length : 0;
};

/** Förvalt, shown only when there is more than one to choose from. */
const defaultField = (list: ListName, label = "Förvalt"): Field => ({
  name: "defaultSelected",
  label,
  type: "checkbox",
  defaultValue: false,
  admin: { condition: (data) => rowCount(data, list) > 1 },
});

/** With more than one row, exactly one is where the configurator starts. */
const oneDefault =
  (list: ListName, message: string): Validate =>
  (_value, { siblingData }) => {
    const rows = (siblingData as Record<string, unknown> | undefined)?.[list];
    if (!Array.isArray(rows) || rows.length < 2) return true;
    const defaults = rows.filter((row) => row?.defaultSelected === true).length;
    return defaults === 1 || message;
  };

/** Both checks on a list the customer chooses one from. */
const validateChoiceList =
  (list: ListName & ConditionList, message: string): Validate =>
  (value, args) => {
    const one = oneDefault(list, message)(value, args);
    if (one !== true) return one;
    return checkEveryRowHasOption(list, args.data as Parameters<typeof checkEveryRowHasOption>[1]);
  };

/**
 * "Visas för": the lift capacities, batteries and masts a row is shown with (`conditions.ts`). Shown
 * where there is something to choose between, in this list and another.
 */
const availableForField = (list: ListName | "extras"): Field => ({
  name: "availableFor",
  label: "Visas för",
  type: "json",
  typescriptSchema: [
    () => ({
      type: "object",
      additionalProperties: false,
      properties: {
        models: { type: "array", items: { type: "string" } },
        batteries: { type: "array", items: { type: "string" } },
        liftHeights: { type: "array", items: { type: "string" } },
      },
    }),
  ],
  admin: {
    components: { Field: `${ADMIN}/AvailableFor.tsx#AvailableFor` },
    condition: (data) =>
      (list === "extras" || rowCount(data, list) > 1) &&
      (["models", "batteries", "liftHeights"] as const).some(
        (other) => other !== list && rowCount(data, other) > 1,
      ),
  },
});

const ONE_IS_A_SPEC =
  "Med flera kan kunden välja i konfiguratorn; med ett enda är det en del av trucken och visas bara som specifikation.";

/**
 * A truck family (Figma's product category), described as a product on one page: what it is, its
 * lift capacities, batteries, lift heights and extras. The hero, the navigation, the product cards
 * and the quote read it, and the configurator builds its steps from it: a list with more than one
 * entry is a choice, one entry is part of the truck, an empty one is left out. Without variants the
 * truck type cannot be configured, and its cards and menus link to `contactLink`. See
 * `docs/truck-data-schema.md`.
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
          label: "Om trucktypen",
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
                    description: `I plural, i menyer och på kort. Exempel: "Elektriska motvikts|truckar". ${HYPHEN_HINT}`,
                  },
                },
                {
                  name: "singularName",
                  label: "Namn i singular",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { description: 'Offertens rubrik. Exempel: "Elektrisk motvikts|truck".' },
                },
              ],
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
              type: "row",
              fields: [
                {
                  name: "travelSpeed",
                  label: "Körhastighet (km/h)",
                  type: "text",
                  localized: true,
                  admin: { description: 'Lastad / olastad. Exempel: "15 / 15".' },
                },
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
                    description:
                      'Kort, som "4 år". Förklaringen står i konfiguratorinställningarna.',
                  },
                },
              ],
            },
            {
              ...link({ name: "contactLink", required: false }),
              label: "Länk utan varianter",
              admin: {
                hideGutter: true,
                description:
                  "Dit kort och menyer länkar så länge trucktypen saknar varianter att konfigurera.",
                condition: (data) => (data?.models?.length ?? 0) === 0,
              },
            } as Field,
          ],
        },
        {
          label: "Konfigurator",
          fields: [
            {
              name: "configuratorOverview",
              type: "ui",
              admin: {
                components: { Field: `${ADMIN}/ConfiguratorOverview.tsx#ConfiguratorOverview` },
              },
            },
            {
              name: "models",
              label: "Lyftkapacitet",
              labels: { singular: "Variant", plural: "Varianter" },
              dbName: "truck_models",
              type: "array",
              localized: false,
              validate: oneDefault("models", "Markera exakt en variant som förvald."),
              admin: {
                description:
                  'En rad per variant; kunden väljer en i konfiguratorn. Namnet räknas fram ur kapaciteten ("1,6 ton").',
                initCollapsed: true,
                components: { RowLabel: `${ROW_LABELS}#ModelRowLabel` },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "capacityKg",
                      label: "Lyftkapacitet (kg)",
                      type: "number",
                      min: 0,
                      required: true,
                    },
                    {
                      name: "sku",
                      label: "Artikelnummer",
                      type: "text",
                      admin: { description: "Under kapaciteten i konfiguratorn, och i offerten." },
                    },
                    { name: "price", label: "Grundpris", type: "number", required: true, min: 0 },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "weight", label: "Vikt (kg)", type: "text", localized: true },
                    {
                      name: "turningRadius",
                      label: "Vändradie (mm)",
                      type: "text",
                      localized: true,
                      admin: { description: 'Exempel: "1870 / 1850".' },
                    },
                  ],
                },
                defaultField("models", "Förvald"),
              ],
            },
            {
              name: "batteries",
              label: "Batteri",
              labels: { singular: "Batteri", plural: "Batterier" },
              dbName: "truck_batteries",
              type: "array",
              localized: false,
              validate: validateChoiceList("batteries", "Markera exakt ett batteri som förvalt."),
              admin: {
                description: `${ONE_IS_A_SPEC} Det förvalda batteriets kapacitet står på produktkortet.`,
                initCollapsed: true,
                components: { RowLabel: `${ROW_LABELS}#BatteryRowLabel` },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      label: "Benämning",
                      type: "text",
                      localized: true,
                      required: true,
                      admin: { description: 'Exempel: "Standard", "Stort batteri".' },
                    },
                    {
                      name: "capacity",
                      label: "Kapacitet",
                      type: "text",
                      localized: true,
                      required: true,
                      admin: { description: 'Exempel: "80 V 228 Ah".' },
                    },
                    extraPriceField,
                  ],
                },
                { name: "description", label: "Text", type: "textarea", localized: true },
                defaultField("batteries"),
                availableForField("batteries"),
              ],
            },
            {
              name: "liftHeights",
              label: "Lyfthöjd",
              labels: { singular: "Mast", plural: "Master" },
              dbName: "truck_lift_heights",
              type: "array",
              localized: false,
              validate: validateChoiceList("liftHeights", "Markera exakt en mast som förvald."),
              admin: {
                description: `${ONE_IS_A_SPEC} Bygghöjden visas under lyfthöjden och i offerten.`,
                initCollapsed: true,
                components: { RowLabel: `${ROW_LABELS}#LiftHeightRowLabel` },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "liftHeight",
                      label: "Lyfthöjd (mm)",
                      type: "number",
                      min: 0,
                      required: true,
                    },
                    {
                      name: "buildHeight",
                      label: "Truckens bygghöjd (mm)",
                      type: "number",
                      min: 0,
                      admin: { description: "Med den här masten." },
                    },
                    extraPriceField,
                  ],
                },
                defaultField("liftHeights", "Förvald"),
                availableForField("liftHeights"),
              ],
            },
            {
              name: "liftHeightHelp",
              label: "Hjälptext under lyfthöjderna",
              type: "textarea",
              localized: true,
              admin: {
                description:
                  'Följd av "Kontakta oss". Exempel: "Behöver du hjälp med andra mastalternativ?".',
                condition: (data) => (data?.liftHeights?.length ?? 0) > 1,
              },
            },
            {
              name: "extras",
              label: "Tillval",
              labels: { singular: "Tillval", plural: "Tillval" },
              dbName: "truck_extras",
              type: "array",
              localized: false,
              admin: {
                description: "Kunden väljer fritt bland dem; inget krävs.",
                initCollapsed: true,
                components: { RowLabel: `${ROW_LABELS}#ExtraRowLabel` },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      label: "Namn",
                      type: "text",
                      localized: true,
                      required: true,
                      admin: { description: HYPHEN_HINT },
                    },
                    { ...extraPriceField, admin: undefined } as Field,
                  ],
                },
                { name: "description", label: "Text", type: "textarea", localized: true },
                { name: "image", label: "Bild", type: "upload", relationTo: "images" },
                availableForField("extras"),
              ],
            },
          ],
        },
      ],
    },
    {
      name: "key",
      label: "Nyckel i adressen",
      type: "text",
      required: true,
      localized: false,
      hooks: { beforeValidate: [keyFromName] },
      // Shared links and saved configurations point at it once the truck type is published.
      access: { update: ({ doc }) => !doc?.publishedAt },
      admin: {
        position: "sidebar",
        description:
          "Konfiguratorns adress pekar på trucktypen med den. Skapas ur namnet om den är tom och låses när trucktypen publiceras, eftersom delade länkar pekar på den.",
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
