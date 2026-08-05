import type { CollectionConfig } from "payload";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { layoutBlocks } from "../../blocks/index.ts";
import { slugField } from "../../fields/slug.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { generatePreviewPath } from "../../utilities/preview.ts";
import { revalidateCollection, revalidateCollectionDelete } from "./hooks/revalidate.ts";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "Content",
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: "pages",
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: "pages",
        req,
      }),
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: false,
    },
    {
      name: "publishedAt",
      type: "date",
      localized: false,
      admin: {
        position: "sidebar",
      },
    },
    slugField({ localized: false }),
    {
      name: "layout",
      type: "blocks",
      blocks: layoutBlocks,
      localized: false,
    },
  ],
  hooks: {
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
