import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "media",
  labels: { singular: "Bild eller video", plural: "Bilder och videor" },
  fields: [
    {
      name: "media",
      label: "Bild eller video",
      type: "upload",
      relationTo: ["images", "videos"],
      required: true,
    },
    {
      name: "caption",
      label: "Bildtext",
      type: "textarea",
      localized: true,
    },
    {
      name: "layout",
      label: "Placering",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full bredd", value: "full" },
        { label: "Indragen", value: "inset" },
        { label: "Delad", value: "split" },
      ],
      required: true,
    },
  ],
};
