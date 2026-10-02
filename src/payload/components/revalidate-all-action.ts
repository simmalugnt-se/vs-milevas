"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { REDIRECTS_CACHE_PROFILE, REDIRECTS_CACHE_TAG } from "@/payload/cache-tags";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

const ALL_CMS_TAGS = [
  "pages",
  "sitemap-pages",
  "documents",
  "images",
  "videos",
  REDIRECTS_CACHE_TAG,
  "global:header",
  "global:footer",
];

export async function revalidateAllAction() {
  for (const tag of ALL_CMS_TAGS) {
    revalidateTag(tag, tag === REDIRECTS_CACHE_TAG ? REDIRECTS_CACHE_PROFILE : "max");
  }

  revalidatePath("/", "layout");

  void notifyRemoteRevalidation();

  return { revalidated: true };
}
