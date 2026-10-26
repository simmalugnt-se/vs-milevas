import type { Block } from "payload";

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Galleri", plural: "Gallerier" },
  fields: [
    {
      name: "images",
      label: "Bilder",
      type: "upload",
      relationTo: "images",
      hasMany: true,
      required: true,
      minRows: 1,
      maxRows: 8,
    },
  ],
};
