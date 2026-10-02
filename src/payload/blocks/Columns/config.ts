import type { Block } from "payload";
import { MediaBlock } from "../Media/config.ts";
import { RichTextBlock } from "../RichText/config.ts";

export const ColumnsBlock: Block = {
  slug: "columns",
  labels: { singular: "Columns", plural: "Columns" },
  fields: [
    {
      name: "columns",
      type: "array",
      required: true,
      minRows: 2,
      maxRows: 3,
      labels: { singular: "Column", plural: "Columns" },
      fields: [
        {
          name: "content",
          type: "blocks",
          blocks: [RichTextBlock, MediaBlock],
        },
      ],
    },
  ],
};
