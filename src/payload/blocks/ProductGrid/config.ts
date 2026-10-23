import type { Block } from "payload";
import { familyField, sectionID } from "../milevas-fields";

export const ProductGridBlock: Block = {
  slug: "productGrid",
  labels: { singular: "Milevas: Produktgrid", plural: "Milevas: Produktgrid" },
  fields: [
    sectionID,
    {
      name: "label",
      label: "Listans namn",
      type: "text",
      required: true,
      localized: true,
      defaultValue: "Modeller",
    },
    { name: "brand", label: "Varumärke", type: "text", localized: true, defaultValue: "Baoli" },
    {
      name: "category",
      label: "Kategori",
      type: "text",
      localized: true,
      defaultValue: "Modeller",
    },
    {
      name: "products",
      label: "Truckkort",
      type: "array",
      admin: {
        description:
          "Ett kort per truckfamilj; namn, bild, specifikationer, priser och länk kommer från familjen.",
      },
      required: true,
      minRows: 1,
      fields: [
        { ...familyField, required: true },
        {
          name: "imageFit",
          label: "Bildpassning",
          type: "select",
          defaultValue: "contain",
          options: [
            { label: "Visa hela bilden", value: "contain" },
            { label: "Fyll bildytan", value: "cover" },
            { label: "Eget utsnitt", value: "crop" },
          ],
        },
        {
          name: "imageCrop",
          label: "Bildutsnitt",
          type: "group",
          admin: { condition: (_, item) => item?.imageFit === "crop" },
          fields: [
            {
              name: "width",
              label: "Bredd (%)",
              type: "number",
              min: 1,
              max: 300,
              defaultValue: 100,
            },
            {
              name: "height",
              label: "Höjd (%)",
              type: "number",
              min: 1,
              max: 300,
              defaultValue: 100,
            },
            {
              name: "left",
              label: "Vågrät position (%)",
              type: "number",
              min: -200,
              max: 200,
              defaultValue: 0,
            },
            {
              name: "top",
              label: "Lodrät position (%)",
              type: "number",
              min: -200,
              max: 200,
              defaultValue: 0,
            },
          ],
        },
      ],
    },
  ],
};
