import type { LayoutBlock } from "@/payload/blocks";
import { RenderBlocks } from "@/payload/blocks";

type PageLayoutProps = {
  editable?: boolean;
  layout: LayoutBlock[] | null | undefined;
};

export function PageLayout({ editable, layout }: PageLayoutProps) {
  return (
    <div className="space-y-8">
      <RenderBlocks editable={editable} layout={layout ?? []} />
    </div>
  );
}
