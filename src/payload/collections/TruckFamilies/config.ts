import type { CollectionConfig, Field, FieldHook } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { link } from "../../fields/link.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";

/** For a name that may be too long for its box; `hyphenate` in the configurator's data reads it. */
const HYPHEN_HINT =
  'Skriv | där ett långt ord får avstavas, till exempel "Skjutstativ|truckar". Ordet visas helt när det får plats och som "Skjutstativ-truckar" när det måste brytas.';

const ROW_LABELS = "/payload/collections/TruckFamilies/RowLabels.tsx";

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

const defaultField: Field = {
  name: "defaultSelected",
  label: "Förvalt",
  type: "checkbox",
  defaultValue: false,
};

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
    defaultColumns: ["name", "sortOrder", "updatedAt"],
    group: ADMIN_GROUPS.configurator,
    useAsTitle: "name",
  },
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
            description: 'Kort, som "4 år". Förklaringen står i konfiguratorinställningarna.',
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
    {
      name: "models",
      label: "Lyftkapacitet",
      labels: { singular: "Variant", plural: "Varianter" },
      dbName: "truck_models",
      type: "array",
      localized: false,
      admin: {
        description:
          'En rad per variant; konfiguratorns första val. Namnet räknas fram ur kapaciteten ("1,6 ton").',
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
        { ...defaultField, label: "Förvald" } as Field,
      ],
    },
    {
      name: "batteries",
      label: "Batteri",
      labels: { singular: "Batteri", plural: "Batterier" },
      dbName: "truck_batteries",
      type: "array",
      localized: false,
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
        defaultField,
      ],
    },
    {
      name: "liftHeights",
      label: "Lyfthöjd",
      labels: { singular: "Mast", plural: "Master" },
      dbName: "truck_lift_heights",
      type: "array",
      localized: false,
      admin: {
        description: `${ONE_IS_A_SPEC} Bygghöjden visas under lyfthöjden och i offerten.`,
        initCollapsed: true,
        components: { RowLabel: `${ROW_LABELS}#LiftHeightRowLabel` },
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "liftHeight", label: "Lyfthöjd (mm)", type: "number", min: 0, required: true },
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
        defaultField,
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
      ],
    },
    {
      name: "key",
      label: "Nyckel i adressen",
      type: "text",
      required: true,
      localized: false,
      hooks: { beforeValidate: [keyFromName] },
      admin: {
        position: "sidebar",
        description:
          "Konfiguratorns adress pekar på trucktypen med den. Skapas ur namnet om den är tom.",
      },
      validate: (value: unknown) =>
        typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : "Använd endast gemener, siffror och bindestreck.",
    },
    {
      name: "sortOrder",
      label: "Ordning",
      type: "number",
      required: true,
      defaultValue: 0,
      localized: false,
      admin: {
        position: "sidebar",
        description: "Lägst först, i navigationen och i konfiguratorns första val.",
      },
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
