import type { LayoutBlock } from "@/payload/blocks";

const text = (value: string) => ({
  type: "text",
  version: 1,
  text: value,
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
});
const node = { direction: null, format: "", indent: 0, version: 1 };
const richText = (...paragraphs: string[]) => ({
  root: {
    ...node,
    type: "root",
    children: paragraphs.map((paragraph) => ({
      ...node,
      type: "paragraph",
      textFormat: 0,
      children: [text(paragraph)],
    })),
  },
});

const button = { link: { type: "external", url: "#", label: "Bygg din truck" } };
const body = "Kort exempeltext som visar hur blocket ser ut med innehåll.";

/**
 * Content for the blocks no published page uses, so that every block in the picker has a picture.
 * Only the thumbnails use this. `image` is a published image, populated as on a page.
 */
export function sampleBlock(blockType: string, image: unknown): LayoutBlock | null {
  const media = { relationTo: "images", value: image };
  const samples: Record<string, Record<string, unknown>> = {
    articleList: {
      heading: "Lista",
      items: ["Första raden", "Andra raden", "Tredje raden", "Fjärde raden", "Femte raden"].map(
        (row) => ({ text: row }),
      ),
      image,
      placement: "left",
    },
    hero: { headline: "Hero", summary: body, media },
    richText: { content: richText("Fritext", body) },
    media: { media, caption: "Bildtext", layout: "full" },
    gallery: { images: [image, image, image, image] },
    cards: {
      heading: "Kortlista",
      items: ["Första", "Andra", "Tredje"].map((title) => ({ title, text: body })),
    },
    faq: {
      heading: "Vanliga frågor",
      items: ["Första frågan?", "Andra frågan?", "Tredje frågan?"].map((question) => ({
        question,
        answer: body,
      })),
    },
    callToAction: { title: "Uppmaning", text: body, button },
    columns: {
      columns: [
        { content: [{ blockType: "richText", content: richText("Kolumn", body) }] },
        { content: [{ blockType: "media", media, layout: "full" }] },
      ],
    },
  };
  const sample = samples[blockType];
  return sample ? ({ blockType, ...sample } as unknown as LayoutBlock) : null;
}
