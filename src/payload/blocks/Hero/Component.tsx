import { PayloadMedia } from "@/components/cms/payload-media";
import type { HeroBlock, LayoutBlockComponentProps } from "../types";

export function HeroBlockComponent({ block }: LayoutBlockComponentProps<HeroBlock>) {
  return (
    <section className="surface grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:gap-8 lg:p-8">
      <div className="space-y-5">
        {block.headline ? (
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
            {block.headline}
          </h1>
        ) : null}
        {block.summary ? (
          <p className="max-w-2xl text-base leading-7 text-neutral-600">{block.summary}</p>
        ) : null}
      </div>
      {block.image ? (
        <div className="relative aspect-video overflow-hidden border border-neutral-200 bg-neutral-100">
          <PayloadMedia
            className="h-full w-full object-cover"
            fill
            media={block.image}
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      ) : null}
    </section>
  );
}
