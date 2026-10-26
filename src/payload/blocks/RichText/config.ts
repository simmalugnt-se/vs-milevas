import { FixedToolbarFeature, LinkFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import type { Block } from "payload";

const richTextLinkCollections = ["pages", "documents"] as const;

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Fritext", plural: "Fritext" },
  fields: [
    {
      name: "content",
      label: "Innehåll",
      type: "richText",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter(
            (feature) => !["link", "relationship", "upload"].includes(feature.key),
          ),
          LinkFeature({
            enabledCollections: [...richTextLinkCollections],
            maxDepth: 2,
          }),
          FixedToolbarFeature(),
        ],
      }),
      localized: true,
      required: true,
    },
  ],
};
