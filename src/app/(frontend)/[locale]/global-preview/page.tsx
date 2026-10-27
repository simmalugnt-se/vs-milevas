import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LivePreviewListener } from "@/components/cms/live-preview-listener";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

/**
 * Live Preview for the header and footer globals: the layout renders them around this neutral
 * content, on the pages' dark background and filling the rest of the window, so the footer ends at
 * the bottom of the window. Only for editors in draft mode, which the preview route turns on.
 */
export default async function GlobalPreviewPage() {
  const { isEnabled: draft } = await draftMode();
  if (!draft) {
    notFound();
  }
  const t = await getTranslations("globalPreview");

  return (
    <>
      <LivePreviewListener />
      <section
        data-page-background="dark"
        className="flex flex-1 flex-col items-center justify-center gap-4 border border-dashed border-ui-tertiary mode-dark bg-bg-fill px-6 py-24 text-center text-ui-primary"
      >
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-xl text-base leading-7 text-ui-secondary">{t("description")}</p>
      </section>
    </>
  );
}
