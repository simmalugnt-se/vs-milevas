import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { Fragment } from "react";
import { TextBoxinfo } from "@/components/blocks/text-boxinfo";
import { ColoredRuns } from "@/components/ui/colored-text";
import { coloredLines } from "@/payload/utilities/colored-text";
import { resolveLinkField } from "@/payload/utilities/link-field";
import type { LayoutBlockComponentProps, TextBoxinfoBlock } from "../types";

export function TextBoxinfoBlockComponent({
  block,
  first,
}: LayoutBlockComponentProps<TextBoxinfoBlock>) {
  const link = block.showButton ? resolveLinkField(block.cta) : null;
  return (
    <TextBoxinfo
      headingAs={first ? "h1" : "h2"}
      id={block.anchor ?? undefined}
      heading={coloredLines(block.heading).map((runs, index) => (
        // The space keeps the lines apart when the heading is read as text.
        <Fragment key={index}>
          {index > 0 ? " " : null}
          <span className="block" {...editableField("heading")}>
            <ColoredRuns runs={runs} />
          </span>
        </Fragment>
      ))}
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
