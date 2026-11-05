import configPromise from "../src/payload.config.ts";

/** The blocks in the pages' block picker, as Payload sees them. */
export async function getLayoutBlocks() {
  const config = await configPromise;
  const pages = config.collections.find((collection) => collection.slug === "pages");
  const layout = pages?.fields.find((field) => field.name === "layout");
  if (!layout) {
    const nested = pages?.flattenedFields?.find((field) => field.name === "layout");
    if (!nested) throw new Error("pages has no layout blocks field");
    return nested.blocks;
  }
  return layout.blocks;
}
