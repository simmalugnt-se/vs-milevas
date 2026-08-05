import type { CollectionConfig } from "payload";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { revalidateDocuments, revalidateDocumentsDelete } from "./hooks/revalidate.ts";

export const Documents: CollectionConfig = {
  slug: "documents",
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["title", "filename", "updatedAt"],
    group: "Content",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
  ],
  hooks: {
    afterChange: [revalidateDocuments],
    afterDelete: [revalidateDocumentsDelete],
  },
  upload: {
    filesRequiredOnCreate: true,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/plain",
    ],
  },
};
