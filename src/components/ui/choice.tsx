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
 * - With an image the parts are `spacing/2xs` apart and the choice has Figma's height, the same at
 *   368 and 469px wide: 262 for `big`, where the 489:365 image fills the room between title and
 *   text, and 140 for `small`, where a 124 × 93 image sits right and reaches over title and text.
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
  /** Product image, e.g. a `next/image` with `fill`; it fills a 489:365 box. */
  image?: ReactNode;
  /** Figma's `image=big|small`. */
  imageSize?: "big" | "small";
  "data-state"?: "hover";
};

/** Figma's heights at 1440, in rem; the image box centres on the room left, as in Figma. */
const imageClasses = {
  big: {
    choice: "h-[16.375rem] gap-(--spacing-2xs)",
    wrapper: "items-center justify-center",
    image: "h-full max-w-full",
  },
  small: {
    choice: "h-[8.75rem] gap-(--spacing-2xs)",
    wrapper: "items-center justify-end",
    image: "w-[7.75rem]",
  },
} as const;

export function Choice({
  title,
  price,
  text,
  textSize = "s",
  selected = false,
  bottom = false,
  image,
  imageSize = "big",
  className,
  type = "button",
  ...props
}: ChoiceProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`group/choice flex w-full flex-col items-start bg-bg-fill p-(--spacing-sm) text-left wrap-break-word ring-(length:--stroke-width) ring-border-primary ring-inset hover:mode-tejp data-[state=hover]:mode-tejp ${
        image ? imageClasses[imageSize].choice : "gap-(--spacing-md)"
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
        <span className={`flex min-h-0 w-full flex-1 p-2 ${imageClasses[imageSize].wrapper}`}>
          <span
            className={`relative block shrink-0 aspect-[489/365] ${imageClasses[imageSize].image}`}
          >
            {image}
          </span>
        </span>
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
