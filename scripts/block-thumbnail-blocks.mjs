import configPromise from "../src/payload.config.ts";

/** The blocks editors pick from for pages, as Payload sees them. */
export async function getPickerBlocks() {
  const config = await configPromise;
  const { pickerBlockSlugs } = await import("../src/payload/blocks/definitions.ts");
  const pages = config.collections.find((collection) => collection.slug === "pages");
  const layout = pages?.flattenedFields?.find((field) => field.name === "layout");
  if (!layout) throw new Error("pages has no layout blocks field");
  return layout.blocks.filter((block) => pickerBlockSlugs.includes(block.slug));
}
