import type { Block } from "payload";

/** Adds the generated preview from `public/block-thumbnails/<slug>.webp` to the block picker. */
export function withBlockThumbnails(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    const label = typeof block.labels?.singular === "string" ? block.labels.singular : block.slug;

    return {
      ...block,
      admin: {
        ...block.admin,
        images: {
          ...block.admin?.images,
          thumbnail: {
            url: `/block-thumbnails/${block.slug}.webp`,
            alt: `Förhandsvisning av ${label}`,
          },
        },
      },
    };
  });
}
