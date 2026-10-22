import type { Field } from "payload";

/**
 * `required: false` lets the link's target be left empty, e.g. a menu that only opens its links;
 * `labelRequired` defaults to `required`.
 */
export const link = ({
  name = "link",
  required = true,
  labelRequired = required,
}: {
  name?: string;
  required?: boolean;
  labelRequired?: boolean;
} = {}): Field => ({
  name,
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
      required,
      label: "Document to link to",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "internal",
      },
    },
    {
      name: "url",
      type: "text",
      label: "URL",
      required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "external",
      },
    },
    {
      name: "label",
      type: "text",
      label: "Label",
      localized: true,
      required: labelRequired,
    },
    {
      name: "newTab",
      type: "checkbox",
      label: "Open in new tab",
    },
  ],
});
