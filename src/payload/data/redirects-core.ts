/**
 * Matching and resolving redirects without Next or Payload, so tests and hooks can use it. The
 * locales come in as arguments; `redirects.ts` passes the site's routing.
 */

export type RedirectReferenceValue =
  | {
      id?: string | number | null;
      slug?: string | null;
    }
  | string
  | number
  | null
  | undefined;

export type RedirectReference = {
  relationTo?: string | null;
  value?: RedirectReferenceValue;
} | null;

export type RedirectDoc = {
  id?: string | number;
  from?: string | null;
  to?: {
    reference?: RedirectReference;
    url?: string | null;
  } | null;
};

export type Routing = {
  defaultLocale: string;
  locales: readonly string[];
};

type ResolveRedirectDestinationArgs = Routing & {
  loadReference?: (
    relationTo: string,
    id: string | number,
  ) => Promise<Exclude<RedirectReferenceValue, string | number | null | undefined>>;
  locale: string;
  redirects: RedirectDoc[];
  url: string;
};

export function normalizePathname(pathname: string) {
  const value = pathname.trim() || "/";
  const [pathOnly] = value.split(/[?#]/, 1);
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  if (withLeadingSlash === "/") {
    return withLeadingSlash;
  }
  return withLeadingSlash.replace(/\/+$/, "");
}

/** The public path of a page with this slug, without a language prefix. */
export function pagePathname(slug: string | null | undefined) {
  const value = typeof slug === "string" ? slug.trim() : "";
  return !value || value === "home" ? "/" : `/${value}`;
}

function hasExplicitLocalePrefix(pathname: string, locales: readonly string[]) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function stripLocalePrefix(pathname: string, locales: readonly string[]) {
  for (const locale of locales) {
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

/** Like `@/i18n/frontend-path`, with `localePrefix: "as-needed"`. */
function frontendPath(pathname: string, locale: string, defaultLocale: string) {
  const normalized = normalizePathname(pathname);
  if (locale === defaultLocale) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

function localizeInternalPath(pathname: string, locale: string, routing: Routing) {
  const { path, suffix } = splitPathSuffix(pathname);
  const normalized = normalizePathname(path);

  if (hasExplicitLocalePrefix(normalized, routing.locales)) {
    return `${normalized}${suffix}`;
  }

  return `${frontendPath(normalized, locale, routing.defaultLocale)}${suffix}`;
}

/**
 * The redirect whose `from` is this path, with or without a language prefix: `/old` in a
 * redirect matches `/old` and `/sv/old`.
 */
export function findRedirect(redirects: RedirectDoc[], url: string, locales: readonly string[]) {
  const normalizedURL = normalizePathname(url);
  const candidatePaths = new Set([normalizedURL, stripLocalePrefix(normalizedURL, locales)]);

  return redirects.find(
    (redirect) => redirect.from && candidatePaths.has(normalizePathname(redirect.from)),
  );
}

/** The id a reference points at, populated or not. */
export function referenceId(reference: RedirectReference) {
  const value = reference?.value;
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return value?.id ?? undefined;
}

async function resolveReferencePath(
  reference: RedirectReference,
  args: Pick<ResolveRedirectDestinationArgs, "defaultLocale" | "loadReference" | "locale">,
) {
  if (reference?.relationTo !== "pages" || !reference.value) {
    return null;
  }

  let value = reference.value;
  if (typeof value === "string" || typeof value === "number") {
    if (!args.loadReference) {
      return null;
    }
    value = await args.loadReference(reference.relationTo, value);
  }

  return value ? frontendPath(pagePathname(value.slug), args.locale, args.defaultLocale) : null;
}

export async function resolveRedirectDestination(args: ResolveRedirectDestinationArgs) {
  const match = findRedirect(args.redirects, args.url, args.locales);

  if (!match?.to) {
    return null;
  }

  if (typeof match.to.url === "string" && match.to.url.trim()) {
    const target = match.to.url.trim();
    return isExternalURL(target) ? target : localizeInternalPath(target, args.locale, args);
  }

  return resolveReferencePath(match.to.reference ?? null, args);
}
