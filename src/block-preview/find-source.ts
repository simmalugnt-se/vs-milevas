import type { TypedLocale } from "payload";
import type { LayoutBlock } from "@/payload/blocks";
import { getPayloadClient } from "@/payload/get-payload";
import { blockPreviewPages } from "./catalog";
import { sampleBlock } from "./samples";

/** The first published occurrence of the block, sorted on slug, or else sample content. */
export async function findBlockPreviewSource(
  blockType: string,
  locale: TypedLocale,
): Promise<LayoutBlock | null> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pages",
    depth: 2,
    draft: false,
    locale,
    overrideAccess: false,
    pagination: false,
    sort: "slug",
    ...(blockPreviewPages[blockType]
      ? { where: { slug: { equals: blockPreviewPages[blockType] } } }
      : {}),
  });
  for (const doc of docs) {
    const match = (doc.layout ?? []).find((block) => block.blockType === blockType);
    if (match) return match;
  }

  const { docs: images } = await payload.find({
    collection: "images",
    limit: 1,
    locale,
    overrideAccess: false,
    where: { filename: { equals: "article-forklift.jpg" } },
  });
  const { docs: anyImages } = images.length
    ? { docs: images }
    : await payload.find({ collection: "images", limit: 1, locale, overrideAccess: false });
  return sampleBlock(blockType, anyImages[0] ?? null);
}
