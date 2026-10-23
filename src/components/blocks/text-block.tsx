import type { HTMLAttributes, ReactNode } from "react";
import { Arrow } from "@/components/ui/arrow";

type TextBlockProps = HTMLAttributes<HTMLElement> & {
  /** Text XL. */
  text: ReactNode;
  /** Text M under it (Figma's `paragraph=true`). */
  paragraph?: ReactNode;
};

/**
 * Text-block from Figma "04 — Blocks" (8946:10622): on Dark `bg-fill`, the `up-forward` arrow on
 * the left and a Text XL text, with an optional Text M paragraph `spacing/md` under it in the same
 * columns. `spacing/md` at the sides and `spacing/3xl` above and below.
 * - Desktop L and S: the text over columns 6–12 of 12, the arrow 96 × 58 in the first.
 * - Tablet: the text over columns 2–6 of 6, the arrow 64 × 39.
 * - Mobile: the arrow turned down (28 × 48) above the text, `spacing/md` between.
 */
export function TextBlock({ text, paragraph, ...attributes }: TextBlockProps) {
  return (
    <section
      {...attributes}
      className="grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) gap-y-(--spacing-md) mode-dark bg-bg-fill px-(--spacing-md) py-(--spacing-3xl) text-ui-primary"
    >
      <span className="relative col-span-full block h-12 w-7 tablet:col-span-1 tablet:row-start-1 tablet:h-[2.4375rem] tablet:w-16 desktop-s:h-[3.625rem] desktop-s:w-24">
        <Arrow
          name="up-forward"
          className="absolute top-1/2 left-1/2 h-7 w-12 -translate-1/2 rotate-90 tablet:static tablet:size-full tablet:translate-none tablet:rotate-0"
        />
      </span>
      <p className="col-span-full text-text-xl text-pretty tablet:col-span-5 tablet:col-start-2 tablet:row-start-1 desktop-s:col-span-7 desktop-s:col-start-6">
        {text}
      </p>
      {paragraph ? (
        <p className="col-span-full text-text-m tablet:col-span-5 tablet:col-start-2 desktop-s:col-span-7 desktop-s:col-start-6">
          {paragraph}
        </p>
      ) : null}
    </section>
  );
}
