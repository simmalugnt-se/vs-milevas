import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { cache } from "react";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";
import { pageAddress } from "@/payload/utilities/page-path";

/** A page by its address (`path`): "om-oss", "motviktstruckar/trehjuliga", or "home". */
async function fetchPageByPath(path: string, draft: boolean, locale: TypedLocale) {
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
      path: {
        equals: path,
      },
    },
  });

  return result.docs[0] ?? null;
}

/**
 * Bumped when a block's stored shape changes in a migration (2026-10-28: colored headings as rich
 * text), so a page cached before the deploy is not read as the new shape.
 */
const PAGE_CACHE_VERSION = "2026-10-28";

const getCachedPageByPath = (path: string, locale: TypedLocale) =>
  unstable_cache(
    async () => fetchPageByPath(path, false, locale),
    ["page-by-path", PAGE_CACHE_VERSION, path, locale],
    { tags: ["pages", `page:${path}`] },
  );

/**
 * Deduplicated per request with React `cache`. When `draft` is true, bypasses
 * `unstable_cache` so preview always hits Payload.
 */
export const getPageByPath = cache(async (path: string, draft: boolean, locale: TypedLocale) => {
  if (!(await getPayloadDbReady()).ready) {
    return null;
  }

  if (draft) {
    unstable_noStore();
    const draftDoc = await fetchPageByPath(path, true, locale);
    if (draftDoc) {
      return draftDoc;
    }
    return fetchPageByPath(path, false, locale);
  }

  return getCachedPageByPath(path, locale)();
});

/** The published pages' addresses (`path`). */
export async function getPagePaths(locale: TypedLocale) {
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
      path: true,
      slug: true,
    },
  });

  return result.docs.map(pageAddress).filter(Boolean);
}
