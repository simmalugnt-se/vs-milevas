import { getNoIndexHeaderValue, getSiteOrigin, isSearchIndexingEnabled } from "@/lib/seo/indexing";

export const dynamic = "force-dynamic";

function textResponse(body: string) {
  const headers = new Headers({
    "Cache-Control": "public, max-age=300",
    "Content-Type": "text/plain; charset=utf-8",
  });

  if (!isSearchIndexingEnabled()) {
    headers.set("X-Robots-Tag", getNoIndexHeaderValue());
  }

  return new Response(body, { headers });
}

export function GET() {
  if (!isSearchIndexingEnabled()) {
    return textResponse(["User-agent: *", "Disallow: /", ""].join("\n"));
  }

  const origin = getSiteOrigin();

  return textResponse(
    [
      "User-agent: *",
      "Disallow: /admin/",
      "Disallow: /api/",
      "Disallow: /routes/",
      "",
      `Sitemap: ${origin}/sitemap.xml`,
      "",
    ].join("\n"),
  );
}
