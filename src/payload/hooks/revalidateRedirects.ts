import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { REDIRECTS_CACHE_PROFILE, REDIRECTS_CACHE_TAG } from "@/payload/cache-tags";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag(REDIRECTS_CACHE_TAG, REDIRECTS_CACHE_PROFILE);
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateRedirectDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag(REDIRECTS_CACHE_TAG, REDIRECTS_CACHE_PROFILE);
    void notifyRemoteRevalidation();
  }

  return doc;
};
