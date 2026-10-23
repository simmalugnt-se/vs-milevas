import type { HTMLAttributes } from "react";
import { ColorImageCard, type ColorImageCardProps } from "@/components/ui/color-image-card";

export type CardSliderCard = Omit<ColorImageCardProps, "number" | "static" | "staticBelowDesktop">;

type CardSliderProps = HTMLAttributes<HTMLElement> & {
  cards: CardSliderCard[];
  /** Accessible name of the list. */
  label?: string;
};

/**
 * Card Slider from Figma "04 — Blocks" (8946:8317): a row of color-image-cards `grid/gap` apart,
 * from `grid/margin` on the left and past the screen's right edge, scrolled sideways and snapping
 * to each card. The cards are numbered `[01]`, `[02]` … in order.
 * - Desktop L and S: 518.67 × 388, the card's own proportion, the same width in both.
 * - Tablet: 455 × 388. Mobile: 310 × 312.
 * Below Desktop S the first card shows the image look, as Figma draws it; from Desktop S it shows
 * it on hover.
 */
export function CardSlider({ cards, label, ...attributes }: CardSliderProps) {
  return (
    <section {...attributes} aria-label={label} className="mode-dark bg-bg-fill">
      <ul className="flex snap-x snap-mandatory scroll-px-(--grid-margin) gap-(--grid-gap) overflow-x-auto px-(--grid-margin) [scrollbar-width:none]">
        {cards.map((card, index) => (
          <li
            key={index}
            className="w-[19.375rem] shrink-0 snap-start [--card-aspect:310/312] tablet:w-[28.4375rem] tablet:[--card-aspect:455/388] desktop-s:w-[32.4167rem] desktop-s:[--card-aspect:389/291]"
          >
            <ColorImageCard
              {...card}
              number={String(index + 1).padStart(2, "0")}
              staticBelowDesktop={index === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
