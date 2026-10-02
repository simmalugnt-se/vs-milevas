import { editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { PayloadMedia } from "@/components/cms/payload-media";
import type { GalleryBlock, LayoutBlockComponentProps } from "../types";

export function GalleryBlockComponent({ block }: LayoutBlockComponentProps<GalleryBlock>) {
  if (!block.images?.length) {
    return null;
  }

  return (
    <section {...editableField("images")} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {block.images.map((image, index) => (
        <div
          key={typeof image === "object" ? image.id : `${image}-${index}`}
          className="relative aspect-square overflow-hidden border border-neutral-200 bg-neutral-100"
        >
          <PayloadMedia
            className="h-full w-full object-cover"
            fill
            media={image}
            preferredSize="card"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </div>
      ))}
    </section>
  );
}
