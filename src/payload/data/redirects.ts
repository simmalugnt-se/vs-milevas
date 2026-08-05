import { unstable_cache } from "next/cache";
import type { TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";

type RedirectReferenceValue =
  | {
      slug?: string | null;
    }
  | string
  | null
  | undefined;

type RedirectReference = {
  relationTo?: string | null;
  value?: RedirectReferenceValue;
} | null;

type RedirectDoc = {
  from?: string | null;
  to?: {
    reference?: RedirectReference;
    url?: string | null;
  } | null;
};

function normalizePathname(pathname: string) {
  const value = pathname.trim() || "/";
  const [pathOnly] = value.split(/[?#]/, 1);
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  if (withLeadingSlash === "/") {
    return withLeadingSlash;
  }
  return withLeadingSlash.replace(/\/+$/, "");
}

function hasExplicitLocalePrefix(pathname: string) {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function stripLocalePrefix(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return "/";
    }
    if (pathname.startsWith(`/${locale}/`)) {
      const stripped = pathname.slice(locale.length + 1);
      return stripped.startsWith("/") ? stripped : `/${stripped}`;
    }
  }

  return pathname;
}

function splitPathSuffix(value: string) {
  const match = value.match(/^([^?#]*)(.*)$/);
  return {
    path: match?.[1] || value,
    suffix: match?.[2] || "",
  };
}

function isExternalURL(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value) || value.startsWith("//");
}

function localizeInternalPath(pathname: string, locale: TypedLocale) {
  const { path, suffix } = splitPathSuffix(pathname);
  const normalized = normalizePathname(path);

  if (hasExplicitLocalePrefix(normalized)) {
    return `${normalized}${suffix}`;
  }

  return `${frontendPath(normalized, locale)}${suffix}`;
}

function resolvePagePath(
  value: Extract<RedirectReferenceValue, { slug?: string | null }>,
  locale: TypedLocale,
) {
  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  const pathname = !slug || slug === "home" ? "/" : `/${slug}`;
  return frontendPath(pathname, locale);
}

async function fetchRedirects(): Promise<RedirectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "redirects" as never,
    depth: 1,
    limit: 0,
    overrideAccess: true,
    pagination: false,
  });

  return result.docs as RedirectDoc[];
}

const getCachedRedirects = () =>
  unstable_cache(fetchRedirects, ["redirects"], {
    tags: ["redirects"],
  });

async function resolveReferencePath(reference: RedirectReference, locale: TypedLocale) {
  if (!reference?.relationTo || !reference.value) {
    return null;
  }

  if (typeof reference.value === "object") {
    if (reference.relationTo === "pages") {
      return resolvePagePath(reference.value, locale);
    }

    return null;
  }

  const payload = await getPayloadClient();
  const document = await payload.findByID({
    collection: reference.relationTo as never,
    id: reference.value,
    overrideAccess: true,
  });

  if (
    reference.relationTo === "pages" &&
    document &&
    typeof document === "object" &&
    "slug" in document
  ) {
    return resolvePagePath(document as { slug?: string | null }, locale);
  }

  return null;
}

export async function getRedirectDestination(
  url: string,
  locale: TypedLocale,
): Promise<string | null> {
  if (!(await getPayloadDbReady()).ready) {
    return null;
  }

  const redirects = await getCachedRedirects()();
  const normalizedURL = normalizePathname(url);
  const candidatePaths = new Set([normalizedURL, stripLocalePrefix(normalizedURL)]);

  const match = redirects.find((redirect) => {
    if (!redirect.from) {
      return false;
    }

    return candidatePaths.has(normalizePathname(redirect.from));
  });

  if (!match?.to) {
    return null;
  }

  if (typeof match.to.url === "string" && match.to.url.trim()) {
    const target = match.to.url.trim();
    return isExternalURL(target) ? target : localizeInternalPath(target, locale);
  }

  return resolveReferencePath(match.to.reference ?? null, locale);
}
