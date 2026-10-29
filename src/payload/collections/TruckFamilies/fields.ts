import type { ArrayField, Field } from "payload";

const ROW_LABELS = "/payload/collections/TruckFamilies/RowLabels.tsx";

/**
 * Specifications as rows of a heading and a value, on a truck type, a model and an option. The
 * quote lists the truck type's, then the model's and the chosen options': a row with a heading
 * already listed replaces its value there, a new heading is added last (`resolveSpecifications`).
 */
export const specsField = ({
  dbName,
  description,
}: {
  dbName: string;
  description?: string;
}): ArrayField => ({
  name: "specs",
  label: "Specifikationer",
  labels: { singular: "Specifikation", plural: "Specifikationer" },
  type: "array",
  dbName,
  localized: false,
  admin: {
    description,
    initCollapsed: true,
    components: { RowLabel: `${ROW_LABELS}#SpecRowLabel` },
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "label",
          label: "Rubrik",
          type: "text",
          localized: true,
          required: true,
          admin: { width: "50%", description: 'Till exempel "Vikt".' },
        },
        {
          name: "value",
          label: "Värde",
          type: "text",
          localized: true,
          required: true,
          admin: { width: "50%", description: 'Med enhet, till exempel "3 293 kg".' },
        },
      ],
    },
  ],
});

/** For a name that may be too long for its box; `hyphenate` in the configurator's data reads it. */
export const HYPHEN_HINT = 'Skriv | där ordet får delas, till exempel "Motvikts|truckar".';

/** An option's own fields: name, price, text and photo. */
export const optionFields = (): Field[] => [
  {
    type: "row",
    fields: [
      {
        name: "label",
        label: "Namn",
        type: "text",
        localized: true,
        required: true,
        admin: { width: "50%", description: HYPHEN_HINT },
      },
      {
        name: "price",
        label: "Pris",
        type: "number",
        min: 0,
        defaultValue: 0,
        required: true,
        admin: { width: "50%", description: '0 visas som "Ingår".' },
      },
    ],
  },
  { name: "description", label: "Text", type: "textarea", localized: true },
  {
    name: "image",
    label: "Bild",
    type: "upload",
    relationTo: "images",
    admin: {
      description: "Valfri. Har något alternativ i gruppen en bild visas steget med bilder.",
    },
  },
];
