import type { Block } from "payload";
import { link } from "../../fields/link";
import { sectionID } from "../milevas-fields";

export const TextBoxinfoBlock: Block = {
  slug: "textBoxinfo",
  labels: { singular: "Milevas: Text och inforuta", plural: "Milevas: Text och inforuta" },
  fields: [
    sectionID,
    { name: "heading", label: "Rubrik", type: "textarea", required: true, localized: true },
    { name: "highlight", label: "Markerad rubrikdel", type: "textarea", localized: true },
    { name: "text", label: "Brödtext", type: "textarea", localized: true },
    {
      name: "items",
      label: "Informationsrader",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "heading", label: "Rubrik", type: "text", required: true, localized: true },
        { name: "label", label: "Etikett", type: "text", localized: true },
        { name: "text", label: "Text", type: "textarea", localized: true },
      ],
    },
    { name: "showButton", label: "Visa knapp", type: "checkbox", defaultValue: true },
    {
      type: "collapsible",
      label: "Knapp",
      admin: { condition: (_, data) => Boolean(data?.showButton) },
      fields: [link({ name: "cta" })],
    },
  ],
};
