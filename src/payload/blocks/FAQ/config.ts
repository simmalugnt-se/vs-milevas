import type { Block } from "payload";

export const FAQBlock: Block = {
  slug: "faq",
  labels: { singular: "Vanliga frågor", plural: "Vanliga frågor" },
  fields: [
    { name: "heading", label: "Rubrik", type: "text", localized: true },
    {
      name: "items",
      label: "Frågor",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Fråga", plural: "Frågor" },
      fields: [
        { name: "question", label: "Fråga", type: "text", required: true, localized: true },
        { name: "answer", label: "Svar", type: "textarea", required: true, localized: true },
      ],
    },
  ],
};
