import type { Page } from "@/payload-types";

export type LayoutBlock = NonNullable<Page["layout"]>[number];

export type LayoutBlockComponentProps<TBlock extends LayoutBlock = LayoutBlock> = {
  block: TBlock;
};

export type HeroBlock = Extract<LayoutBlock, { blockType: "hero" }>;
export type MediaBlock = Extract<LayoutBlock, { blockType: "media" }>;
export type RichTextBlock = Extract<LayoutBlock, { blockType: "richText" }>;
export type ConfiguratorBlock = Extract<LayoutBlock, { blockType: "configurator" }>;
export type CardsBlock = Extract<LayoutBlock, { blockType: "cards" }>;
export type FAQBlock = Extract<LayoutBlock, { blockType: "faq" }>;
export type GalleryBlock = Extract<LayoutBlock, { blockType: "gallery" }>;
export type CallToActionBlock = Extract<LayoutBlock, { blockType: "callToAction" }>;
export type ColumnsBlock = Extract<LayoutBlock, { blockType: "columns" }>;
