import type { Block } from "payload";
import { sectionID } from "../milevas-fields";

export const ContactBlock: Block = {
  slug: "contact",
  labels: { singular: "Milevas: Kontakt", plural: "Milevas: Kontakt" },
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
        description:
          "E-post, telefon och sociala länkar hämtas från sidfoten (Allmänt → Sidfot), så de bara ändras på ett ställe. Formuläret sparas i Förfrågningar → Meddelanden.",
      },
    },
  ],
};
