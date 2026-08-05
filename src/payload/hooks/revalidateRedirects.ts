import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("redirects", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateRedirectDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("redirects", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};
