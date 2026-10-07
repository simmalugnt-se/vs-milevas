import type { HTMLAttributes, ReactNode } from "react";
import { Arrow } from "@/components/ui/arrow";
import { Card } from "@/components/ui/card";

/**
 * Text+Grid from Figma "04 — Blocks" (8389:4705): on `bg-inv-fill`, a light panel (`bg-fill`) with
 * a Display L heading led by the `round` arrow, and three cards.
 * - Desktop L and S: the cards in a row, `spacing/4xl` under the heading (128px on Desktop L, where
 *   Figma's 800px panel leaves 126px).
 * - Tablet and Mobile: the cards stacked, `spacing/lg` under the heading.
 * No fixed heights: the panel is as high as its content, and the cards keep the proportions Figma
 * gives them at each mode's design width (327:275, 752:242, 1:1 and 459:405).
 * The arrow is 32, 48 and 64px (Mobile, Tablet, Desktop). A line break in `heading` is kept, as in
 * Figma's two lines ("Så enkelt" / "fungerar det").
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
  cards: TextGridCard[];
};

export function TextGrid({ heading, cards, headingAttributes, ...attributes }: TextGridProps) {
  return (
    <section {...attributes} className="bg-bg-inv-fill p-(--grid-margin)">
      <div className="flex flex-col gap-(--spacing-lg) rounded-lg bg-bg-fill px-(--spacing-sm) py-(--spacing-xl) desktop-s:gap-(--spacing-4xl)">
        <h2 {...headingAttributes} className="whitespace-pre-line text-display-l text-ui-primary">
          <Arrow
            name="round"
            className="mr-(--spacing-sm) inline-block size-8 align-baseline tablet:size-12 desktop-s:size-16"
          />
          {heading}
        </h2>
        <ul className="grid gap-(--grid-gap) desktop-s:grid-cols-3">
          {cards.map(({ attributes, ...card }, index) => (
            <li
              key={index}
              {...attributes}
              className="aspect-[327/275] tablet:aspect-[752/242] desktop-s:aspect-square desktop-l:aspect-[459/405]"
            >
              <Card {...card} className="size-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
