import type { Field } from "payload";

/** An anchor as a block's id: lowercase letters, digits and hyphens, starting with a letter. */
export const validateAnchor = (value: unknown) =>
  !value || (typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value))
    ? true
    : "Använd gemener, siffror och bindestreck; börja med en bokstav.";

/**
 * `required: false` lets the link's target be left empty, e.g. a menu that only opens its links;
 * `labelRequired` defaults to `required`.
 */
export const link = ({
  name = "link",
  label = "Länk",
  required = true,
  labelRequired = required,
}: {
  name?: string;
  label?: string;
  required?: boolean;
  labelRequired?: boolean;
} = {}): Field => ({
  name,
  label,
  type: "group",
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      name: "type",
      label: "Typ",
      type: "radio",
      admin: {
        layout: "horizontal",
      },
      defaultValue: "internal",
      options: [
        { label: "Intern länk", value: "internal" },
        { label: "Extern adress", value: "external" },
      ],
    },
    {
      name: "reference",
      type: "relationship",
      relationTo: ["pages"],
      required,
      label: "Sida att länka till",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "internal",
      },
    },
    {
      name: "anchor",
      type: "text",
      label: "Del av sidan",
      admin: {
        description: 'Valfritt: ankaret på ett block på sidan, utan #. Exempel: "kontakt".',
        condition: (_, siblingData) => siblingData?.type === "internal",
      },
      validate: validateAnchor,
    },
    {
      name: "url",
      type: "text",
      label: "Adress",
      required,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "external",
      },
    },
    {
      name: "label",
      type: "text",
      label: "Text",
      localized: true,
      required: labelRequired,
    },
    {
      name: "newTab",
      type: "checkbox",
      label: "Öppna i ny flik",
    },
  ],
});
