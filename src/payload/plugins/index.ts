import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import type { CollectionConfig, Plugin } from "payload";
import { routing } from "@/i18n/routing";
import { isAuthenticated } from "@/payload/access/isAuthenticated.ts";
import {
  revalidateRedirectDelete,
  revalidateRedirects,
} from "@/payload/hooks/revalidateRedirects.ts";
import {
  getDocumentDescription,
  getDocumentImage,
  getDocumentTitle,
  getDocumentURL,
} from "@/payload/utilities/seo.ts";

const disableMcpSse = process.env.PAYLOAD_MCP_DISABLE_SSE === "true";

export const cmsPlugins: Plugin[] = [
  redirectsPlugin({
    collections: ["pages"],
    overrides: {
      hooks: {
        afterChange: [revalidateRedirects],
        afterDelete: [revalidateRedirectDelete],
      },
    },
  }),
  seoPlugin({
    collections: ["pages"],
    generateDescription: ({ doc }) => getDocumentDescription(doc),
    generateImage: ({ doc }) => getDocumentImage(doc) ?? "",
    generateTitle: ({ doc }) => getDocumentTitle(doc),
    generateURL: ({ collectionConfig, doc }) =>
      getDocumentURL(doc, routing.defaultLocale, collectionConfig?.slug),
    tabbedUI: true,
    uploadsCollection: "media",
  }),
  mcpPlugin({
    mcp: {
      handlerOptions: {
        disableSse: disableMcpSse,
      },
    },
    overrideApiKeyCollection: (collection) =>
      ({
        ...collection,
        access: {
          ...collection.access,
          admin: isAuthenticated,
          create: isAuthenticated,
          delete: isAuthenticated,
          read: isAuthenticated,
          update: isAuthenticated,
        },
      }) as CollectionConfig,
    collections: {
      pages: {
        enabled: true,
        description: "Marketing and content pages with flexible layout blocks and SEO metadata",
      },
      media: {
        enabled: true,
        description: "Images and Mux-backed video metadata for the site",
      },
    },
  }),
];
