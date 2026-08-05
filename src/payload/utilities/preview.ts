import type { CollectionSlug, PayloadRequest, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";

type PreviewCollection = Extract<CollectionSlug, "pages">;

type PreviewPathData = {
  slug?: string | null;
};

/** Public document path (unencoded segments) for site URLs. */
export const getDocumentPath = (
  collection: PreviewCollection,
  data: PreviewPathData,
): string | null => {
  if (collection !== "pages") {
    return null;
  }

  if (!data.slug || data.slug === "home") {
    return "/";
  }

  return `/${data.slug}`;
};

type GeneratePreviewPathArgs = {
  collection: PreviewCollection;
  slug: string | null | undefined;
  req: PayloadRequest;
};

function normalizeRouteKey(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function previewLocale(req: PayloadRequest): TypedLocale {
  const raw = req.locale;
  if (raw === "en" || raw === "sv") {
    return raw;
  }
  return routing.defaultLocale as TypedLocale;
}

/**
 * Preview entry URL (Payload template shape): slug, collection, path, previewSecret.
 * Path uses encoded slug segments like the official template, except home → `/`.
 */
export const generatePreviewPath = ({ collection, slug, req }: GeneratePreviewPathArgs) => {
  const routeKey = normalizeRouteKey(slug);

  if (!routeKey) {
    return null;
  }

  const encodedSlug = encodeURIComponent(routeKey);
  const locale = previewLocale(req);

  let unlocalizedPath: string | null = null;

  if (collection === "pages") {
    if (routeKey === "home") {
      unlocalizedPath = "/";
    } else {
      unlocalizedPath = `/${encodedSlug}`;
    }
  }

  if (!unlocalizedPath) {
    return null;
  }

  const path = frontendPath(unlocalizedPath, locale);

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || "",
  });

  return `/${locale}/next/preview?${encodedParams.toString()}`;
};
