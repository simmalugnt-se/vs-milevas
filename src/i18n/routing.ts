import { defineRouting } from "next-intl/routing";
import type { TypedLocale } from "payload";

export const routing = defineRouting({
  locales: ["en", "sv"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export function isTypedLocale(value: string | null | undefined): value is TypedLocale {
  return Boolean(value) && routing.locales.includes(value as TypedLocale);
}

export function getTypedLocale(value: string | null | undefined): TypedLocale {
  return isTypedLocale(value) ? value : (routing.defaultLocale as TypedLocale);
}
