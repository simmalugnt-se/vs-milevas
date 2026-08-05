import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";
import type { Page } from "@/payload-types";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

function pagePath(slug: string | null | undefined): string {
  if (!slug || slug === "home") {
    return "/";
  }
  return `/${slug}`;
}

function revalidateLocalizedPagePaths(slug: string | null | undefined) {
  const base = pagePath(slug);
  for (const locale of routing.locales) {
    revalidatePath(frontendPath(base, locale as TypedLocale));
  }
}

export const revalidateCollection: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (context?.disableRevalidate) {
    return doc;
  }

  if (doc._status === "published") {
    revalidateLocalizedPagePaths(doc.slug);
    revalidateTag("pages", "max");
    revalidateTag("sitemap-pages", "max");
    if (doc.slug) {
      revalidateTag(`page:${doc.slug}`, "max");
    }
  }

  if (previousDoc?._status === "published" && doc._status !== "published" && previousDoc.slug) {
    revalidateLocalizedPagePaths(previousDoc.slug);
    revalidateTag("pages", "max");
    revalidateTag("sitemap-pages", "max");
    revalidateTag(`page:${previousDoc.slug}`, "max");
  }

  if (
    doc._status === "published" &&
    previousDoc?._status === "published" &&
    previousDoc.slug &&
    doc.slug &&
    previousDoc.slug !== doc.slug
  ) {
    revalidateLocalizedPagePaths(previousDoc.slug);
    revalidateTag(`page:${previousDoc.slug}`, "max");
  }

  void notifyRemoteRevalidation();

  return doc;
};

export const revalidateCollectionDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { context },
}) => {
  if (context?.disableRevalidate || !doc?.slug) {
    return doc;
  }

  revalidateLocalizedPagePaths(doc.slug);
  revalidateTag("pages", "max");
  revalidateTag("sitemap-pages", "max");
  revalidateTag(`page:${doc.slug}`, "max");
  void notifyRemoteRevalidation();

  return doc;
};
