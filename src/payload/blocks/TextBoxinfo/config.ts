import type { Block } from "payload";
import { coloredHeadingField } from "@/payload/fields/colored-heading";
import { link } from "../../fields/link";
import { sectionID } from "../milevas-fields";

export const TextBoxinfoBlock: Block = {
  slug: "textBoxinfo",
  labels: { singular: "Milevas: Text och inforuta", plural: "Milevas: Text och inforuta" },
  fields: [
    sectionID,
    coloredHeadingField({
      description:
        'Varje stycke (Enter) blir en egen rad. Exempel: "Truck från" och "390kr/mån", och gult "Easy peasy" och "lemon squeezy.".',
    }),
    { name: "text", label: "Brödtext", type: "textarea", localized: true },
    {
      name: "items",
      label: "Informationsrader",
      labels: { singular: "Rad", plural: "Rader" },
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
