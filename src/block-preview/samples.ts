import type { LayoutBlock } from "@/payload/blocks";

/**
 * Content for the picker's blocks no published page uses, so that each has a picture. Only the
 * thumbnails use this. `image` is a published image, populated as on a page.
 */
export function sampleBlock(blockType: string, image: unknown): LayoutBlock | null {
  const samples: Record<string, Record<string, unknown>> = {
    articleList: {
      heading: "Att mäta upp före köpet:",
      items: [
        "Bredden på den smalaste gången",
        "Högsta hyllplanet",
        "Tyngsta lasten och dess mått",
        "Underlaget där trucken ska köra",
        "Antal timmar i drift per dag",
      ].map((row) => ({ text: row })),
      image,
      placement: "left",
    },
  };
  const sample = samples[blockType];
  return sample ? ({ blockType, ...sample } as unknown as LayoutBlock) : null;
}
