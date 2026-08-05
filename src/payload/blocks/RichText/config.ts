import { FixedToolbarFeature, LinkFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import type { Block } from "payload";

const richTextLinkCollections = ["pages", "documents"] as const;

export const RichTextBlock: Block = {
  slug: "richText",
  fields: [
    {
      name: "content",
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
