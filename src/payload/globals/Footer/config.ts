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
      name: "copyright",
      type: "text",
      localized: true,
      defaultValue: "Milevas",
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
      name: "email",
      type: "email",
      admin: {
        description: "The mail icon links to this address.",
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
