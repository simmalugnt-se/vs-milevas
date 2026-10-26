import type { Block } from "payload";
import { link } from "../../fields/link.ts";

export const CardsBlock: Block = {
  slug: "cards",
  labels: { singular: "Kortlista", plural: "Kortlistor" },
  fields: [
    { name: "heading", label: "Rubrik", type: "text", localized: true },
    {
      name: "items",
      label: "Kort",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Kort", plural: "Kort" },
      fields: [
        { name: "title", label: "Titel", type: "text", required: true, localized: true },
        { name: "text", label: "Text", type: "textarea", localized: true },
        link(),
      ],
    },
  ],
};
