import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";
import type { LinkFieldValue } from "@/payload/utilities/link-field";
import { resolveLinkField, resolveLinkFieldHref } from "@/payload/utilities/link-field";
import type { Image } from "@/payload-types";

export type NavItem = {
  id?: string | null;
  link: LinkFieldValue;
};

/**
 * A Header menu: its label (and link without `links`), its links and its image. With `source`
 * `truckFamilies` its links are the truck families instead.
 */
export type HeaderNavItem = NavItem & {
  source?: "links" | "truckFamilies" | null;
  links?: (NavItem & { image?: Image | string | null })[] | null;
  image?: Image | string | null;
};

export type HeaderData = {
  announcement?: string | null;
  announcementLink?: LinkFieldValue | null;
  cta?: LinkFieldValue | null;
  login?: { link?: LinkFieldValue | null; shortLabel?: string | null } | null;
  navItems?: HeaderNavItem[] | null;
  showAnnouncement?: boolean | null;
};

export type FooterData = {
  copyright?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  contactHeading?: string | null;
  socialLinks?: { id?: string | null; label: string; url: string }[] | null;
  linkGroups?:
    | {
        id?: string | null;
        heading: string;
        source?: "links" | "truckFamilies" | null;
        links?: NavItem[] | null;
      }[]
    | null;
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
