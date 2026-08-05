import type { GlobalConfig } from "payload";
import { link } from "@/payload/fields/link";
import { revalidateFooter } from "./hooks/revalidate";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "copyright",
      type: "text",
      localized: true,
      defaultValue: "Payload Boilerplate",
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
