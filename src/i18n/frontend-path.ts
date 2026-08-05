import type { TypedLocale } from "payload";
import { routing } from "./routing";

/**
 * Public pathname for the frontend (respects `localePrefix: "as-needed"`).
 */
export const frontendPath = (pathname: string, locale: TypedLocale): string => {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (routing.localePrefix === "as-needed" && locale === routing.defaultLocale) {
    return normalized === "" ? "/" : normalized;
  }
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
};
