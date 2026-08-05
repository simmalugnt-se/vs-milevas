import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
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
import { getPageBySlug, getPageSlugs } from "@/payload/data/documents";
import { buildPageMetadata } from "@/payload/utilities/frontend-metadata";

const RESERVED_SLUGS = new Set(["routes"]);

type PageProps = {
  params: Promise<{ slug: string; locale: TypedLocale }>;
};

export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as TypedLocale;
  const slugs = await getPageSlugs(locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as TypedLocale;

  if (RESERVED_SLUGS.has(slug)) {
    return {};
  }

  const page = await getPageBySlug(slug, false, locale);
  return buildPageMetadata(page, locale);
}

export default async function Page({ params }: PageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as TypedLocale;
  const { isEnabled: draft } = await draftMode();

  if (slug === "home") {
    redirect(frontendPath("/", locale));
  }

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const page = await getPageBySlug(slug, draft, locale);

  if (!page) {
    const dbStatus = await getPayloadDbReady();
    if (!dbStatus.ready) {
      return dbStatus.mismatch ? <PayloadSchemaMismatchMain /> : <PayloadDatabaseSetupMain />;
    }
    return <PayloadRedirects locale={locale} url={frontendPath(`/${slug}`, locale)} />;
  }

  return (
    <>
      {draft ? <LivePreviewListener /> : null}
      <PageLayout layout={page.layout} />
    </>
  );
}
