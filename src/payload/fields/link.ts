import type { Field } from "payload";

export const link = (): Field => ({
  name: "link",
  type: "group",
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      name: "type",
      type: "radio",
      admin: {
        layout: "horizontal",
      },
      defaultValue: "internal",
      options: [
        { label: "Internal link", value: "internal" },
        { label: "External URL", value: "external" },
      ],
    },
    {
      name: "reference",
      type: "relationship",
      relationTo: ["pages"],
      required: true,
      label: "Document to link to",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "internal",
      },
    },
    {
      name: "url",
      type: "text",
      label: "URL",
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "external",
      },
    },
    {
      name: "label",
      type: "text",
      label: "Label",
      localized: true,
      required: true,
    },
    {
      name: "newTab",
      type: "checkbox",
      label: "Open in new tab",
    },
  ],
});
