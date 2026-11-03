import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";
import { pagePathname } from "@/payload/data/redirects-core";
import { pageAddress } from "@/payload/utilities/page-path";
import type { Page } from "@/payload-types";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";
import { publishedSlugBefore } from "./redirect-old-slug.ts";

/** A page's address (`path`), as the cache tags and paths below use it. */
function revalidateLocalizedPagePaths(address: string | null | undefined) {
  const base = pagePathname(address);
  for (const locale of routing.locales) {
    revalidatePath(frontendPath(base, locale as TypedLocale));
  }
}

export const revalidateCollection: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req,
}) => {
  const { context } = req;
  if (context?.disableRevalidate) {
    return doc;
  }

  const address = pageAddress(doc);
  if (doc._status === "published") {
    revalidateLocalizedPagePaths(address);
    revalidateTag("pages", "max");
    revalidateTag("sitemap-pages", "max");
    if (address) {
      revalidateTag(`page:${address}`, "max");
    }
  }

  const previousAddress = pageAddress(previousDoc);
  if (previousDoc?._status === "published" && doc._status !== "published" && previousAddress) {
    revalidateLocalizedPagePaths(previousAddress);
    revalidateTag("pages", "max");
    revalidateTag("sitemap-pages", "max");
    revalidateTag(`page:${previousAddress}`, "max");
  }

  // A new address: the old one now redirects. `previousDoc` is the last draft, which may have the
  // new slug already, so the published one comes from `rememberPublishedSlug`. Expire the old page at
  // once, or its next visitor gets it from the cache instead of the redirect.
  const publishedPath = publishedSlugBefore(req, doc.id);
  if (doc._status === "published" && publishedPath && address && publishedPath !== address) {
    revalidateLocalizedPagePaths(publishedPath);
    revalidateTag(`page:${publishedPath}`, { expire: 0 });
  }

  void notifyRemoteRevalidation();

  return doc;
};

export const revalidateCollectionDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { context },
}) => {
  const address = pageAddress(doc);
  if (context?.disableRevalidate || !address) {
    return doc;
  }

  revalidateLocalizedPagePaths(address);
  revalidateTag("pages", "max");
  revalidateTag("sitemap-pages", "max");
  revalidateTag(`page:${address}`, "max");
  void notifyRemoteRevalidation();

  return doc;
};
