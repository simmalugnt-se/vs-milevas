import type { HTMLAttributes, ReactNode } from "react";

/**
 * card from Figma "02 — Components" → "Cards" (8389:4461): a photo with a darkening gradient, a
 * numbered tag top left and Text XL bottom left. 459:405 like Figma unless the parent sets a size.
 * Figma's text is #f5f5f5 and the gradient black 40% → 20%; neither is a variable, so the text uses
 * `ui-inv-primary` (#f0f0f0) and the gradient plain black.
 */

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Background photo, e.g. a `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
  /** Number in the tag, shown as `[01]`. */
  number: ReactNode;
  label: ReactNode;
  text: ReactNode;
};

export function Card({ image, number, label, text, className, ...props }: CardProps) {
  return (
    <div
      className={`relative flex aspect-[459/405] flex-col justify-between overflow-hidden rounded-lg p-(--spacing-sm) ${className ?? ""}`}
      {...props}
    >
      <div aria-hidden className="absolute inset-0">
        {image}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/20" />
      </div>
      <p className="relative flex gap-2 self-start bg-bg-surface px-0.5 py-px text-label-s text-ui-primary">
        <span>[{number}]</span>
        <span aria-hidden>{"///"}</span>
        <span>{label}</span>
      </p>
      <p className="relative text-text-xl text-ui-inv-primary">{text}</p>
    </div>
  );
}
