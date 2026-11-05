import {
  FixedToolbarFeature,
  LinkFeature,
  lexicalEditor,
  ParagraphFeature,
} from "@payloadcms/richtext-lexical";
import type { Block, Field } from "payload";
import { link } from "../../fields/link";
import { sectionID } from "../milevas-fields";

const heading: Field = {
  name: "heading",
  label: "Rubrik",
  type: "textarea",
  localized: true,
};

const lead: Field = {
  name: "lead",
  label: "Ingress",
  type: "textarea",
  localized: true,
};

const image: Field = {
  name: "image",
  label: "Bild",
  type: "upload",
  relationTo: "images",
};

/** The button, for a module that can have one; `condition` narrows when it shows. */
const button = (condition?: (siblingData: Record<string, unknown>) => boolean): Field[] => [
  {
    name: "showButton",
    label: "Visa knapp",
    type: "checkbox",
    defaultValue: false,
    admin: condition ? { condition: (_, siblingData) => condition(siblingData) } : undefined,
  },
  {
    type: "collapsible",
    label: "Knapp",
    admin: {
      condition: (_, siblingData) =>
        Boolean(siblingData?.showButton) && (condition ? condition(siblingData) : true),
    },
    fields: [link({ name: "cta" })],
  },
];

export const ArticleTextBlock: Block = {
  slug: "articleText",
  labels: { singular: "Text", plural: "Text" },
  fields: [
    sectionID,
    {
      name: "placement",
      label: "Placering",
      type: "select",
      required: true,
      defaultValue: "center",
      options: [
        { label: "Vänster", value: "left" },
        { label: "Mitten", value: "center" },
        { label: "Höger", value: "right" },
      ],
      admin: { description: "Var texten står. I mitten hamnar bilden under den." },
    },
    heading,
    lead,
    {
      name: "body",
      label: "Brödtext",
      type: "richText",
      localized: true,
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          LinkFeature({ enabledCollections: ["pages", "documents"], maxDepth: 2 }),
          FixedToolbarFeature(),
        ],
      }),
    },
    image,
    ...button(),
  ],
};

export const ArticleListBlock: Block = {
  slug: "articleList",
  labels: { singular: "Lista", plural: "Lista" },
  fields: [
    sectionID,
    heading,
    lead,
    {
      name: "items",
      label: "Rader",
      labels: { singular: "Rad", plural: "Rader" },
      type: "array",
      required: true,
      minRows: 1,
      fields: [{ name: "text", label: "Text", type: "text", required: true, localized: true }],
    },
    image,
    {
      name: "placement",
      label: "Placering",
      type: "select",
      required: true,
      defaultValue: "left",
      options: [
        { label: "Vänster", value: "left" },
        { label: "Höger", value: "right" },
      ],
      admin: {
        description: "Var texten står, med bilden på andra sidan.",
        condition: (_, siblingData) => Boolean(siblingData?.image),
      },
    },
    ...button(),
  ],
};

export const ArticleHeadingBlock: Block = {
  slug: "articleHeading",
  labels: { singular: "Rubrik", plural: "Rubrik" },
  fields: [
    sectionID,
    { ...heading, required: true },
    { name: "text", label: "Text", type: "textarea", localized: true },
    { ...image, admin: { description: "Fyller hela modulen, bakom texten." } },
    ...button((siblingData) => Boolean(siblingData?.image)),
  ],
};

export const ArticleImageBlock: Block = {
  slug: "articleImage",
  labels: { singular: "Helbild", plural: "Helbild" },
  fields: [sectionID, { ...image, required: true }],
};
