import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import { TextBlockColumns } from "@/components/blocks/text-block-columns";
import { getMediaImageDimensions, getMediaImageURL } from "@/payload/utilities/media";
import type { LayoutBlockComponentProps, TextColumnsBlock } from "../types";

export function TextColumnsBlockComponent({ block, first }: LayoutBlockComponentProps<TextColumnsBlock>) {
  const logos = block.logos.flatMap((logo) => {
    const src = getMediaImageURL(logo.image);
    const size = getMediaImageDimensions(logo.image);
    if (!src) return [];
    return [
      {
        width: logo.width ?? undefined,
        image: (
          <span className="block" {...editableBlock(logo)}>
            <Image
              src={src}
              alt={logo.name}
              width={size?.width ?? 1024}
              height={size?.height ?? 512}
              sizes="(min-width: 1024px) 10rem, 6rem"
              className="block h-auto w-full"
            />
          </span>
        ),
      },
    ];
  });
  return (
    <TextBlockColumns
      headingAs={first ? "h1" : "h2"}
      id={block.anchor ?? undefined}
      heading={<span {...editableField("heading")}>{block.heading}</span>}
      highlight={
        block.highlight ? <span {...editableField("highlight")}>{block.highlight}</span> : undefined
      }
      text={block.text ? <span {...editableField("text")}>{block.text}</span> : undefined}
      logos={logos}
    />
  );
}
