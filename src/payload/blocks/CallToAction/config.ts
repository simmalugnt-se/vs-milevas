import type { Block } from "payload";
import { link } from "../../fields/link.ts";

export const CallToActionBlock: Block = {
  slug: "callToAction",
  labels: { singular: "Uppmaning", plural: "Uppmaningar" },
  fields: [
    { name: "title", label: "Rubrik", type: "text", required: true, localized: true },
    { name: "text", label: "Text", type: "textarea", localized: true },
    {
      name: "button",
      label: "Knapp",
      type: "group",
      fields: [link()],
    },
  ],
};
