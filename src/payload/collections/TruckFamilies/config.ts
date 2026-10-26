import type { CollectionConfig, Field } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { link } from "../../fields/link.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";
import { TRUCK_SPECS } from "./specs.ts";

const keyField: Field = {
  name: "key",
  label: "Nyckel i adressen",
  type: "text",
  required: true,
  localized: false,
  admin: {
    description: 'Konfiguratorns adress pekar på familjen med den. Exempel: "reach-truck".',
  },
  validate: (value: unknown) =>
    typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : "Använd endast gemener, siffror och bindestreck.",
};

/** The fixed specifications, on the family and, overriding it, on a model. */
const specsField = (description: string): Field => ({
  name: "specs",
  label: "Specifikationer",
  type: "group",
  admin: { description },
  fields: TRUCK_SPECS.map((spec) => ({
    name: spec.name,
    label: "unit" in spec ? `${spec.label} (${spec.unit})` : spec.label,
    type: "text",
    localized: true,
    admin: "description" in spec ? { description: spec.description } : undefined,
  })),
});

const priceField: Field = {
  name: "price",
  label: "Pris",
  type: "number",
  min: 0,
  defaultValue: 0,
  required: true,
  admin: { description: 'Läggs till modellens pris. 0 visas som "Ingår".' },
};

const defaultField: Field = {
  name: "defaultSelected",
  label: "Förvalt",
  type: "checkbox",
  defaultValue: false,
};

/** A configurator step after the model: left empty, the configurator skips it. */
const stepField = (
  name: string,
  dbName: string,
  label: string,
  description: string,
  optionFields: Field[],
  extra: Field[] = [],
): Field => ({
  name,
  label,
  type: "group",
  admin: { description },
  fields: [
    ...extra,
    {
      name: "options",
      label: "Alternativ",
      dbName,
      type: "array",
      localized: false,
      admin: { initCollapsed: true },
      fields: [
        { name: "label", label: "Namn", type: "text", localized: true, required: true },
        ...optionFields,
      ],
    },
  ],
});

/**
 * A truck family (Figma's product category): the one place for its name, image and prices, which
 * the hero, the navigation, the product cards and the configurator read. Its fields follow Figma's
 * configurator: the **models**, then the battery, the lift height and the extras, each a step the
 * configurator skips when it is empty. See `docs/truck-data-schema.md`.
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
    group: ADMIN_GROUPS.configurator,
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
            keyField,
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
            specsField("Det som är lika för alla modeller. Ett tomt fält visas inte."),
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
                {
                  name: "label",
                  label: "Namn",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { description: 'Exempel: "1,8 ton".' },
                },
                {
                  name: "sku",
                  label: "Artikelnummer",
                  type: "text",
                  admin: { description: "Under namnet i konfiguratorn, och i offerten." },
                },
                { name: "price", label: "Pris", type: "number", required: true, min: 0 },
                {
                  name: "capacityKg",
                  label: "Lyftkapacitet (kg)",
                  type: "number",
                  min: 0,
                  admin: { description: "Produktkortet visar modellernas intervall." },
                },
                { ...defaultField, label: "Förvald" } as Field,
                specsField("Bara det som skiljer modellen från familjen."),
              ],
            },
          ],
        },
        {
          label: "Steg",
          description: "Konfiguratorns steg efter modellen. Ett steg utan alternativ hoppas över.",
          fields: [
            stepField("battery", "truck_batteries", "Batteri", "Ett val.", [
              { name: "description", label: "Text", type: "textarea", localized: true },
              priceField,
              defaultField,
            ]),
            stepField(
              "liftHeight",
              "truck_lift_heights",
              "Lyfthöjd",
              "Ett val. Mastens bygghöjd visas under namnet och i offerten.",
              [
                {
                  name: "buildHeight",
                  label: "Truckens bygghöjd (mm)",
                  type: "text",
                  admin: { description: "Med den här masten. Ersätter familjens bygghöjd." },
                },
                priceField,
                defaultField,
              ],
              [
                {
                  name: "help",
                  label: "Hjälptext",
                  type: "textarea",
                  localized: true,
                  admin: {
                    description:
                      'Under alternativen, följd av "Kontakta oss". Exempel: "Behöver du hjälp med andra mastalternativ?".',
                  },
                },
              ],
            ),
            stepField("extras", "truck_extras", "Tillval", "Flera val, inget krävs.", [
              { name: "description", label: "Text", type: "textarea", localized: true },
              { name: "image", label: "Bild", type: "upload", relationTo: "images" },
              priceField,
            ]),
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
