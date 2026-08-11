import type { GlobalConfig } from "payload";
import { link } from "@/payload/fields/link";
import { revalidateHeader } from "./hooks/revalidate";

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: () => true,
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
