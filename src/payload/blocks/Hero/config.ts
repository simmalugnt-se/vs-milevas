import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
  ],
};
