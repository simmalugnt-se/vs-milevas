import {
  FixedToolbarFeature,
  lexicalEditor,
  ParagraphFeature,
  TextStateFeature,
} from "@payloadcms/richtext-lexical";
import type { RichTextField } from "payload";
import { HEADING_COLORS } from "@/payload/utilities/colored-text";

/**
 * A heading with colored parts: paragraphs and plain text only, and the colors in the toolbar
 * (`TextStateFeature`, which Payload marks experimental). Editors select text and choose "Gul";
 * "Standardstil" takes it back. The site renders it with `ColoredText`.
 */
export const coloredHeadingField = ({
  label = "Rubrik",
  description,
}: {
  label?: string;
  description: string;
}): RichTextField => ({
  name: "heading",
  label,
  type: "richText",
  required: true,
  localized: true,
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      TextStateFeature({
        state: {
          color: Object.fromEntries(
            Object.entries(HEADING_COLORS).map(([key, color]) => [
              key,
              { label: color.label, css: color.adminCss },
            ]),
          ),
        },
      }),
      FixedToolbarFeature(),
    ],
  }),
  admin: {
    description: `${description} Markera text och välj Gul i verktygsfältet för den gula delen; Standardstil gör den vit igen.`,
  },
});
