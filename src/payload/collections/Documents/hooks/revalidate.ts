import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

export const revalidateDocuments: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("documents", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};

export const revalidateDocumentsDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context?.disableRevalidate) {
    revalidateTag("documents", "max");
    void notifyRemoteRevalidation();
  }

  return doc;
};
