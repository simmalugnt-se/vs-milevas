import type { Page } from "@/payload-types";

export type LayoutBlock = NonNullable<Page["layout"]>[number];

export type LayoutBlockComponentProps<TBlock extends LayoutBlock = LayoutBlock> = {
  block: TBlock;
};

export type HeroBlock = Extract<LayoutBlock, { blockType: "hero" }>;
export type MediaBlock = Extract<LayoutBlock, { blockType: "media" }>;
export type RichTextBlock = Extract<LayoutBlock, { blockType: "richText" }>;
export type ConfiguratorBlock = Extract<LayoutBlock, { blockType: "configurator" }>;
