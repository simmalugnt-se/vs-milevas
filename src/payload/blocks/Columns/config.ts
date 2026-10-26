import type { Block } from "payload";
import { MediaBlock } from "../Media/config.ts";
import { RichTextBlock } from "../RichText/config.ts";

export const ColumnsBlock: Block = {
  slug: "columns",
  labels: { singular: "Kolumner", plural: "Kolumner" },
  fields: [
    {
      name: "columns",
      label: "Kolumner",
      type: "array",
      required: true,
      minRows: 2,
      maxRows: 3,
      labels: { singular: "Kolumn", plural: "Kolumner" },
      fields: [
        {
          name: "content",
          label: "Innehåll",
          labels: { singular: "Block", plural: "Block" },
          type: "blocks",
          blocks: [RichTextBlock, MediaBlock],
        },
      ],
    },
  ],
};
