import { editableField, editableRichText } from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import {
  ARTICLE_CENTER_IMAGE_SIZES,
  ARTICLE_SIDE_IMAGE_SIZES,
  ArticleHeading,
  ArticleImage,
  ArticleList,
  ArticleText,
} from "@/components/blocks/article-modules";
import { PayloadRichText } from "@/components/cms/payload-rich-text";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { resolvePayloadMedia } from "@/payload/utilities/media";
import type {
  ArticleHeadingBlock,
  ArticleImageBlock,
  ArticleListBlock,
  ArticleTextBlock,
  LayoutBlockComponentProps,
} from "../types";

function moduleImage(
  image: ArticleImageBlock["image"] | null | undefined,
  sizes: string,
  /** The module opens the page, so its image is in view at once. */
  first?: boolean,
) {
  const media = image ? resolvePayloadMedia(image) : null;
  return media?.kind === "image" ? (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      loading={first ? "eager" : undefined}
      className="object-cover"
      {...editableField("image")}
    />
  ) : undefined;
}

function moduleCta(block: Pick<ArticleTextBlock, "showButton" | "cta">) {
  const link = block.showButton ? resolveLinkField(block.cta) : null;
  return link && block.cta?.label
    ? { ...link, label: block.cta.label, attributes: editableField("cta.label") }
    : undefined;
}

function moduleText(text: string | null | undefined, field: string) {
  return text ? (
    <span className="whitespace-pre-line" {...editableField(field)}>
      {text}
    </span>
  ) : undefined;
}

export function ArticleTextBlockComponent({
  block,
  first,
}: LayoutBlockComponentProps<ArticleTextBlock>) {
  return (
    <ArticleText
      id={block.anchor ?? undefined}
      headingAs={first ? "h1" : "h2"}
      placement={block.placement}
      heading={moduleText(block.heading, "heading")}
      lead={moduleText(block.lead, "lead")}
      body={
        block.body ? (
          <PayloadRichText
            {...editableRichText("body")}
            data={block.body as Record<string, unknown>}
          />
        ) : undefined
      }
      image={moduleImage(
        block.image,
        block.placement === "center" ? ARTICLE_CENTER_IMAGE_SIZES : ARTICLE_SIDE_IMAGE_SIZES,
        first,
      )}
      cta={moduleCta(block)}
    />
  );
}

export function ArticleListBlockComponent({
  block,
  first,
}: LayoutBlockComponentProps<ArticleListBlock>) {
  return (
    <ArticleList
      id={block.anchor ?? undefined}
      headingAs={first ? "h1" : "h2"}
      placement={block.placement ?? undefined}
      heading={moduleText(block.heading, "heading")}
      lead={moduleText(block.lead, "lead")}
      items={block.items.map((item, index) => (
        <span key={item.id ?? index} {...editableField(`items.${index}.text`)}>
          {item.text}
        </span>
      ))}
      image={moduleImage(block.image, ARTICLE_SIDE_IMAGE_SIZES, first)}
      cta={moduleCta(block)}
    />
  );
}

export function ArticleHeadingBlockComponent({
  block,
  first,
}: LayoutBlockComponentProps<ArticleHeadingBlock>) {
  return (
    <ArticleHeading
      id={block.anchor ?? undefined}
      headingAs={first ? "h1" : "h2"}
      heading={moduleText(block.heading, "heading")}
      text={moduleText(block.text, "text")}
      image={moduleImage(block.image, "100vw", first)}
      cta={moduleCta(block)}
    />
  );
}

export function ArticleImageBlockComponent({
  block,
  first,
}: LayoutBlockComponentProps<ArticleImageBlock>) {
  return (
    <ArticleImage id={block.anchor ?? undefined} image={moduleImage(block.image, "100vw", first)} />
  );
}
