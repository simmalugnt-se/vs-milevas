import { editableBlock } from "@simmalugnt-se/payload-visual-editing/frontend";
import type { ReactNode } from "react";
import { LinkedColumns } from "@/components/blocks/linked-columns";
import { blockComponents, type LayoutBlock, type LayoutBlockRenderer } from "./definitions.ts";

type RenderBlocksProps = {
  className?: string;
  /** Mark blocks for click-to-edit in Live Preview. Only in draft mode. */
  editable?: boolean;
  layout?: LayoutBlock[] | null;
};

const renderers = blockComponents as Record<string, LayoutBlockRenderer>;

export function RenderBlocks({ className, editable = false, layout }: RenderBlocksProps) {
  if (!layout || layout.length === 0) {
    return null;
  }

  const render = (block: LayoutBlock, index: number) => {
    const BlockComponent = renderers[block.blockType];

    if (!BlockComponent) {
      return null;
    }

    return (
      <div
        data-layout-block={block.blockType}
        key={block.id || `${block.blockType}-${index}`}
        {...(editable ? editableBlock(block) : {})}
      >
        <BlockComponent block={block} first={index === 0} />
      </div>
    );
  };

  // Milevas: the hero and a text block right after it share their column lines, when the hero
  // has two more columns (six and four, as Figma's prototype).
  const items: ReactNode[] = [];
  for (let index = 0; index < layout.length; index++) {
    const block = layout[index];
    const next = layout[index + 1];
    if (
      block.blockType === "milevasHero" &&
      next?.blockType === "textColumns" &&
      block.columns.length === next.logos.length + 2
    ) {
      items.push(
        <LinkedColumns key={`linked-${block.id || index}`} columns={block.columns.length}>
          {render(block, index)}
          {render(next, index + 1)}
        </LinkedColumns>,
      );
      index++;
    } else {
      items.push(render(block, index));
    }
  }

  return <div className={className}>{items}</div>;
}
