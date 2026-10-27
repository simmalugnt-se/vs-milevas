import type { HTMLAttributes, ReactNode } from "react";
import { Arrow } from "@/components/ui/arrow";
import { Card } from "@/components/ui/card";

/**
 * Text+Grid from Figma "04 — Blocks" (8389:4705): on Dark `bg-fill`, a Light panel (`bg-fill`) with
 * a Display L heading led by the `round` arrow, and three cards; `grid/margin` at the sides and
 * nothing above or below the panel.
 * - Desktop L and S: the cards in a row at the bottom of a panel at least 800px high, as Figma's
 *   frames, with at least `spacing/3xl` under the heading.
 * - Tablet and Mobile: the cards stacked, `spacing/lg` under the heading.
 * The cards keep the proportions Figma gives them at each mode's design width (327:274.67,
 * 752:242.67, 405.33:430 and 459:405).
 * The arrow is 32, 48, 56 and 64px (Mobile, Tablet, Desktop S, Desktop L), centred on the first
 * line. A line break in `heading` is kept, as in Figma's two lines ("Så enkelt" / "fungerar det").
 *
 * Reused by a Payload block with localized copy and visual editing markers.
 */

export type TextGridCard = {
  attributes?: HTMLAttributes<HTMLLIElement>;
  number: ReactNode;
  label: ReactNode;
  text: ReactNode;
  /** Background photo, e.g. a `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
};

type TextGridProps = HTMLAttributes<HTMLElement> & {
  headingAttributes?: HTMLAttributes<HTMLHeadingElement>;
  heading: string;
  /** The heading's element: `h1` when the block opens a page without a hero. */
  headingAs?: "h1" | "h2";
  cards: TextGridCard[];
};

export function TextGrid({
  heading,
  headingAs: Heading = "h2",
  cards,
  headingAttributes,
  ...attributes
}: TextGridProps) {
  return (
    <section {...attributes} className="mode-dark bg-bg-fill px-(--grid-margin)">
      {/* The navigation turns Light over the light box, and stays Dark over its photos. */}
      <div
        data-navigation="light"
        className="flex flex-col gap-(--spacing-lg) mode-light rounded-lg bg-bg-fill px-(--spacing-sm) py-(--spacing-xl) desktop-s:min-h-[50rem] desktop-s:justify-between desktop-s:gap-(--spacing-3xl)"
      >
        <Heading
          {...headingAttributes}
          className="whitespace-pre-line text-display-l text-ui-primary"
        >
          {/* Centred on the first line: half the line height (`sizes/3xl`) less half the arrow. */}
          <Arrow
            name="round"
            className="mt-2 mr-(--spacing-sm) inline-block size-8 align-top tablet:size-12 desktop-s:mt-3 desktop-s:size-14 desktop-l:mt-4 desktop-l:size-16"
          />
          {heading}
        </Heading>
        <ul data-navigation="dark" className="grid gap-(--grid-gap) desktop-s:grid-cols-3">
          {cards.map(({ attributes, ...card }, index) => (
            <li
              key={index}
              {...attributes}
              className="aspect-[327/274.67] tablet:aspect-[752/242.67] desktop-s:aspect-[405.33/430] desktop-l:aspect-[459/405]"
            >
              <Card {...card} className="size-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
