import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateMedia: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("media", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("media", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};
