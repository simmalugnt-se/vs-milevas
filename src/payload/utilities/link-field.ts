type LinkReferenceValue = Record<string, unknown> | string;

type LinkReference = {
  relationTo?: string | null;
  value?: LinkReferenceValue | null;
} | null;

export type LinkFieldValue = {
  label?: string | null;
  newTab?: boolean | null;
  reference?: LinkReference;
  type?: "external" | "internal" | null;
  url?: string | null;
};

export type ResolvedLinkField = {
  href: string;
  isExternal: boolean;
  rel?: string;
  target?: "_blank";
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getReferenceString(value: object, key: string) {
  return asTrimmedString((value as Record<string, unknown>)[key]);
}

function getPageHref(slug: string) {
  if (!slug || slug === "home") {
    return "/";
  }

  return `/${slug}`;
}

export function resolveLinkReferenceHref(reference?: LinkReference) {
  const value = reference?.value;
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return getPageHref(asTrimmedString(value));
  }

  if (reference?.relationTo === "documents") {
    const url = getReferenceString(value, "url");
    if (!url) {
      return null;
    }
    return url;
  }

  const normalizedSlug = getReferenceString(value, "slug");
  return getPageHref(normalizedSlug);
}

function getInternalHref(reference?: LinkReference) {
  return resolveLinkReferenceHref(reference);
}

export function resolveLinkFieldHref(link?: LinkFieldValue | null) {
  if (!link) {
    return null;
  }

  if (link.type === "internal") {
    return getInternalHref(link.reference);
  }

  const url = asTrimmedString(link.url);
  return url || null;
}

export function resolveLinkField(link?: LinkFieldValue | null) {
  const href = resolveLinkFieldHref(link);

  if (!href) {
    return null;
  }

  const opensInNewTab = Boolean(link?.newTab);

  return {
    href,
    isExternal: link?.type === "external",
    ...(opensInNewTab
      ? {
          rel: "noopener noreferrer",
          target: "_blank" as const,
        }
      : {}),
  } satisfies ResolvedLinkField;
}
