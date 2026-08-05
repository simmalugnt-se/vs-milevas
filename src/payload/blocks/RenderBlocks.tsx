import type { ReactNode } from "react";
import { blockComponents, type LayoutBlock } from "./definitions.ts";

type RenderBlocksProps = {
  className?: string;
  layout?: LayoutBlock[] | null;
};

const renderers = blockComponents as Record<string, (props: { block: LayoutBlock }) => ReactNode>;

export function RenderBlocks({ className = "space-y-10", layout }: RenderBlocksProps) {
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

        return <BlockComponent block={block} key={block.id || `${block.blockType}-${index}`} />;
      })}
    </div>
  );
}
