import type { CollectionConfig } from "payload";
import { getMediaPosterURL } from "@/payload/utilities/media";
import type { Media as MediaDocument } from "@/payload-types";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { muxField } from "../../fields/mux/index.ts";
import { revalidateMedia, revalidateMediaDelete } from "./hooks/revalidate.ts";
import { validateMediaSource } from "./hooks/validateMediaSource.ts";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["filename", "alt", "muxVideo"],
    group: "Content",
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
    muxField({ localized: true }),
  ],
  hooks: {
    afterChange: [revalidateMedia],
    afterDelete: [revalidateMediaDelete],
    beforeValidate: [validateMediaSource],
  },
  upload: {
    adminThumbnail: ({ doc }) => getMediaPosterURL(doc as unknown as MediaDocument),
    filesRequiredOnCreate: false,
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
