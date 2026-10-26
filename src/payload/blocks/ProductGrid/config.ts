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
      labels: { singular: "Truckkort", plural: "Truckkort" },
      type: "array",
      admin: {
        description:
          "Ett kort per trucktyp; namn, bild, specifikationer, priser och länk kommer från trucktypen.",
      },
      required: true,
      minRows: 1,
      fields: [{ ...familyField, required: true }],
    },
  ],
};
