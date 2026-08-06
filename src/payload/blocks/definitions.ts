import type { Block } from "payload";
import { createElement, type ReactNode } from "react";
import { ConfiguratorBlockComponent } from "./Configurator/Component";
import { ConfiguratorBlock } from "./Configurator/config";
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
  // sl-cli:block-components-map (do not remove)
} satisfies Record<string, LayoutBlockRenderer>;
