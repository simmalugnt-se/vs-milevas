import type { CSSProperties, ReactNode } from "react";

export type TextBlockColumnsLogo = {
  /** The logo, e.g. a `next/image` with `className="h-auto w-full"`; light on dark. */
  image: ReactNode;
  /** Its width from Desktop S, in px at 1440 (Figma: KION 116, STILL 131, Linde 147, Baoli 108). */
  width?: number;
};

type TextBlockColumnsProps = {
  /** Figma: "Ett varumärke inom". */
  heading: ReactNode;
  /** The heading's element: `h1` when the block opens a page without a hero. */
  headingAs?: "h1" | "h2";
  text?: ReactNode;
  /** One column per logo (Figma: four). */
  logos: TextBlockColumnsLogo[];
  id?: string;
};

/**
 * text block Collumns from Figma "04 — Blocks" (8982:9898): Dark, one column per logo with a
 * `ui-brand` line between them (`stroke/width`), the logos at the bottom `spacing/4xl` up, and
 * the heading (Display L, white then yellow) and the text centred over them.
 * - Mobile: logos 60px wide, Text M, `spacing/sm` between heading and text, `spacing/md` at the
 *   sides.
 * - Tablet: logos 90px wide, Text L, `spacing/md` between, 562px wide.
 * - Desktop S and L: each logo its own width (`width`), the text 772px wide under an 851px heading.
 * The heading starts where Figma has it on each frame (28, 33, 26 and 23 % down); on Mobile long
 * words are hyphenated, as Figma's "varu-märke". Right after the
 * hero the two share their lines (`LinkedColumns`), and its own lines hide from Desktop S.
 */
export function TextBlockColumns({
  heading,
  headingAs: Heading = "h2",
  text,
  logos,
  id,
}: TextBlockColumnsProps) {
  return (
    <section
      id={id}
      className="relative h-svh min-h-[37.5rem] overflow-hidden mode-dark bg-bg-fill"
    >
      <ul className="flex h-full">
        {logos.map((logo, index) => (
          <li
            key={index}
            className={`flex min-w-0 flex-1 flex-col items-center justify-end pb-(--spacing-4xl) ${
              index < logos.length - 1
                ? "border-r-(length:--stroke-width) border-ui-brand desktop-s:group-data-[linked]/linked:border-transparent"
                : ""
            }`}
          >
            <span
              className="block w-[3.75rem] tablet:w-[5.625rem] desktop-s:w-(--logo-width)"
              style={{ "--logo-width": `${(logo.width ?? 120) / 16}rem` } as CSSProperties}
            >
              {logo.image}
            </span>
          </li>
        ))}
      </ul>
      <div className="absolute inset-x-0 top-[28.29%] z-10 mx-auto flex w-[calc(100%_-_2*var(--spacing-md))] flex-col items-center gap-(--spacing-sm) text-center text-ui-primary tablet:top-[33.13%] tablet:w-[35.125rem] tablet:gap-(--spacing-md) desktop-s:top-[26.48%] desktop-s:w-[53.1875rem] desktop-l:top-[22.99%]">
        <Heading className="text-display-l uppercase max-tablet:hyphens-auto">{heading}</Heading>
        {text ? (
          <p className="text-text-m tablet:text-text-l desktop-s:max-w-[48.25rem]">{text}</p>
        ) : null}
      </div>
    </section>
  );
}
