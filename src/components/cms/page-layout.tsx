import type { LayoutBlock } from "@/payload/blocks";
import { RenderBlocks } from "@/payload/blocks";

type PageLayoutProps = {
  layout: LayoutBlock[] | null | undefined;
};

export function PageLayout({ layout }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      <RenderBlocks layout={layout ?? []} />
    </div>
  );
}
