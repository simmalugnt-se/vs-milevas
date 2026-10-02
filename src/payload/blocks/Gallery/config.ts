import type { Block } from "payload";

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Gallery", plural: "Galleries" },
  fields: [
    {
      name: "images",
      type: "upload",
      relationTo: "images",
      hasMany: true,
      required: true,
      minRows: 1,
      maxRows: 8,
    },
  ],
};
