import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * choice from Figma "02 — Components" → "Configurator" (9207:30462): one option in a configurator
 * step, a `bg-fill` box with a `stroke/width` frame in `border-primary`, `spacing/sm` around and
 * `spacing/md` between the parts. The frame is drawn inside, as Figma's stroke is.
 * - Top: the title in Display XS, and the price in Label S (`ui-secondary`) top right. Figma breaks
 *   a word too long for the box.
 * - Text S is Text XS, text M is Text M; `ui-tertiary`, `ui-secondary` when active or hovered.
 * - Active (`selected`) and hover are both Tejp: the yellow `bg-fill` and the darker frame.
 * - `bottom` rounds the bottom corners (`radius-sm`), for the last choice of a box.
 * Pass `data-state="hover"` to show hover without a pointer.
 */

type ChoiceProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: ReactNode;
  price?: ReactNode;
  text?: ReactNode;
  textSize?: "s" | "m";
  /** Figma's `active`. */
  selected?: boolean;
  /** Figma's `bottom`: rounded bottom corners. */
  bottom?: boolean;
  /** Product image, e.g. a `next/image` with `fill`; it is contained in a 489:365 box. */
  image?: ReactNode;
  "data-state"?: "hover";
};

export function Choice({
  title,
  price,
  text,
  textSize = "s",
  selected = false,
  bottom = false,
  image,
  className,
  type = "button",
  ...props
}: ChoiceProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`group/choice flex w-full flex-col items-start bg-bg-fill p-(--spacing-sm) text-left wrap-break-word ring-(length:--stroke-width) ring-border-primary ring-inset hover:mode-tejp data-[state=hover]:mode-tejp ${
        image ? "gap-(--spacing-2xs)" : "gap-(--spacing-md)"
      } ${selected ? "mode-tejp" : ""} ${bottom ? "rounded-b-sm" : ""} ${className ?? ""}`}
      {...props}
    >
      <span className="flex w-full items-start justify-between">
        <span className="min-w-0 flex-1 text-display-xs text-ui-primary">{title}</span>
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
            selected
              ? "text-ui-secondary"
              : "text-ui-tertiary group-hover/choice:text-ui-secondary group-data-[state=hover]/choice:text-ui-secondary"
          }`}
        >
          {text}
        </span>
      ) : null}
    </button>
  );
}
