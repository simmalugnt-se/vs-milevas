import type { Block } from "payload";
import { link } from "../../fields/link";
import { sectionID } from "../milevas-fields";

export const ImageTextBlock: Block = {
  slug: "imageText",
  labels: { singular: "Milevas: Bild och text", plural: "Milevas: Bild och text" },
  fields: [
    sectionID,
    {
      name: "image",
      label: "Bild",
      type: "upload",
      relationTo: "images",
      required: true,
      admin: { description: "Fyller hela blocket under ett mörkt lager; beskärs efter skärmen." },
    },
    { name: "heading", label: "Rubrik", type: "textarea", required: true, localized: true },
    { name: "text", label: "Brödtext", type: "textarea", localized: true },
    { name: "showButton", label: "Visa knapp", type: "checkbox", defaultValue: true },
    {
      type: "collapsible",
      label: "Knapp",
      admin: { condition: (_, data) => Boolean(data?.showButton) },
      fields: [link({ name: "cta" })],
    },
  ],
};
