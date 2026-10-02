import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { revalidateImages, revalidateImagesDelete } from "./hooks/revalidate.ts";

/** Images only; videos are their own collection (`videos`), played through Mux. */
export const Images: CollectionConfig = {
  slug: "images",
  labels: { singular: "Image", plural: "Images" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["filename", "alt", "updatedAt"],
    group: ADMIN_GROUPS.content,
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
    },
    {
      name: "credit",
      type: "text",
      localized: true,
    },
  ],
  hooks: {
    afterChange: [revalidateImages],
    afterDelete: [revalidateImagesDelete],
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "card",
        width: 900,
      },
      {
        name: "thumbnail",
        width: 480,
      },
    ],
  },
};
