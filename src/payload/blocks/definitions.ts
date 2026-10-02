import type { Block } from "payload";
import { createElement, type ReactNode } from "react";
import { CallToActionBlockComponent } from "./CallToAction/Component";
import { CallToActionBlock } from "./CallToAction/config";
import { CardsBlockComponent } from "./Cards/Component";
import { CardsBlock } from "./Cards/config";
import { ColumnsBlockComponent } from "./Columns/Component";
import { ColumnsBlock } from "./Columns/config";
import { ConfiguratorBlockComponent } from "./Configurator/Component";
import { ConfiguratorBlock } from "./Configurator/config";
import { FAQBlockComponent } from "./FAQ/Component";
import { FAQBlock } from "./FAQ/config";
import { GalleryBlockComponent } from "./Gallery/Component";
import { GalleryBlock } from "./Gallery/config";
import { HeroBlockComponent } from "./Hero/Component";
import { HeroBlock } from "./Hero/config";
import { MediaBlockComponent } from "./Media/Component";
import { MediaBlock } from "./Media/config";
import { RichTextBlockComponent } from "./RichText/Component";
import { RichTextBlock } from "./RichText/config";
import type { LayoutBlock } from "./types";

export type { LayoutBlock } from "./types";

// sl-cli:block-component-imports (do not remove)
// sl-cli:block-config-imports (do not remove)

export type LayoutBlockRenderer = (props: { block: LayoutBlock }) => ReactNode;

function isBlockType<TType extends LayoutBlock["blockType"]>(
  block: LayoutBlock,
  blockType: TType,
): block is Extract<LayoutBlock, { blockType: TType }> {
  return block.blockType === blockType;
}

function renderTypedBlock<TType extends LayoutBlock["blockType"]>(
  blockType: TType,
  render: (props: { block: Extract<LayoutBlock, { blockType: TType }> }) => ReactNode,
): LayoutBlockRenderer {
  return ({ block }) => {
    if (!isBlockType(block, blockType)) {
      return null;
    }

    return render({ block });
  };
}

export const layoutBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  MediaBlock,
  GalleryBlock,
  CardsBlock,
  FAQBlock,
  CallToActionBlock,
  ColumnsBlock,
  ConfiguratorBlock,
  // sl-cli:layout-blocks (do not remove)
];

export const blockComponents = {
  hero: renderTypedBlock("hero", ({ block }) => HeroBlockComponent({ block })),
  media: renderTypedBlock("media", ({ block }) => MediaBlockComponent({ block })),
  configurator: renderTypedBlock("configurator", ({ block }) =>
    createElement(ConfiguratorBlockComponent, { block }),
  ),
  richText: renderTypedBlock("richText", ({ block }) => RichTextBlockComponent({ block })),
  gallery: renderTypedBlock("gallery", ({ block }) => GalleryBlockComponent({ block })),
  cards: renderTypedBlock("cards", ({ block }) => CardsBlockComponent({ block })),
  faq: renderTypedBlock("faq", ({ block }) => FAQBlockComponent({ block })),
  callToAction: renderTypedBlock("callToAction", ({ block }) =>
    CallToActionBlockComponent({ block }),
  ),
  columns: renderTypedBlock("columns", ({ block }) => ColumnsBlockComponent({ block })),
  // sl-cli:block-components-map (do not remove)
} satisfies Record<string, LayoutBlockRenderer>;
