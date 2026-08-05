import { PayloadMedia } from "@/components/cms/payload-media";
import type { LayoutBlockComponentProps, MediaBlock } from "../types";

const layoutClasses: Record<NonNullable<MediaBlock["layout"]>, string> = {
  full: "px-0",
  inset: "mx-auto max-w-4xl",
  split: "mx-auto max-w-3xl",
};

export function MediaBlockComponent({ block }: LayoutBlockComponentProps<MediaBlock>) {
  const layout = block.layout ?? "full";

  if (!block.media) {
    return null;
  }

  return (
    <figure className={layoutClasses[layout]}>
      <div className="surface relative overflow-hidden">
        <PayloadMedia
          className="h-auto w-full object-cover"
          controls
          media={block.media}
          preferredSize={layout !== "full" ? "card" : undefined}
          sizes={layout === "full" ? "100vw" : "(min-width: 1024px) 60vw, 100vw"}
        />
      </div>
      {block.caption ? (
        <figcaption className="mt-4 text-sm leading-6 text-stone-500">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}
