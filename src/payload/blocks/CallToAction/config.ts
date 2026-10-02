import type { Block } from "payload";
import { link } from "../../fields/link.ts";

export const CallToActionBlock: Block = {
  slug: "callToAction",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "text", type: "textarea", localized: true },
    {
      name: "button",
      type: "group",
      fields: [link()],
    },
  ],
};
