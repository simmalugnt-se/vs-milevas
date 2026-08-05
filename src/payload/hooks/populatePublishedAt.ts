import type { CollectionBeforeChangeHook } from "payload";

type PublishedDoc = {
  _status?: string | null;
  publishedAt?: string | Date | null;
};

export const populatePublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const nextData = data as PublishedDoc;
  const previousData = originalDoc as PublishedDoc | undefined;

  if (nextData?._status !== "published") {
    return data;
  }

  if (nextData.publishedAt || previousData?.publishedAt) {
    return data;
  }

  return {
    ...nextData,
    publishedAt: new Date().toISOString(),
  };
};
