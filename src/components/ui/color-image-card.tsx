import type { HTMLAttributes, ReactNode } from "react";

export type ColorImageCardColor = "white" | "tejp" | "gray";

/** Default per color: White and Tejp are `bg-fill` in their mode, gray `bg-fill-secondary` in Light. */
const colorClasses: Record<ColorImageCardColor, string> = {
  white: "mode-light bg-bg-fill",
  tejp: "mode-tejp bg-bg-fill",
  gray: "mode-light bg-bg-fill-secondary",
};

/** The image look: Dark `bg-fill` behind the photo. Figma has no hover for gray. */
const imageLook = {
  hover:
    "hover:mode-dark hover:bg-bg-fill data-[state=hover]:mode-dark data-[state=hover]:bg-bg-fill",
  static: "mode-dark bg-bg-fill",
};

/** Hidden until hover; shown all the time when static. */
const showOnImage = {
  hover: "hidden group-hover/color-card:block group-data-[state=hover]/color-card:block",
  static: "",
};

type ColorImageCardProps = HTMLAttributes<HTMLDivElement> & {
  color?: ColorImageCardColor;
  /** Figma's `Static`: the image look all the time, with no hover. */
  static?: boolean;
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
 * proportion. Default is a colored card (White, Tejp or gray) with a Label S tag top left and a
 * Text XL heading bottom left. Hover (White and Tejp) and Static turn it Dark: the photo under 50%
 * black, the tag on `ui-brand` (the tag in Tejp, as on card) and the Text M text under the heading.
 */
export function ColorImageCard({
  color = "white",
  static: isStatic = false,
  number,
  label,
  heading,
  text,
  image,
  className,
  ...props
}: ColorImageCardProps) {
  const look = isStatic ? "static" : color === "gray" ? null : "hover";

  return (
    <div
      className={`group/color-card relative flex aspect-[389/291] flex-col justify-between overflow-hidden rounded-lg p-(--spacing-sm) ${
        look === "static"
          ? imageLook.static
          : `${colorClasses[color]} ${look ? imageLook[look] : ""}`
      } ${className ?? ""}`}
      {...props}
    >
      {look ? (
        <div aria-hidden className={`absolute inset-0 ${showOnImage[look]}`}>
          {image}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : null}
      <p
        className={`relative flex gap-4 self-start text-label-s text-ui-primary ${
          look === "static"
            ? "mode-tejp bg-bg-fill"
            : look
              ? "group-hover/color-card:mode-tejp group-hover/color-card:bg-bg-fill group-data-[state=hover]/color-card:mode-tejp group-data-[state=hover]/color-card:bg-bg-fill"
              : ""
        }`}
      >
        <span>[{number}]</span>
        <span aria-hidden>{"///"}</span>
        <span>{label}</span>
      </p>
      <div className="relative flex flex-col gap-(--spacing-sm) text-ui-primary">
        <p className="text-text-xl">{heading}</p>
        {look ? <p className={`text-text-m ${showOnImage[look]}`}>{text}</p> : null}
      </div>
    </div>
  );
}
