import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateVideos: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("videos", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateVideosDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("videos", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};
