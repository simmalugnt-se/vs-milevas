import { getNoIndexHeaderValue, getSiteOrigin, isSearchIndexingEnabled } from "@/lib/seo/indexing";

export const dynamic = "force-dynamic";

function sitemapIndexResponse(sitemaps: string[]) {
  const headers = new Headers({
    "Cache-Control": "public, max-age=300",
    "Content-Type": "application/xml; charset=utf-8",
  });

  if (!isSearchIndexingEnabled()) {
    headers.set("X-Robots-Tag", getNoIndexHeaderValue());
  }

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...sitemaps.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`),
      "</sitemapindex>",
      "",
    ].join("\n"),
    { headers },
  );
}

export function GET() {
  if (!isSearchIndexingEnabled()) {
    return sitemapIndexResponse([]);
  }

  const origin = getSiteOrigin();

  return sitemapIndexResponse([`${origin}/sitemap-pages.xml`]);
}
