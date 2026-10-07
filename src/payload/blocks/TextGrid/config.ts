import type { Block } from "payload";
import { sectionID } from "../milevas-fields";

export const TextGridBlock: Block = {
  slug: "textGrid",
  labels: { singular: "Milevas: Text och bildkort", plural: "Milevas: Text och bildkort" },
  fields: [
    sectionID,
    { name: "heading", label: "Rubrik", type: "textarea", required: true, localized: true },
    {
      name: "cards",
      label: "Bildkort",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: "number", label: "Nummer", type: "text", required: true },
        { name: "label", label: "Etikett", type: "text", required: true, localized: true },
        { name: "text", label: "Text", type: "textarea", localized: true },
        { name: "image", label: "Bild", type: "upload", relationTo: "images", required: true },
      ],
    },
  ],
};
