import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
// Content health and the editor assistant are installed but off for now; see their blocks below.
// import { contentHealthPlugin } from "@simmalugnt-se/payload-content-health";
// import { editorAssistantPlugin } from "@simmalugnt-se/payload-editor-assistant";
import { muxPlugin } from "@simmalugnt-se/payload-mux";
import { visualEditingPlugin } from "@simmalugnt-se/payload-visual-editing";
import type { CollectionConfig, Plugin } from "payload";
import { routing } from "@/i18n/routing";
import { isAuthenticated } from "@/payload/access/isAuthenticated.ts";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import {
  revalidateRedirectDelete,
  revalidateRedirects,
} from "@/payload/hooks/revalidateRedirects.ts";
import { revalidateVideos, revalidateVideosDelete } from "@/payload/hooks/revalidateVideos.ts";
import {
  getDocumentDescription,
  getDocumentImage,
  getDocumentTitle,
  getDocumentURL,
} from "@/payload/utilities/seo.ts";

// import { assistantModel, assistantModelProblem, assistantModelWarning } from "./assistant-model.ts";

const disableMcpSse = process.env.PAYLOAD_MCP_DISABLE_SSE === "true";
// The editor assistant has no key of its own; it calls the model chosen in assistant-model.ts.
// const assistantProblem = assistantModelProblem() ?? assistantModelWarning();
// if (assistantProblem) {
//   console.warn(`[editor-assistant] ${assistantProblem}`);
// }

export const cmsPlugins: Plugin[] = [
  // Before MCP, which lists the videos collection. The collection stays when Mux is off, so the
  // schema and migrations do not depend on it.
  muxPlugin({
    enabled: process.env.PAYLOAD_MUX_ENABLED !== "false",
    posterCollection: "images",
    overrideCollection: (collection) => ({
      ...collection,
      admin: { ...collection.admin, group: ADMIN_GROUPS.content },
      hooks: {
        ...collection.hooks,
        afterChange: [...(collection.hooks?.afterChange ?? []), revalidateVideos],
        afterDelete: [...(collection.hooks?.afterDelete ?? []), revalidateVideosDelete],
      },
    }),
  }),
  redirectsPlugin({
    collections: ["pages"],
    overrides: {
      admin: { group: ADMIN_GROUPS.settings },
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
    uploadsCollection: "images",
  }),
  mcpPlugin({
    // Keep its API-key collection in every environment, but do not register endpoints when off.
    disabled: process.env.PAYLOAD_MCP_ENABLED === "false",
    mcp: {
      handlerOptions: {
        disableSse: disableMcpSse,
      },
    },
    overrideApiKeyCollection: (collection) =>
      ({
        ...collection,
        admin: {
          ...collection.admin,
          group: ADMIN_GROUPS.settings,
          hidden: process.env.PAYLOAD_MCP_ENABLED === "false",
        },
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
      images: {
        enabled: true,
        description: "Images for the site, with alt texts",
      },
      videos: {
        enabled: true,
        description: "Videos for the site, played through Mux",
      },
    },
  }),
  // Off for now. To turn on: uncomment this and its import, then pnpm generate:importmap.
  // contentHealthPlugin({
  //   collections: {
  //     pages: {
  //       seo: true,
  //       // Localized text filled in English but empty in Swedish; the assistant translates it.
  //       translations: true,
  //       content: {
  //         field: "layout",
  //         // Levels as the block components render them; rich text headings count by their tag.
  //         headings: {
  //           hero: { headline: 1 },
  //           cards: { heading: 2, "items.title": 3 },
  //           faq: { heading: 2 },
  //           callToAction: { title: 2 },
  //         },
  //       },
  //     },
  //     images: { altText: true },
  //     // A video's description is its text alternative, as an alt text is for an image.
  //     videos: { videoDescription: true },
  //   },
  // }),
  visualEditingPlugin({ collections: ["pages"], globals: ["header", "footer"] }),
  // Off for now. To turn on: uncomment this, its imports and the model check above, then pnpm
  // generate:importmap and pnpm db:migrate:create for its tables.
  // editorAssistantPlugin({
  //   // Without a model the plugin stays installed, so its tables stay in the schema and
  //   // migrations, and the assistant reports that it has no model instead of calling one.
  //   model: () => assistantModel(),
  //   // Project rules the assistant cannot infer from the schema.
  //   instructions: [
  //     'The start page (home page, "startsida") is the page with slug "home"; the site renders it at "/". Never give any other page the slug "home".',
  //     'When the editor asks to create the start page, use slug "home". If a page with slug "home" already exists, do not create another; offer to open it instead.',
  //   ].join("\n"),
  //   collections: {
  //     pages: {
  //       capabilities: [
  //         "content.find",
  //         "content.findById",
  //         "form.read",
  //         "form.propose",
  //         "draft.create",
  //         // Batches from the content health work list: meta titles, descriptions, translations.
  //         "content.update",
  //       ],
  //     },
  //     // It looks at images (media.view) to write alt texts, and searches them (content.find) to
  //     // pick one for an upload field, such as a page's share image.
  //     images: {
  //       capabilities: [
  //         "content.find",
  //         "content.findById",
  //         "form.read",
  //         "form.propose",
  //         "media.view",
  //         // Alt texts for many images at once from the work list, saved directly: images have no drafts.
  //         "content.update",
  //       ],
  //     },
  //   },
  //   // Content health's findings and work list as tools: "what should I fix first?".
  //   extensions: { "content-health": true },
  //   globals: {
  //     header: { capabilities: ["content.findById", "form.read", "form.propose"] },
  //     footer: { capabilities: ["content.findById", "form.read", "form.propose"] },
  //   },
  //   shortcuts: [
  //     {
  //       id: "summarize",
  //       label: "Summarize",
  //       prompt: "Summarize this page.",
  //       when: ["document", "global"],
  //     },
  //     {
  //       id: "explain-title",
  //       label: "Explain title",
  //       prompt: "What is the Title field for?",
  //       when: ["document"],
  //       entities: ["pages"],
  //     },
  //     {
  //       id: "draft-page",
  //       label: "New page draft",
  //       prompt: "Create a simple page draft I can start from.",
  //       when: ["list", "dashboard"],
  //       entities: ["pages"],
  //     },
  //   ],
  // }),
];
