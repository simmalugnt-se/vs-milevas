import type { Block } from "payload";
import { sectionID } from "../milevas-fields";

export const CardSliderBlock: Block = {
  slug: "cardSlider",
  labels: { singular: "Milevas: Kortslider", plural: "Milevas: Kortslider" },
  fields: [
    sectionID,
    {
      name: "label",
      label: "Listans namn",
      type: "text",
      localized: true,
      admin: {
        description: "Läses av skärmläsare; syns inte. Exempel: Lager, leverans och service.",
      },
    },
    {
      name: "cards",
      label: "Kort",
      labels: { singular: "Kort", plural: "Kort" },
      type: "array",
      required: true,
      minRows: 1,
      admin: { description: "Numreras [01], [02] … i ordning." },
      fields: [
        {
          name: "color",
          label: "Färg",
          type: "select",
          required: true,
          defaultValue: "white",
          options: [
            { label: "Vit", value: "white" },
            { label: "Gul (Tejp)", value: "tejp" },
            { label: "Grå", value: "gray" },
          ],
        },
        { name: "label", label: "Etikett", type: "text", required: true, localized: true },
        { name: "heading", label: "Rubrik", type: "text", required: true, localized: true },
        {
          name: "text",
          label: "Text",
          type: "textarea",
          localized: true,
          admin: { description: "Visas under rubriken i bildläget." },
        },
        {
          name: "image",
          label: "Bild",
          type: "upload",
          relationTo: "images",
          required: true,
          admin: { description: "Visas i bildläget, under ett mörkt lager." },
        },
      ],
    },
  ],
};
