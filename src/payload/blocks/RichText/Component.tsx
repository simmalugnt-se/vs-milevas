import { editableRichText } from "@simmalugnt-se/payload-visual-editing/frontend";
import { PayloadRichText } from "@/components/cms/payload-rich-text";
import type { LayoutBlockComponentProps, RichTextBlock } from "../types";

export function RichTextBlockComponent({ block }: LayoutBlockComponentProps<RichTextBlock>) {
  if (!block.content) {
    return null;
  }

  return (
    <section className="max-w-3xl">
      <PayloadRichText
        {...editableRichText("content")}
        className="cms-richtext"
        data={block.content as Record<string, unknown>}
      />
    </section>
  );
}
