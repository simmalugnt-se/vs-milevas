import type { CollectionConfig, Where } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { layoutBlocks, pickerBlockSlugs } from "../../blocks/index.ts";
import { slugField } from "../../fields/slug.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { pageAddress } from "../../utilities/page-path.ts";
import { generatePreviewPath } from "../../utilities/preview.ts";
import {
  rememberChildren,
  setPagePath,
  updateChildPaths,
  updateOrphanPaths,
} from "./hooks/page-path.ts";
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
    defaultColumns: ["title", "path", "updatedAt"],
    group: ADMIN_GROUPS.content,
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: pageAddress(data),
          collection: "pages",
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: pageAddress(data),
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
      name: "parent",
      label: "Överordnad sida",
      type: "relationship",
      relationTo: "pages",
      // Not the page itself nor the start page, which is the site's root.
      filterOptions: ({ id }): Where => ({
        and: [{ slug: { not_equals: "home" } }, ...(id ? [{ id: { not_equals: id } }] : [])],
      }),
      admin: {
        position: "sidebar",
        description: "Sidans adress börjar med den överordnade sidans.",
        condition: (data) => data?.slug !== "home",
      },
    },
    {
      // Set from the parent and the slug on save (`setPagePath`).
      name: "path",
      label: "Hela adressen",
      type: "text",
      index: true,
      localized: false,
      admin: { position: "sidebar", readOnly: true },
    },
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
      // Blocks already on the page stay valid, so that older content can still be saved.
      filterOptions: ({ data }) => [
        ...new Set([
          ...pickerBlockSlugs,
          ...((data?.layout ?? []) as { blockType: string }[]).map((block) => block.blockType),
        ]),
      ],
      localized: false,
    },
  ],
  hooks: {
    afterChange: [
      ...(redirectsEnabled ? [redirectOldSlug] : []),
      revalidateCollection,
      updateChildPaths,
    ],
    afterDelete: [revalidateCollectionDelete, updateOrphanPaths],
    beforeChange: [
      populatePublishedAt,
      setPagePath,
      ...(redirectsEnabled ? [rememberPublishedSlug] : []),
    ],
    beforeDelete: [rememberChildren],
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
