import type { GlobalConfig, GroupField } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { link } from "@/payload/fields/link";
import { generateGlobalPreviewPath } from "@/payload/utilities/preview.ts";
import { revalidateHeader } from "./hooks/revalidate";

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: () => true,
  },
  admin: {
    group: ADMIN_GROUPS.globals,
    livePreview: {
      url: ({ req }) => generateGlobalPreviewPath({ global: "header", req }),
    },
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      localized: false,
      defaultValue: "Milevas",
    },
    {
      name: "siteTagline",
      type: "text",
      localized: true,
      defaultValue: "Boilerplate for Payload CMS and Next.js.",
    },
    {
      name: "navItems",
      type: "array",
      label: "Menus",
      localized: false,
      fields: [
        {
          ...(link({ required: false, labelRequired: true }) as GroupField),
          admin: {
            hideGutter: true,
            description:
              'The menu\'s label, e.g. "Modeller". The link is used only when the menu has no links.',
          },
        },
        {
          name: "source",
          type: "select",
          label: "The menu's links",
          defaultValue: "links",
          options: [
            { label: "The links below", value: "links" },
            { label: "The truck families", value: "truckFamilies" },
          ],
          admin: {
            description:
              "The truck families: every published family in its order, with its name and main image (Figma's Modeller).",
          },
        },
        {
          name: "links",
          type: "array",
          label: "Links in the menu",
          admin: {
            initCollapsed: true,
            condition: (_, siblingData) => siblingData?.source !== "truckFamilies",
          },
          fields: [
            link(),
            {
              name: "image",
              type: "upload",
              relationTo: "images",
              label: "Image while pointed at",
              admin: {
                description: "Desktop: replaces the menu's image while the link is pointed at.",
              },
            },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "images",
          label: "Image",
          admin: {
            description:
              "The square image beside the open menu (Desktop and Tablet). Not shown for the truck families: there the square is empty until a family is pointed at.",
          },
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: "login",
      type: "group",
      label: "Login link",
      admin: { hideGutter: true },
      fields: [
        link({ required: false }),
        {
          name: "shortLabel",
          type: "text",
          label: "Short label",
          localized: true,
          admin: {
            description: 'Below Desktop S, e.g. "Login" for "Dealer login".',
          },
        },
      ],
    },
    {
      ...(link({ name: "cta", required: false }) as GroupField),
      label: "Button (not shown)",
      admin: {
        hideGutter: true,
        description:
          "The old navigation's button (\"Bygg din truck\"). Figma's navigation has none, so it is not shown.",
      },
    },
    {
      name: "showAnnouncement",
      type: "checkbox",
      label: "Show announcement bar",
    },
    {
      type: "collapsible",
      label: "Announcement bar",
      admin: {
        condition: (data) => Boolean(data?.showAnnouncement),
        initCollapsed: true,
      },
      fields: [
        {
          name: "announcement",
          type: "text",
          label: "Message",
          localized: true,
          required: true,
        },
        link({ name: "announcementLink" }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
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
