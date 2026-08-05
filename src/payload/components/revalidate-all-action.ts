"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { notifyRemoteRevalidation } from "@/utilities/notify-remote-revalidation";

const ALL_CMS_TAGS = [
  "pages",
  "sitemap-pages",
  "documents",
  "media",
  "redirects",
  "global:header",
  "global:footer",
];

export async function revalidateAllAction() {
  for (const tag of ALL_CMS_TAGS) {
    revalidateTag(tag, "max");
  }

  revalidatePath("/", "layout");

  void notifyRemoteRevalidation();

  return { revalidated: true };
}
