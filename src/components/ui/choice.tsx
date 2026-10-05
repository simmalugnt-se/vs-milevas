import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Choice from Figma "02 — Components" → "Buttons etc" → "choice" (8268:3371): one option in a
 * configurator step. Rules above and below (`border-primary`), optionally on the right, and
 * `ui-brand` when selected. Text S uses Text XS, text M uses Text M; both grey (`ui-tertiary`) until
 * selected (`ui-secondary`). With an image the gaps shrink from `spacing/md` to `spacing/2xs`.
 * Figma has no hover or disabled state; disabled (an option that needs another choice first) is
 * dimmed to half opacity. When the title and price do not fit side by side, the price moves to a
 * line under the title, and a word longer than the choice is hyphenated or broken.
 */

type ChoiceProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: ReactNode;
  price?: ReactNode;
  text?: ReactNode;
  textSize?: "s" | "m";
  selected?: boolean;
  borderRight?: boolean;
  /** Product image, e.g. a `next/image` with `fill`; it is contained in a 489:365 box. */
  image?: ReactNode;
};

export function Choice({
  title,
  price,
  text,
  textSize = "s",
  selected = false,
  borderRight = false,
  image,
  className,
  type = "button",
  ...props
}: ChoiceProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`flex w-full flex-col items-start border-y border-border-primary p-(--spacing-sm) text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        image ? "gap-(--spacing-2xs)" : "gap-(--spacing-md)"
      } ${borderRight ? "border-r" : ""} ${selected ? "bg-ui-brand" : ""} ${className ?? ""}`}
      {...props}
    >
      <span className="flex w-full flex-wrap items-start justify-between gap-x-(--spacing-xs) gap-y-(--spacing-3xs)">
        <span className="min-w-0 grow hyphens-auto text-text-l text-ui-primary [overflow-wrap:break-word]">
          {title}
        </span>
        {price ? (
          <span className="shrink-0 whitespace-nowrap text-label-s text-ui-secondary">{price}</span>
        ) : null}
      </span>
      {image ? (
        <span className="relative mx-auto block aspect-[489/365] w-2/3">{image}</span>
      ) : null}
      {text ? (
        <span
          className={`w-full ${textSize === "m" ? "text-text-m" : "text-text-xs"} ${
            selected ? "text-ui-secondary" : "text-ui-tertiary"
          }`}
        >
          {text}
        </span>
      ) : null}
    </button>
  );
}
