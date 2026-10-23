import type { GlobalConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { link } from "@/payload/fields/link";
import { generateGlobalPreviewPath } from "@/payload/utilities/preview.ts";
import { revalidateFooter } from "./hooks/revalidate";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
  },
  admin: {
    group: ADMIN_GROUPS.globals,
    livePreview: {
      url: ({ req }) => generateGlobalPreviewPath({ global: "footer", req }),
    },
  },
  fields: [
    {
      name: "linkGroups",
      type: "array",
      label: "Link columns",
      maxRows: 2,
      admin: {
        initCollapsed: true,
        description: 'Figma: "Produkter" and "Tjänster". The contact column follows them.',
      },
      fields: [
        { name: "heading", type: "text", localized: true, required: true },
        {
          name: "source",
          type: "select",
          label: "The column's links",
          defaultValue: "links",
          options: [
            { label: "The links below", value: "links" },
            { label: "The truck families", value: "truckFamilies" },
          ],
          admin: {
            description:
              "The truck families: every published family in its order (Figma's Produkter).",
          },
        },
        {
          name: "links",
          type: "array",
          fields: [link()],
          admin: {
            initCollapsed: true,
            condition: (_, siblingData) => siblingData?.source !== "truckFamilies",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Contact column",
      fields: [
        {
          name: "contactHeading",
          type: "text",
          label: "Heading",
          localized: true,
          defaultValue: "Kontakt",
        },
        {
          name: "email",
          type: "email",
        },
        {
          name: "phone",
          type: "text",
          admin: { description: 'Shown as written, e.g. "08-123 45 67"; it links to the number.' },
        },
        {
          name: "location",
          type: "text",
          localized: true,
          admin: { description: 'Plain text, e.g. "Stockholm, Sverige".' },
        },
        {
          name: "socialLinks",
          type: "array",
          label: "Social links",
          admin: {
            description:
              "Shown in the Contact block after the e-mail and phone, which also come from here.",
          },
          fields: [
            { name: "label", type: "text", required: true, admin: { width: "50%" } },
            { name: "url", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
    {
      name: "copyright",
      type: "text",
      localized: true,
      defaultValue: "Milevas AB. Alla rättigheter förbehållna.",
      admin: { description: 'After "© year" at the bottom.' },
    },
    {
      name: "navItems",
      type: "array",
      label: "Links (not shown)",
      localized: false,
      fields: [link()],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        description:
          "The old footer's links. Figma's footer has link columns instead, so they are not shown.",
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
      schedulePublish: true,
    },
    max: 50,
  },
};
