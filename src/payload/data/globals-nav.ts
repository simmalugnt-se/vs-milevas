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

/** Locale-agnostic pathname for next-intl `Link` (it adds the locale prefix). */
export function resolveNavItemHref(item: NavItem): string {
  return resolveLinkFieldHref(item.link) ?? "#";
}

export function resolveNavItem(item: NavItem) {
  return resolveLinkField(item.link);
}
