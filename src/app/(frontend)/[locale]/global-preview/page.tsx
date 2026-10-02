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
 * content. Only for editors in draft mode, which the preview route turns on.
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
      <section className="flex flex-1 flex-col items-center justify-center gap-4 border border-dashed border-neutral-300 px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="max-w-xl text-base leading-7 text-neutral-600">{t("description")}</p>
      </section>
    </>
  );
}
