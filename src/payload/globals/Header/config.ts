import type { GlobalConfig, GroupField } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { link } from "@/payload/fields/link";
import { generateGlobalPreviewPath } from "@/payload/utilities/preview.ts";
import { revalidateHeader } from "./hooks/revalidate";

export const Header: GlobalConfig = {
  slug: "header",
  label: "Sidhuvud",
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
      name: "navItems",
      type: "array",
      label: "Menyer",
      labels: { singular: "Meny", plural: "Menyer" },
      localized: false,
      fields: [
        {
          ...(link({ required: false, labelRequired: true }) as GroupField),
          admin: {
            hideGutter: true,
            description:
              'Menyns namn, till exempel "Modeller". Länken används bara när menyn saknar länkar.',
          },
        },
        {
          name: "source",
          type: "select",
          label: "Menyns länkar",
          defaultValue: "links",
          options: [
            { label: "Länkarna nedan", value: "links" },
            { label: "Trucktyperna", value: "truckFamilies" },
          ],
          admin: {
            description:
              "Trucktyperna: varje publicerad trucktyp i sin ordning, med namn och huvudbild.",
          },
        },
        {
          name: "links",
          type: "array",
          label: "Länkar i menyn",
          labels: { singular: "Länk", plural: "Länkar" },
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
              label: "Bild när länken pekas på",
              admin: {
                description: "På desktop: ersätter menyns bild medan länken pekas på.",
              },
            },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "images",
          label: "Bild",
          admin: {
            description:
              "Den fyrkantiga bilden bredvid den öppna menyn (desktop och surfplatta). Visas inte för trucktyperna; där är rutan tom tills en trucktyp pekas på.",
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
      label: "Inloggningslänk",
      admin: { hideGutter: true },
      fields: [
        link({ required: false }),
        {
          name: "shortLabel",
          type: "text",
          label: "Kort text",
          localized: true,
          admin: {
            description:
              'På smalare skärmar än Desktop S, till exempel "Logga in" för "Återförsäljare: logga in".',
          },
        },
      ],
    },
    {
      name: "showAnnouncement",
      type: "checkbox",
      label: "Visa meddelandefält",
    },
    {
      type: "collapsible",
      label: "Meddelandefält",
      admin: {
        condition: (data) => Boolean(data?.showAnnouncement),
        initCollapsed: true,
      },
      fields: [
        {
          name: "announcement",
          type: "text",
          label: "Meddelande",
          localized: true,
          required: true,
        },
        link({ name: "announcementLink", label: "Meddelandets länk" }),
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
