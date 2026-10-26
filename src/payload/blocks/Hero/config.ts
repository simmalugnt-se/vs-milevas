import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heros" },
  fields: [
    {
      name: "headline",
      label: "Rubrik",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "summary",
      label: "Ingress",
      type: "textarea",
      localized: true,
    },
    {
      name: "media",
      label: "Bild eller video",
      type: "upload",
      relationTo: ["images", "videos"],
    },
  ],
};
