import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "media",
  fields: [
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "caption",
      type: "textarea",
      localized: true,
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full width", value: "full" },
        { label: "Inset", value: "inset" },
        { label: "Split", value: "split" },
      ],
      required: true,
    },
  ],
};
