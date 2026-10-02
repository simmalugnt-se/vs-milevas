import type { GlobalConfig } from "payload";
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
      localized: false,
      fields: [link()],
      maxRows: 8,
      admin: {
        initCollapsed: true,
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
