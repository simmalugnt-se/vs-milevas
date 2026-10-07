import type { Block } from "payload";
import { editorialLink, familyField, sectionID } from "../milevas-fields";

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
      admin: { description: "Sidans h1, läses av skärmläsare men visas inte i kolumnerna." },
    },
    {
      name: "activeColumn",
      label: "Aktiv kolumn från start",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 6,
    },
    {
      name: "columns",
      label: "Kolumner",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        familyField,
        { name: "heading", label: "Rubrik", type: "text", required: true, localized: true },
        editorialLink(),
        {
          name: "price",
          label: "Från-pris",
          type: "text",
          localized: true,
          admin: { condition: (_, data) => !data?.family },
        },
        {
          name: "leasing",
          label: "Leasing per månad",
          type: "text",
          localized: true,
          admin: { condition: (_, data) => !data?.family },
        },
      ],
    },
  ],
};
