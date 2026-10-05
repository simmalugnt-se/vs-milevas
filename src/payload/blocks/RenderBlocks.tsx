import { editableBlock } from "@simmalugnt-se/payload-visual-editing/frontend";
import type { ReactNode } from "react";
import { blockComponents, type LayoutBlock } from "./definitions.ts";

type RenderBlocksProps = {
  className?: string;
  /** Mark blocks for click-to-edit in Live Preview. Only in draft mode. */
  editable?: boolean;
  layout?: LayoutBlock[] | null;
};

const renderers = blockComponents as Record<string, (props: { block: LayoutBlock }) => ReactNode>;

export function RenderBlocks({
  className = "space-y-10",
  editable = false,
  layout,
}: RenderBlocksProps) {
  if (!layout || layout.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {layout.map((block, index) => {
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
            <BlockComponent block={block} />
          </div>
        );
      })}
    </div>
  );
}
