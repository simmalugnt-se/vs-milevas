import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { layoutBlocks } from "../../blocks/index.ts";
import { slugField } from "../../fields/slug.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { generatePreviewPath } from "../../utilities/preview.ts";
import {
  redirectOldSlug,
  redirectsEnabled,
  rememberPublishedSlug,
} from "./hooks/redirect-old-slug.ts";
import { revalidateCollection, revalidateCollectionDelete } from "./hooks/revalidate.ts";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Sida", plural: "Sidor" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    group: ADMIN_GROUPS.content,
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
      label: "Titel",
      type: "text",
      required: true,
      localized: false,
    },
    {
      name: "publishedAt",
      label: "Publicerad",
      type: "date",
      localized: false,
      admin: {
        position: "sidebar",
      },
    },
    slugField({ localized: false }),
    {
      name: "background",
      label: "Bakgrund",
      type: "select",
      defaultValue: "dark",
      options: [
        { label: "Mörk", value: "dark" },
        { label: "Ljusgrå", value: "light" },
      ],
      admin: {
        position: "sidebar",
        description: "Sidan bakom blocken; den syns i mellanrummen mellan dem och runt sidfoten.",
      },
    },
    {
      name: "layout",
      label: "Innehåll",
      labels: { singular: "Block", plural: "Block" },
      type: "blocks",
      blocks: layoutBlocks,
      localized: false,
    },
  ],
  hooks: {
    afterChange: [...(redirectsEnabled ? [redirectOldSlug] : []), revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
    beforeChange: [populatePublishedAt, ...(redirectsEnabled ? [rememberPublishedSlug] : [])],
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
