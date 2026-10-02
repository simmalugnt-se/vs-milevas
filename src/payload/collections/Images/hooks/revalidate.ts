import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateImages: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("images", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateImagesDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("images", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};
