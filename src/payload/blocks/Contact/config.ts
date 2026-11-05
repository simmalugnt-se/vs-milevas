import type { Block } from "payload";
import { sectionID } from "../milevas-fields";

export const ContactBlock: Block = {
  slug: "contact",
  labels: { singular: "Kontakt", plural: "Kontakt" },
  fields: [
    sectionID,
    {
      name: "heading",
      label: "Rubrik",
      type: "text",
      required: true,
      localized: true,
      defaultValue: "Kontakt",
      admin: {
        description: "E-post, telefon och sociala länkar hämtas från sidfoten (Allmänt → Sidfot).",
      },
    },
  ],
};
