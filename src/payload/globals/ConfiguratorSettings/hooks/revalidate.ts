import { revalidatePath, revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";

export const revalidateConfiguratorSettings: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate && doc._status === "published") {
    revalidateTag("configurator-settings", "max");
    for (const locale of routing.locales) {
      revalidatePath(frontendPath("/configurator", locale as TypedLocale));
      revalidatePath(frontendPath("/configurator/quote", locale as TypedLocale));
    }
  }
  return doc;
};
