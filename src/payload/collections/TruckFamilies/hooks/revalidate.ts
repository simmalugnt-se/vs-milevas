import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";

function revalidateConfigurator() {
  revalidateTag("truck-families", "max");
  for (const locale of routing.locales) {
    revalidatePath(frontendPath("/configurator", locale as TypedLocale));
    revalidatePath(frontendPath("/configurator/quote", locale as TypedLocale));
  }
}

export const revalidateTruckFamily: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (
    !req.context?.disableRevalidate &&
    (doc._status === "published" || previousDoc?._status === "published")
  ) {
    revalidateConfigurator();
  }
  return doc;
};

export const revalidateTruckFamilyDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) {
    revalidateConfigurator();
  }
  return doc;
};
