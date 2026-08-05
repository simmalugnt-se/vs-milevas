import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { cache } from "react";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";

async function fetchPageBySlug(slug: string, draft: boolean, locale: TypedLocale) {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "pages",
    locale,
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs[0] ?? null;
}

const getCachedPageBySlug = (slug: string, locale: TypedLocale) =>
  unstable_cache(async () => fetchPageBySlug(slug, false, locale), ["page-by-slug", slug, locale], {
    tags: ["pages", `page:${slug}`],
  });

/**
 * Per-request dedupe (xo-foundation pattern). When `draft` is true, bypasses
 * `unstable_cache` so preview always hits Payload.
 */
export const getPageBySlug = cache(async (slug: string, draft: boolean, locale: TypedLocale) => {
  if (!(await getPayloadDbReady()).ready) {
    return null;
  }

  if (draft) {
    unstable_noStore();
    const draftDoc = await fetchPageBySlug(slug, true, locale);
    if (draftDoc) {
      return draftDoc;
    }
    return fetchPageBySlug(slug, false, locale);
  }

  return getCachedPageBySlug(slug, locale)();
});

export async function getPageSlugs(locale: TypedLocale) {
  if (!(await getPayloadDbReady()).ready) {
    return [];
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    locale,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  return result.docs.map((page) => page.slug).filter((slug): slug is string => Boolean(slug));
}
