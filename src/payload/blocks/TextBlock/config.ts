import type { Block } from "payload";
import { sectionID } from "../milevas-fields";

export const TextBlockBlock: Block = {
  slug: "textBlock",
  labels: { singular: "Milevas: Text med pil", plural: "Milevas: Text med pil" },
  fields: [
    sectionID,
    {
      name: "text",
      label: "Text",
      type: "textarea",
      required: true,
      localized: true,
      admin: { description: "Den stora texten bredvid pilen." },
    },
    {
      name: "paragraph",
      label: "Brödtext",
      type: "textarea",
      localized: true,
      admin: { description: "Valfri, under texten." },
    },
  ],
};
