import type { LayoutBlock } from "@/payload/blocks";
import { RenderBlocks } from "@/payload/blocks";

type PageLayoutProps = {
  editable?: boolean;
  layout: LayoutBlock[] | null | undefined;
  /** The page's background (Pages → background), dark unless set. */
  background?: "dark" | "light" | null;
};

/**
 * A CMS page as Figma's page templates (05 — Pages): the blocks `grid/margin` apart, with the page's
 * background behind them and around the footer (`data-page-background`, `site-theme.css`).
 */
export function PageLayout({ editable, layout, background }: PageLayoutProps) {
  return (
    <div data-page-background={background ?? "dark"}>
      <RenderBlocks
        className="flex flex-col gap-(--grid-margin)"
        editable={editable}
        layout={layout ?? []}
      />
    </div>
  );
}
