import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getServerSideSitemap } from "next-sitemap";
import { getPayload } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";
import { getSiteOrigin, isSearchIndexingEnabled } from "@/lib/seo/indexing";
import { getPayloadDbReady } from "@/payload/data/db-ready";

const getPagesSitemap = unstable_cache(
  async () => {
    if (!isSearchIndexingEnabled()) {
      return [];
    }

    if (!(await getPayloadDbReady()).ready) {
      return [];
    }

    const payload = await getPayload({ config });
    const base = getSiteOrigin();
    const entries: { loc: string; lastmod: string }[] = [];
    const dateFallback = new Date().toISOString();

    for (const locale of routing.locales) {
      const results = await payload.find({
        collection: "pages",
        locale,
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        where: {
          _status: {
            equals: "published",
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      for (const page of results.docs ?? []) {
        if (!page?.slug) {
          continue;
        }
        const path = page.slug === "home" ? "/" : `/${page.slug as string}`;
        entries.push({
          loc: `${base}${frontendPath(path, locale)}`,
          lastmod: (page.updatedAt as string) || dateFallback,
        });
      }
    }

    return entries;
  },
  ["sitemap-pages"],
  {
    tags: ["sitemap-pages"],
  },
);

export async function GET() {
  const sitemap = await getPagesSitemap();
  return getServerSideSitemap(sitemap);
}
