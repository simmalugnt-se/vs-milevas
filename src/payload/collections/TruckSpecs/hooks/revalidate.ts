import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";

/** The catalog carries the specification types, so it is cached with them. */
export const revalidateTruckSpec: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.disableRevalidate) revalidateTag("truck-families", "max");
  return doc;
};
