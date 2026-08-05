import { revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

const isPublished = (value: unknown) =>
  !value || typeof value !== "object" || !("_status" in value) || value._status === "published";

/**
 * Factory that creates a GlobalAfterChangeHook which revalidates
 * the given cache tag when the global is published.
 */
export function createRevalidateGlobalHook(tag: string): GlobalAfterChangeHook {
  return ({ doc, previousDoc, req: { context } }) => {
    if (!context?.disableRevalidate && (isPublished(doc) || isPublished(previousDoc))) {
      revalidateTag(tag, "max");
      void notifyRemoteRevalidation();
    }

    return doc;
  };
}
