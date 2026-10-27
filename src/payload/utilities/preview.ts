import type { CollectionSlug, GlobalSlug, PayloadRequest, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { getTypedLocale } from "@/i18n/routing";

type PreviewCollection = Extract<CollectionSlug, "pages" | "truck-families">;

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
  return getTypedLocale(req.locale);
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
  let query = "";

  if (collection === "pages") {
    if (routeKey === "home") {
      unlocalizedPath = "/";
    } else {
      unlocalizedPath = `/${encodedSlug}`;
    }
  } else if (collection === "truck-families") {
    // A truck type has no page of its own: the configurator, opened on its first step.
    unlocalizedPath = "/configurator";
    query = `?${new URLSearchParams({ family: routeKey, step: "1" })}`;
  }

  if (!unlocalizedPath) {
    return null;
  }

  const path = `${frontendPath(unlocalizedPath, locale)}${query}`;

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || "",
  });

  return `/${locale}/next/preview?${encodedParams.toString()}`;
};

/** Globals previewed on `/global-preview`: the header and footer around neutral content. */
export type PreviewGlobal = Extract<GlobalSlug, "header" | "footer">;

export const GLOBAL_PREVIEW_PATH = "/global-preview";

/** Preview entry URL for a global, through the same route as pages. */
export const generateGlobalPreviewPath = ({
  global,
  req,
}: {
  global: PreviewGlobal;
  req: PayloadRequest;
}) => {
  const locale = previewLocale(req);
  const encodedParams = new URLSearchParams({
    global,
    path: frontendPath(GLOBAL_PREVIEW_PATH, locale),
    previewSecret: process.env.PREVIEW_SECRET || "",
  });

  return `/${locale}/next/preview?${encodedParams.toString()}`;
};
