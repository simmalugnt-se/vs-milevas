import { editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { TextBlock } from "@/components/blocks/text-block";
import type { LayoutBlockComponentProps, TextBlockBlock } from "../types";

export function TextBlockBlockComponent({ block }: LayoutBlockComponentProps<TextBlockBlock>) {
  return (
    <TextBlock
      id={block.anchor ?? undefined}
      text={
        <span className="whitespace-pre-line" {...editableField("text")}>
          {block.text}
        </span>
      }
      paragraph={
        block.paragraph ? (
          <span className="whitespace-pre-line" {...editableField("paragraph")}>
            {block.paragraph}
          </span>
        ) : undefined
      }
    />
  );
}
