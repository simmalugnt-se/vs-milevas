import { defineRouting } from "next-intl/routing";
import type { TypedLocale } from "payload";

export const routing = defineRouting({
  // Swedish only for now; add "en" back to publish the English site and edit English content.
  locales: ["sv"],
  defaultLocale: "sv",
  localePrefix: "as-needed",
  localeDetection: false,
});

export function isTypedLocale(value: string | null | undefined): value is TypedLocale {
  return Boolean(value) && routing.locales.includes(value as TypedLocale);
}

export function getTypedLocale(value: string | null | undefined): TypedLocale {
  return isTypedLocale(value) ? value : (routing.defaultLocale as TypedLocale);
}
