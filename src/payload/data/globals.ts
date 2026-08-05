import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";
import type { LinkFieldValue } from "@/payload/utilities/link-field";
import { resolveLinkField, resolveLinkFieldHref } from "@/payload/utilities/link-field";

export type NavItem = {
  id?: string | null;
  link: LinkFieldValue;
};

export type HeaderData = {
  navItems?: NavItem[] | null;
  siteName?: string | null;
  siteTagline?: string | null;
};

export type FooterData = {
  copyright?: string | null;
  navItems?: NavItem[] | null;
};

/** Locale-agnostic pathname for next-intl `Link` (it adds the locale prefix). */
export function resolveNavItemHref(item: NavItem): string {
  return resolveLinkFieldHref(item.link) ?? "#";
}

export function resolveNavItem(item: NavItem) {
  return resolveLinkField(item.link);
}

async function fetchHeader(locale: TypedLocale, draft: boolean): Promise<HeaderData> {
  const payload = await getPayloadClient();
  const data = await payload.findGlobal({
    slug: "header",
    locale,
    depth: 1,
    draft,
    overrideAccess: draft,
  });
  return data as HeaderData;
}

async function fetchFooter(locale: TypedLocale, draft: boolean): Promise<FooterData> {
  const payload = await getPayloadClient();
  const data = await payload.findGlobal({
    slug: "footer",
    locale,
    depth: 1,
    draft,
    overrideAccess: draft,
  });
  return data as FooterData;
}

const cachedHeader = (locale: TypedLocale) =>
  unstable_cache(async () => fetchHeader(locale, false), ["global-header", locale], {
    tags: ["global:header"],
  });

const cachedFooter = (locale: TypedLocale) =>
  unstable_cache(async () => fetchFooter(locale, false), ["global-footer", locale], {
    tags: ["global:footer"],
  });

export async function getHeader(locale: TypedLocale, draft = false): Promise<HeaderData> {
  if (!(await getPayloadDbReady()).ready) {
    return {};
  }

  if (draft) {
    unstable_noStore();
    return fetchHeader(locale, true);
  }

  return cachedHeader(locale)();
}

export async function getFooter(locale: TypedLocale, draft = false): Promise<FooterData> {
  if (!(await getPayloadDbReady()).ready) {
    return {};
  }

  if (draft) {
    unstable_noStore();
    return fetchFooter(locale, true);
  }

  return cachedFooter(locale)();
}
