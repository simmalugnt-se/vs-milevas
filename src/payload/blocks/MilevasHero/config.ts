import type { Block } from "payload";
import { familyField, sectionID } from "../milevas-fields";

export const MilevasHeroBlock: Block = {
  slug: "milevasHero",
  labels: { singular: "Milevas: Hero", plural: "Milevas: Hero" },
  fields: [
    sectionID,
    {
      name: "heading",
      label: "Sidans rubrik",
      type: "text",
      required: true,
      localized: true,
      admin: { description: "Sidans h1, introts vita rad. Exempel: Bygg din baoli." },
    },
    {
      name: "highlight",
      label: "Gul rad",
      type: "text",
      localized: true,
      admin: { description: "Efter rubriken, i gult. Exempel: På typ 30 sekunder." },
    },
    {
      name: "prompt",
      label: "Uppmaning",
      type: "text",
      localized: true,
      admin: { description: "Under rubriken. Exempel: Välj trucktyp för att börja." },
    },
    {
      name: "activeColumn",
      label: "Kolumnen introt stannar på",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: { description: "På desktop glider truckarna dit efter introt." },
    },
    {
      name: "columns",
      label: "Kolumner",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: {
        description: "En kolumn per truckfamilj; namn, bild, priser och länk kommer från familjen.",
      },
      fields: [
        { ...familyField, required: true },
        {
          name: "heading",
          label: "Rubrik",
          type: "text",
          required: true,
          localized: true,
          admin: { description: 'Före namnet när kolumnen pekas på. Exempel: "Bygg din truck:".' },
        },
      ],
    },
  ],
};
