import type { Block } from "payload";
import { coloredHeadingField } from "@/payload/fields/colored-heading";
import { sectionID } from "../milevas-fields";

export const TextColumnsBlock: Block = {
  slug: "textColumns",
  labels: { singular: "Milevas: Text och logotyper", plural: "Milevas: Text och logotyper" },
  fields: [
    sectionID,
    coloredHeadingField({
      description:
        'Står i följd, även över flera stycken. Exempel: "Ett varumärke inom" och gult "KION Group".',
    }),
    { name: "text", label: "Text", type: "textarea", localized: true },
    {
      name: "logos",
      label: "Logotyper",
      labels: { singular: "Logotyp", plural: "Logotyper" },
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: {
        description: "En kolumn per logotyp.",
      },
      fields: [
        { name: "image", label: "Bild", type: "upload", relationTo: "images", required: true },
        { name: "name", label: "Namn", type: "text", required: true },
        {
          name: "width",
          label: "Bredd på desktop",
          type: "number",
          defaultValue: 120,
          min: 40,
          max: 400,
          admin: {
            description: "I px vid 1440 bred skärm. Mobil och surfplatta använder 60 och 90.",
          },
        },
      ],
    },
  ],
};
