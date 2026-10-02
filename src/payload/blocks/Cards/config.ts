import type { Block } from "payload";
import { link } from "../../fields/link.ts";

export const CardsBlock: Block = {
  slug: "cards",
  labels: { singular: "Card list", plural: "Card lists" },
  fields: [
    { name: "heading", type: "text", localized: true },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Card", plural: "Cards" },
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        { name: "text", type: "textarea", localized: true },
        link(),
      ],
    },
  ],
};
