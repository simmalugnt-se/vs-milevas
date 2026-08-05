import { draftMode } from "next/headers";
import type { TypedLocale } from "payload";
import { LivePreviewListener } from "@/components/cms/live-preview-listener";
import { PageLayout } from "@/components/cms/page-layout";
import {
  PayloadDatabaseSetupMain,
  PayloadSchemaMismatchMain,
} from "@/components/cms/payload-database-setup";
import { PayloadRedirects } from "@/components/cms/payload-redirects";
import { frontendPath } from "@/i18n/frontend-path";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPageBySlug } from "@/payload/data/documents";
import { buildPageMetadata } from "@/payload/utilities/frontend-metadata";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as TypedLocale;
  const page = await getPageBySlug("home", false, locale);

  return buildPageMetadata(page, locale);
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as TypedLocale;
  const { isEnabled: draft } = await draftMode();
  const page = await getPageBySlug("home", draft, locale);

  if (!page) {
    const dbStatus = await getPayloadDbReady();
    if (!dbStatus.ready) {
      return dbStatus.mismatch ? <PayloadSchemaMismatchMain /> : <PayloadDatabaseSetupMain />;
    }
    return <PayloadRedirects locale={locale} url={frontendPath("/", locale)} />;
  }

  return (
    <>
      {draft ? <LivePreviewListener /> : null}
      <PageLayout layout={page.layout} />
    </>
  );
}
