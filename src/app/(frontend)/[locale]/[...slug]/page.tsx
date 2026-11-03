import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { TypedLocale } from "payload";
import { DatabaseSetup } from "@/components/cms/database-setup";
import { LivePreviewListener } from "@/components/cms/live-preview-listener";
import { PageLayout } from "@/components/cms/page-layout";
import { PayloadRedirects } from "@/components/cms/payload-redirects";
import { frontendPath } from "@/i18n/frontend-path";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPageByPath, getPagePaths } from "@/payload/data/documents";
import { buildPageMetadata } from "@/payload/utilities/frontend-metadata";

const RESERVED_SLUGS = new Set(["routes"]);

type PageProps = {
  params: Promise<{ slug: string[]; locale: TypedLocale }>;
};

/** A page's address from the URL's segments: "motviktstruckar/trehjuliga". */
const pathOf = (slug: string[]) => slug.map(decodeURIComponent).join("/");

export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as TypedLocale;
  const paths = await getPagePaths(locale);
  return paths.filter((path) => path !== "home").map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;

  if (RESERVED_SLUGS.has(slug[0])) {
    return {};
  }

  const page = await getPageByPath(pathOf(slug), false, locale);
  return buildPageMetadata(page, locale);
}

/** A page at its address, a page under its parents' ("/parent/child"), or a redirect. */
export default async function Page({ params }: PageProps) {
  const { slug, locale } = await params;
  const path = pathOf(slug);
  const { isEnabled: draft } = await draftMode();

  if (path === "home") {
    redirect(frontendPath("/", locale));
  }

  if (RESERVED_SLUGS.has(slug[0])) {
    notFound();
  }

  const page = await getPageByPath(path, draft, locale);

  if (!page) {
    const dbStatus = await getPayloadDbReady();
    if (!dbStatus.ready) {
      return <DatabaseSetup problem={dbStatus.problem} />;
    }
    return <PayloadRedirects locale={locale} url={frontendPath(`/${path}`, locale)} />;
  }

  return (
    <>
      {draft ? <LivePreviewListener /> : null}
      <PageLayout editable={draft} layout={page.layout} background={page.background} />
    </>
  );
}
