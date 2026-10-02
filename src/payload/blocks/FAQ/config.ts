import type { Block } from "payload";

export const FAQBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQs" },
  fields: [
    { name: "heading", type: "text", localized: true },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      fields: [
        { name: "question", type: "text", required: true, localized: true },
        { name: "answer", type: "textarea", required: true, localized: true },
      ],
    },
  ],
};
