import type { Block } from "payload";
import { FAMILY_ROW_LABEL, familyField, sectionID } from "../milevas-fields";

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
      name: "columnHeading",
      label: "Rubrik på kolumnerna",
      type: "text",
      required: true,
      localized: true,
      defaultValue: "Bygg din truck:",
      admin: {
        description:
          'Före trucktypens namn när en kolumn pekas på, samma på alla. Exempel: "Bygg din truck:".',
      },
    },
    {
      name: "columns",
      label: "Kolumner",
      labels: { singular: "Kolumn", plural: "Kolumner" },
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: {
        description: "En kolumn per trucktyp; namn, bild, priser och länk kommer från trucktypen.",
        components: { RowLabel: FAMILY_ROW_LABEL },
      },
      fields: [{ ...familyField, required: true }],
    },
  ],
};
