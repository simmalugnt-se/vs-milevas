/** The page to take a block from, when the first one with the block is not representative. */
export const blockPreviewPages: Record<string, string> = {
  imageText: "om-oss",
  textBoxinfo: "home",
};

/** Blocks shown on a Light grey page: the boilerplate's dark text, and the configurator. */
export const lightBackgroundBlocks = new Set([
  "hero",
  "richText",
  "media",
  "gallery",
  "cards",
  "faq",
  "callToAction",
  "columns",
  "configurator",
]);
