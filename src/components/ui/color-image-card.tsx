import type { HTMLAttributes, ReactNode } from "react";

export type ColorImageCardColor = "white" | "tejp" | "gray";

/** Default per color: White and Tejp are `bg-fill` in their mode, gray `bg-fill-secondary` in Light. */
const colorClasses: Record<ColorImageCardColor, string> = {
  white: "mode-light bg-bg-fill",
  tejp: "mode-tejp bg-bg-fill",
  gray: "mode-light bg-bg-fill-secondary",
};

/** The image look: Dark `bg-fill` behind the photo. */
const imageLook = {
  hover:
    "hover:mode-dark hover:bg-bg-fill data-[state=hover]:mode-dark data-[state=hover]:bg-bg-fill",
  static: "mode-dark bg-bg-fill",
};

/** The prototype's hover (While hovering → Change to, back the same way): 0.3s. */
const motion = "duration-300 ease-[cubic-bezier(0.796,0,0.3,1)] motion-reduce:transition-none";

/**
 * The photo fades in; for White and Tejp it also shrinks from 609 × 456 to the card's 527 × 394
 * around its centre (gray's only fades).
 */
const photo = {
  zoom: `scale-[1.1556] opacity-0 transition-[opacity,scale] ${motion} group-hover/color-card:scale-100 group-hover/color-card:opacity-100 group-data-[state=hover]/color-card:scale-100 group-data-[state=hover]/color-card:opacity-100`,
  fade: `opacity-0 transition-opacity ${motion} group-hover/color-card:opacity-100 group-data-[state=hover]/color-card:opacity-100`,
};

/** The text under the heading opens (a grid row from `0fr` to `1fr`) and fades in. */
const textRow = `grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] ${motion} group-hover/color-card:grid-rows-[1fr] group-hover/color-card:opacity-100 group-data-[state=hover]/color-card:grid-rows-[1fr] group-data-[state=hover]/color-card:opacity-100`;

/** `staticBelowDesktop`: the image look below Desktop S, over the default and its hover. */
const belowDesktop = {
  card: "max-desktop-s:mode-dark max-desktop-s:bg-bg-fill",
  photo: "max-desktop-s:scale-100 max-desktop-s:opacity-100",
  tag: "max-desktop-s:mode-tejp max-desktop-s:bg-bg-fill",
  text: "max-desktop-s:grid-rows-[1fr] max-desktop-s:opacity-100",
};

export type ColorImageCardProps = HTMLAttributes<HTMLDivElement> & {
  color?: ColorImageCardColor;
  /** Figma's `Static`: the image look all the time, with no hover. */
  static?: boolean;
  /** The image look below Desktop S and hover from it, as Card Slider's first card on Tablet and Mobile. */
  staticBelowDesktop?: boolean;
  /** Number in the tag, shown as `[01]`. */
  number: ReactNode;
  label: ReactNode;
  heading: ReactNode;
  /** Text M under the heading in the image look. */
  text: ReactNode;
  /** The photo, e.g. a `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
  /** `data-state="hover"` shows the hover look without a pointer (the kitchensink does). */
  "data-state"?: "hover";
};

/**
 * color-image-card from Figma "02 — Components" → "Cards" (8825:10793), in Figma's 518.667 × 388
 * proportion, or the one a block sets in `--card-aspect` (Card Slider does). Default is a colored card (White, Tejp or gray) with a Label S tag top left and a
 * Text XL heading bottom left. Hover and Static turn it Dark: the photo under 50% black, the tag on
 * `ui-brand` (the tag in Tejp, as on card) and the Text M text under the heading. Figma draws hover
 * for White and Tejp; the prototype hovers gray into Tejp's. On hover the photo and the text fade
 * in, the heading's color fades and the text pushes it up; the tag and the card change at once.
 */
export function ColorImageCard({
  color = "white",
  static: isStatic = false,
  staticBelowDesktop = false,
  number,
  label,
  heading,
  text,
  image,
  className,
  ...props
}: ColorImageCardProps) {
  return (
    <div
      className={`group/color-card relative flex aspect-(--card-aspect,389/291) flex-col justify-between overflow-hidden rounded-lg p-(--spacing-sm) ${
        isStatic ? imageLook.static : `${colorClasses[color]} ${imageLook.hover}`
      } ${staticBelowDesktop ? belowDesktop.card : ""} ${className ?? ""}`}
      {...props}
    >
      <div
        aria-hidden
        className={`absolute inset-0 ${isStatic ? "" : color === "gray" ? photo.fade : photo.zoom} ${
          staticBelowDesktop ? belowDesktop.photo : ""
        }`}
      >
        {image}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <p
        className={`relative flex gap-4 self-start text-label-s text-ui-primary ${
          isStatic
            ? "mode-tejp bg-bg-fill"
            : "group-hover/color-card:mode-tejp group-hover/color-card:bg-bg-fill group-data-[state=hover]/color-card:mode-tejp group-data-[state=hover]/color-card:bg-bg-fill"
        } ${staticBelowDesktop ? belowDesktop.tag : ""}`}
      >
        <span>[{number}]</span>
        <span aria-hidden>{"///"}</span>
        <span>{label}</span>
      </p>
      <div className="relative flex flex-col text-ui-primary">
        <p className={`text-text-xl ${isStatic ? "" : `transition-colors ${motion}`}`}>{heading}</p>
        <div
          className={isStatic ? "" : `${textRow} ${staticBelowDesktop ? belowDesktop.text : ""}`}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="pt-(--spacing-sm) text-text-m">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
