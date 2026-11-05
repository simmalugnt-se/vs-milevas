import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lightBackgroundBlocks } from "@/block-preview/catalog";
import { findBlockPreviewSource } from "@/block-preview/find-source";
import { PageLayout } from "@/components/cms/page-layout";
import { isTypedLocale } from "@/i18n/routing";

type Props = {
  params: Promise<{ blockType: string; locale: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// The locale layout renders the navigation and the footer; hide them so only the block is captured.
const hideChrome = `
  body:has(#block-preview-capture) :is([data-layout-block="header"], [data-layout-block="footer"]) {
    display: none !important;
  }
`;

/** One block alone, for `pnpm generate:block-thumbnails`. Only in development or when enabled. */
export default async function BlockPreview({ params }: Props) {
  if (process.env.NODE_ENV !== "development" && process.env.BLOCK_PREVIEW_ENABLED !== "true") {
    notFound();
  }

  const { blockType, locale } = await params;
  if (!isTypedLocale(locale)) notFound();
  const block = await findBlockPreviewSource(blockType, locale);
  if (!block) notFound();

  return (
    <div data-block-preview={blockType} id="block-preview-capture">
      <style>{hideChrome}</style>
      <PageLayout
        background={lightBackgroundBlocks.has(blockType) ? "light" : "dark"}
        layout={[block]}
      />
    </div>
  );
}
