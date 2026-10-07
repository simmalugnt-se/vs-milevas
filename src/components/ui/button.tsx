import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "./icon";

/**
 * Button and Link from Figma "02 — Components" → "Buttons etc" (button 8268:3068, Link 8309:3919).
 *
 * Hover in Figma swaps a row of two identical icons from start to end inside a clipped box, so the
 * icon slides out and its copy slides in. Pass `data-state="hover"` to show the hover look without a
 * pointer (the kitchensink does).
 *
 * TODO(motion): Figma has a `motion` variable collection, but no keyframes on these components and
 * no way to read the collection from a selection. 200ms ease-out is our own placeholder.
 */

export type ButtonColor = "primary" | "tejp" | "inverted" | "gray";
export type ButtonSize = "s" | "m";

const colorClasses: Record<ButtonColor, string> = {
  primary:
    "bg-btn-primary-fill text-btn-primary-text not-disabled:hover:bg-btn-primary-fill-hover data-[state=hover]:bg-btn-primary-fill-hover disabled:bg-btn-primary-fill-disabled disabled:text-btn-primary-text-disabled",
  tejp: "bg-btn-tejp-fill text-btn-tejp-text not-disabled:hover:bg-btn-tejp-fill-hover data-[state=hover]:bg-btn-tejp-fill-hover disabled:bg-btn-tejp-fill-disabled disabled:text-btn-tejp-text-disabled",
  inverted:
    "bg-btn-inverted-fill text-btn-inverted-text not-disabled:hover:bg-btn-inverted-fill-hover data-[state=hover]:bg-btn-inverted-fill-hover disabled:bg-btn-inverted-fill-disabled disabled:text-btn-inverted-text-disabled",
  gray: "bg-btn-gray-fill text-btn-gray-text not-disabled:hover:bg-btn-gray-fill-hover data-[state=hover]:bg-btn-gray-fill-hover disabled:bg-btn-gray-fill-disabled disabled:text-btn-gray-text-disabled",
};

/** S: 12px padding and gap (`spacing/xs`), 40px high. M: 16px (`spacing/sm`), 48px high. */
const sizeClasses: Record<ButtonSize, string> = {
  s: "gap-(--spacing-xs) p-(--spacing-xs)",
  m: "gap-(--spacing-sm) p-(--spacing-sm)",
};

const slide =
  "transition-transform duration-200 ease-out motion-reduce:transition-none group-[:not(:disabled):hover]/slide:-translate-x-(--slide) group-data-[state=hover]/slide:-translate-x-(--slide)";

/** Two copies of the icon in a clipped box; hovering the parent (`group/slide`) slides to the second. */
function SlidingIcon({ name, size }: { name: IconName; size: 12 | 16 }) {
  const box = size === 16 ? "size-4" : "size-3";
  return (
    <span
      className={`flex ${box} shrink-0 overflow-hidden`}
      style={{ "--slide": `${(size + 4) / 16}rem` } as React.CSSProperties}
    >
      <span className={`flex shrink-0 gap-1 ${slide}`}>
        {[0, 1].map((copy) => (
          <span key={copy} className={`flex ${box} shrink-0 items-center justify-center`}>
            <Icon name={name} />
          </span>
        ))}
      </span>
    </span>
  );
}

type ButtonStyleProps = {
  color?: ButtonColor;
  size?: ButtonSize;
  /** Icon before the label; none by default. */
  iconLeft?: IconName;
  /** Icon after the label; `arrow-right` by default, `null` for none. */
  iconRight?: IconName | null;
};

export const buttonClassName = ({
  color = "primary",
  size = "s",
}: Pick<ButtonStyleProps, "color" | "size">) =>
  `group/slide inline-flex items-center justify-center whitespace-nowrap rounded-sm text-label-s transition-colors disabled:cursor-not-allowed ${colorClasses[color]} ${sizeClasses[size]}`;

function ButtonContent({
  iconLeft,
  iconRight = "arrow-right",
  children,
}: Pick<ButtonStyleProps, "iconLeft" | "iconRight"> & { children: ReactNode }) {
  return (
    <>
      {iconLeft ? <SlidingIcon name={iconLeft} size={16} /> : null}
      {children}
      {iconRight ? <SlidingIcon name={iconRight} size={16} /> : null}
    </>
  );
}

type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  color,
  size,
  iconLeft,
  iconRight,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName({ color, size })} ${className ?? ""}`}
      {...props}
    >
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleProps & ComponentProps<typeof Link>;

/** A link that looks like a Button (locale-aware, via `@/i18n/navigation`). */
export function ButtonLink({
  color,
  size,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${buttonClassName({ color, size })} ${className ?? ""}`} {...props}>
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Icon after the label; `arrow-right` (12px) by default, `null` for none. */
  icon?: IconName | null;
};

/**
 * Figma "Link": Label S with a 12px arrow, 8px gap and vertical padding (`spacing/2xs`). Hover text
 * is `black` in Figma, not a colour variable.
 */
export function TextLink({ icon = "arrow-right", className, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={`group/slide inline-flex items-center gap-(--spacing-2xs) py-(--spacing-2xs) text-label-s whitespace-nowrap text-ui-primary hover:text-black data-[state=hover]:text-black ${className ?? ""}`}
      {...props}
    >
      {children}
      {icon ? <SlidingIcon name={icon} size={12} /> : null}
    </Link>
  );
}
