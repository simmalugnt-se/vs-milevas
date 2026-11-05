/** The page to take a block from, when the first one with the block is not representative. */
export const blockPreviewPages: Record<string, string> = {
  imageText: "om-oss",
  textBoxinfo: "home",
};

/** Blocks that are light on their page: dark in the picker, so that all the pictures match. */
export const darkPreviewBlocks = new Set(["configurator"]);
