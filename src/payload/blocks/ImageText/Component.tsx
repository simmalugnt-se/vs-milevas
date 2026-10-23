import { editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import { ImageText } from "@/components/blocks/image-text";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { resolvePayloadMedia } from "@/payload/utilities/media";
import type { ImageTextBlock, LayoutBlockComponentProps } from "../types";

export function ImageTextBlockComponent({ block }: LayoutBlockComponentProps<ImageTextBlock>) {
  const media = resolvePayloadMedia(block.image);
  const link = block.showButton ? resolveLinkField(block.cta) : null;
  return (
    <ImageText
      id={block.anchor ?? undefined}
      image={
        media?.kind === "image" ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="100vw"
            className="object-cover"
            {...editableField("image")}
          />
        ) : null
      }
      heading={
        <span className="whitespace-pre-line" {...editableField("heading")}>
          {block.heading}
        </span>
      }
      text={
        block.text ? (
          <span className="whitespace-pre-line" {...editableField("text")}>
            {block.text}
          </span>
        ) : undefined
      }
      cta={
        link && block.cta?.label
          ? { ...link, label: block.cta.label, attributes: editableField("cta.label") }
          : undefined
      }
    />
  );
}
