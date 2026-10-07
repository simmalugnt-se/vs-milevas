import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { TextBoxinfo } from "@/components/blocks/text-boxinfo";
import { resolveLinkField } from "@/payload/utilities/link-field";
import type { LayoutBlockComponentProps, TextBoxinfoBlock } from "../types";

export function TextBoxinfoBlockComponent({ block }: LayoutBlockComponentProps<TextBoxinfoBlock>) {
  const link = block.showButton ? resolveLinkField(block.cta) : null;
  return (
    <TextBoxinfo
      id={block.anchor ?? undefined}
      heading={
        <span className="whitespace-pre-line" {...editableField("heading")}>
          {block.heading}
        </span>
      }
      highlight={
        block.highlight ? (
          <span className="whitespace-pre-line" {...editableField("highlight")}>
            {block.highlight}
          </span>
        ) : undefined
      }
      text={
        block.text ? (
          <span className="whitespace-pre-line" {...editableField("text")}>
            {block.text}
          </span>
        ) : undefined
      }
      items={block.items.map((item) => ({
        attributes: editableBlock(item),
        heading: <span {...editableField("heading")}>{item.heading}</span>,
        label: <span {...editableField("label")}>{item.label}</span>,
        text: (
          <span className="whitespace-pre-line" {...editableField("text")}>
            {item.text}
          </span>
        ),
      }))}
      cta={
        link && block.cta?.label
          ? { ...link, label: block.cta.label, attributes: editableField("cta.label") }
          : undefined
      }
    />
  );
}
