import type { GlobalConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { link } from "@/payload/fields/link";
import { generateGlobalPreviewPath } from "@/payload/utilities/preview.ts";
import { revalidateFooter } from "./hooks/revalidate";

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Sidfot",
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
      label: "Länkkolumner",
      labels: { singular: "Länkkolumn", plural: "Länkkolumner" },
      maxRows: 2,
      admin: {
        initCollapsed: true,
        description: "Kontaktkolumnen kommer efter dem.",
      },
      fields: [
        { name: "heading", label: "Rubrik", type: "text", localized: true, required: true },
        {
          name: "source",
          type: "select",
          label: "Kolumnens länkar",
          defaultValue: "links",
          options: [
            { label: "Länkarna nedan", value: "links" },
            { label: "Trucktyperna", value: "truckFamilies" },
          ],
          admin: {
            description: "Trucktyperna: varje publicerad trucktyp i sin ordning.",
          },
        },
        {
          name: "links",
          label: "Länkar",
          labels: { singular: "Länk", plural: "Länkar" },
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
      label: "Kontaktkolumn",
      fields: [
        {
          name: "contactHeading",
          type: "text",
          label: "Rubrik",
          localized: true,
          defaultValue: "Kontakt",
        },
        {
          name: "email",
          label: "E-post",
          type: "email",
        },
        {
          name: "phone",
          label: "Telefon",
          type: "text",
          admin: {
            description:
              'Visas som det är skrivet, till exempel "08-123 45 67", och länkar till numret.',
          },
        },
        {
          name: "location",
          label: "Ort",
          type: "text",
          localized: true,
          admin: { description: 'Till exempel "Stockholm, Sverige".' },
        },
        {
          name: "socialLinks",
          type: "array",
          label: "Sociala länkar",
          labels: { singular: "Social länk", plural: "Sociala länkar" },
          admin: {
            description:
              "Visas i Kontakt-blocket efter e-post och telefon, som också hämtas härifrån.",
          },
          fields: [
            { name: "label", label: "Text", type: "text", required: true, admin: { width: "50%" } },
            { name: "url", label: "Adress", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
    {
      name: "copyright",
      label: "Upphovsrätt",
      type: "text",
      localized: true,
      defaultValue: "Milevas AB. Alla rättigheter förbehållna.",
      admin: { description: 'Efter "© år" längst ner.' },
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
