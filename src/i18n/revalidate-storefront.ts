import { revalidatePath } from "next/cache";
import type { TypedLocale } from "payload";
import { frontendPath } from "./frontend-path";
import { routing } from "./routing";

/** Revalidates the same logical route for every configured locale (next-intl prefixes). */
export function revalidateStorefrontPath(pathname: string) {
  for (const locale of routing.locales) {
    revalidatePath(frontendPath(pathname, locale as TypedLocale));
  }
}
