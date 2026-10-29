import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import { CardSlider } from "@/components/blocks/card-slider";
import { resolvePayloadMedia } from "@/payload/utilities/media";
import type { CardSliderBlock, LayoutBlockComponentProps } from "../types";

export function CardSliderBlockComponent({ block }: LayoutBlockComponentProps<CardSliderBlock>) {
  return (
    <CardSlider
      id={block.anchor ?? undefined}
      label={block.label ?? undefined}
      cards={block.cards.map((card) => {
        const media = resolvePayloadMedia(card.image);
        return {
          ...editableBlock(card),
          // "Ingen färg" is the card's Static look: the image all the time, with no hover.
          ...(card.color === "image" ? { static: true } : { color: card.color }),
          label: <span {...editableField("label")}>{card.label}</span>,
          heading: <span {...editableField("heading")}>{card.heading}</span>,
          text: card.text ? (
            <span className="whitespace-pre-line" {...editableField("text")}>
              {card.text}
            </span>
          ) : null,
          image:
            media?.kind === "image" ? (
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="(min-width: 1024px) 36vw, 60vw"
                className="object-cover"
              />
            ) : null,
        };
      })}
    />
  );
}
