import type { HTMLAttributes, ReactNode } from "react";

/**
 * card from Figma "02 — Components" → "Cards" (8389:4461): a photo with a darkening gradient, a
 * numbered tag top left, Text XL bottom left and, optionally, a Text M paragraph under it (Figma's
 * `showParagraph`). 459:405 like Figma unless the parent sets a size. The card is in Dark mode (text
 * `ui-primary`), the tag in Tejp; the gradient is black 40% → 20%, which is not a variable.
 */

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Background photo, e.g. a `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
  /** Number in the tag, shown as `[01]`. */
  number: ReactNode;
  label: ReactNode;
  text: ReactNode;
  /** Text M under `text`; none by default. */
  paragraph?: ReactNode;
};

export function Card({ image, number, label, text, paragraph, className, ...props }: CardProps) {
  return (
    <div
      className={`mode-dark relative flex aspect-[459/405] flex-col justify-between overflow-hidden rounded-lg p-(--spacing-sm) ${className ?? ""}`}
      {...props}
    >
      <div aria-hidden className="absolute inset-0">
        {image}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/20" />
      </div>
      <p className="relative flex gap-2 self-start mode-tejp bg-bg-fill px-0.5 py-px text-label-s text-ui-primary">
        <span>[{number}]</span>
        <span aria-hidden>{"///"}</span>
        <span>{label}</span>
      </p>
      <div className="relative text-ui-primary">
        <p className="text-text-xl">{text}</p>
        {paragraph ? <p className="text-text-m">{paragraph}</p> : null}
      </div>
    </div>
  );
}
