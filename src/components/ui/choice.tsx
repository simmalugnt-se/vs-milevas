import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * choice from Figma "02 — Components" → "Configurator" (9207:30462): one option in a configurator
 * step, a `bg-fill` box with a `stroke/width` frame in `border-primary`, `spacing/sm` around and
 * `spacing/md` between the parts. The frame is drawn inside, as Figma's stroke is.
 * - Top: the title in Display XS, and the price in Label S (`ui-secondary`) top right, at least
 *   `spacing/sm` from the title. A word too long for the box breaks at its soft hyphens (the truck
 *   data's `|`), otherwise anywhere, as in Figma.
 * - Text S is Text XS, text M is Text M; `ui-tertiary`, `ui-secondary` when active or hovered.
 * - Active (`selected`) and hover are both Tejp: the yellow `bg-fill` and the darker frame.
 * - `bottom` rounds the bottom corners (`radius-sm`), for the last choice of a box.
 * - With a `big` image the parts are `spacing/2xs` apart and the choice is Figma's 262px high at
 *   234.5, 368 and 469px wide: the 489:365 image takes the height between title and text and, in a
 *   narrow choice, reaches past the padding at the sides as in Figma.
 * - With a `small` image the choice is two columns `spacing/sm` apart: the title over the text on
 *   the left, the price over the 124 × 93 image on the right, `spacing/xs` between them however
 *   high the choice is, so the text never runs under the image. Figma lays the image over title and
 *   text in a 140px choice; this is at least that high (see figma-notes).
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
    image: "h-full",
  },
  small: {
    choice: "min-h-[8.75rem] gap-(--spacing-sm)",
    wrapper: "gap-(--spacing-xs)",
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
  const textElement = text ? (
    <span
      className={`block w-full ${textSize === "m" ? "text-text-m" : "text-text-xs"} ${
        selected
          ? "text-ui-secondary"
          : "text-ui-tertiary group-hover/choice:text-ui-secondary group-data-[state=hover]/choice:text-ui-secondary"
      }`}
    >
      {text}
    </span>
  ) : null;

  const titleElement = (
    <span className="min-w-0 flex-1 text-display-xs text-ui-primary">{title}</span>
  );
  const priceElement = price ? (
    <span className="shrink-0 whitespace-nowrap text-label-s text-ui-secondary">{price}</span>
  ) : null;
  const small = Boolean(image) && imageSize === "small";

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`group/choice flex w-full items-start bg-bg-fill p-(--spacing-sm) text-left wrap-break-word ring-(length:--stroke-width) ring-border-primary ring-inset hover:mode-tejp data-[state=hover]:mode-tejp ${
        small ? "flex-row" : "flex-col"
      } ${image ? imageClasses[imageSize].choice : "gap-(--spacing-md)"} ${
        selected ? "mode-tejp" : ""
      } ${bottom ? "rounded-b-sm" : ""} ${className ?? ""}`}
      {...props}
    >
      {small ? (
        <>
          <span className="flex min-w-0 flex-1 flex-col justify-between gap-(--spacing-xs) self-stretch">
            {titleElement}
            {textElement}
          </span>
          <span className={`flex shrink-0 flex-col items-end ${imageClasses.small.wrapper}`}>
            {priceElement}
            <span className={`relative block aspect-[489/365] ${imageClasses.small.image}`}>
              {image}
            </span>
          </span>
        </>
      ) : (
        <>
          <span className="flex w-full items-start justify-between gap-(--spacing-sm)">
            {titleElement}
            {priceElement}
          </span>
          {image ? (
            <span className={`flex min-h-0 w-full flex-1 p-2 ${imageClasses.big.wrapper}`}>
              <span
                className={`relative block shrink-0 aspect-[489/365] ${imageClasses.big.image}`}
              >
                {image}
              </span>
            </span>
          ) : null}
          {textElement}
        </>
      )}
    </button>
  );
}
