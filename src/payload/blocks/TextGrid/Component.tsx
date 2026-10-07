import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import { TextGrid } from "@/components/blocks/text-grid";
import { getMediaImageURL } from "@/payload/utilities/media";
import type { LayoutBlockComponentProps, TextGridBlock } from "../types";

export function TextGridBlockComponent({ block }: LayoutBlockComponentProps<TextGridBlock>) {
  return (
    <TextGrid
      id={block.anchor ?? undefined}
      heading={block.heading}
      headingAttributes={editableField("heading")}
      cards={block.cards.map((item) => {
        const src = getMediaImageURL(item.image);
        return {
          attributes: editableBlock(item),
          number: <span {...editableField("number")}>{item.number}</span>,
          label: <span {...editableField("label")}>{item.label}</span>,
          text: (
            <span className="whitespace-pre-line" {...editableField("text")}>
              {item.text}
            </span>
          ),
          image: src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
              {...editableField("image")}
            />
          ) : null,
        };
      })}
    />
  );
}
