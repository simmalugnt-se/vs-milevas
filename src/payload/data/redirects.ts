import { unstable_cache } from "next/cache";
import type { TypedLocale } from "payload";
import { routing } from "@/i18n/routing";
import { REDIRECTS_CACHE_TAG } from "@/payload/cache-tags";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { type RedirectDoc, resolveRedirectDestination } from "@/payload/data/redirects-core";
import { getPayloadClient } from "@/payload/get-payload";

async function fetchRedirects(): Promise<RedirectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "redirects",
    depth: 1,
    limit: 0,
    overrideAccess: true,
    pagination: false,
  });

  return result.docs as RedirectDoc[];
}

const getCachedRedirects = () =>
  unstable_cache(fetchRedirects, [REDIRECTS_CACHE_TAG], {
    tags: [REDIRECTS_CACHE_TAG],
  });

async function loadReference(relationTo: string, id: string | number) {
  const payload = await getPayloadClient();
  return payload.findByID({
    collection: relationTo as "pages",
    id,
    overrideAccess: true,
  });
}

export async function getRedirectDestination(
  url: string,
  locale: TypedLocale,
): Promise<string | null> {
  if (!(await getPayloadDbReady()).ready) {
    return null;
  }

  return resolveRedirectDestination({
    defaultLocale: routing.defaultLocale,
    loadReference,
    locale,
    locales: routing.locales,
    redirects: await getCachedRedirects()(),
    url,
  });
}
