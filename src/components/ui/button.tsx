import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { type ColorMode, modeClass } from "./color-mode";
import { Icon, type IconName } from "./icon";

/**
 * Button and Link from Figma "02 — Components" → "Buttons etc" (button 8268:3068, Link 8309:3919).
 *
 * Hover in Figma swaps a row of two identical icons from start to end inside a clipped box, so the
 * icon slides out and its copy slides in. Pass `data-state="hover"` to show the hover look without a
 * pointer (the kitchensink does).
 *
 * The slide uses Figma's motion `duration/short` and `easing/slow-out`; the component has no
 * animation of its own, so the choice is ours.
 */

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "s" | "m";

/**
 * Color/BTN/primary and Color/BTN/secondary; the mode around the button, or `mode`, picks the
 * colors. Figma's component still has four colors (primary, inverted, tejp, secondary): Light
 * primary is inverted, Dark primary is primary, Tejp primary is tejp and Light secondary is
 * secondary. The border is an inset ring, so it does not change the button's size.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-btn-primary-fill text-btn-primary-text ring-1 ring-btn-primary-border ring-inset not-disabled:hover:bg-btn-primary-fill-hover data-[state=hover]:bg-btn-primary-fill-hover disabled:bg-btn-primary-fill-disabled disabled:text-btn-primary-text-disabled",
  secondary:
    "bg-btn-secondary-fill text-btn-secondary-text ring-1 ring-btn-secondary-border ring-inset not-disabled:hover:bg-btn-secondary-fill-hover not-disabled:hover:text-btn-secondary-text-hover data-[state=hover]:bg-btn-secondary-fill-hover data-[state=hover]:text-btn-secondary-text-hover disabled:bg-btn-secondary-fill-disabled disabled:text-btn-secondary-text-disabled disabled:ring-btn-secondary-border-disabled",
};

/** S: 12px padding and gap (`spacing/xs`), 40px high. M: 16px (`spacing/sm`), 48px high. */
const sizeClasses: Record<ButtonSize, string> = {
  s: "gap-(--spacing-xs) p-(--spacing-xs)",
  m: "gap-(--spacing-sm) p-(--spacing-sm)",
};

const slide =
  "transition-transform duration-short ease-slow-out motion-reduce:transition-none group-[:not(:disabled):hover]/slide:-translate-x-(--slide) group-data-[state=hover]/slide:-translate-x-(--slide)";

/**
 * Two copies of the 16px icon, 4px apart, in a clipped box; hovering the parent (`group/slide`)
 * slides to the second, as Figma's 20px step.
 */
function SlidingIcon({ name }: { name: IconName }) {
  return (
    <span className="flex size-4 shrink-0 overflow-hidden [--slide:1.25rem]">
      <span className={`flex shrink-0 gap-1 ${slide}`}>
        {[0, 1].map((copy) => (
          <span key={copy} className="flex size-4 shrink-0 items-center justify-center">
            <Icon name={name} />
          </span>
        ))}
      </span>
    </span>
  );
}

type ButtonStyleProps = {
  variant?: ButtonVariant;
  /** Color mode for the button alone; the surrounding mode by default. */
  mode?: ColorMode;
  size?: ButtonSize;
  /** Icon before the label; none by default. */
  iconLeft?: IconName;
  /** Icon after the label; `arrow-right` by default, `null` for none. */
  iconRight?: IconName | null;
};

export const buttonClassName = ({
  variant = "primary",
  mode,
  size = "s",
}: Pick<ButtonStyleProps, "variant" | "mode" | "size">) =>
  `group/slide inline-flex items-center justify-center whitespace-nowrap rounded-sm text-label-s transition-colors disabled:cursor-not-allowed ${mode ? modeClass[mode] : ""} ${variantClasses[variant]} ${sizeClasses[size]}`;

function ButtonContent({
  iconLeft,
  iconRight = "arrow-right",
  children,
}: Pick<ButtonStyleProps, "iconLeft" | "iconRight"> & { children: ReactNode }) {
  return (
    <>
      {iconLeft ? <SlidingIcon name={iconLeft} /> : null}
      {children}
      {iconRight ? <SlidingIcon name={iconRight} /> : null}
    </>
  );
}

type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  mode,
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
      className={`${buttonClassName({ variant, mode, size })} ${className ?? ""}`}
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
  variant,
  mode,
  size,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${buttonClassName({ variant, mode, size })} ${className ?? ""}`} {...props}>
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type TextLinkProps = ComponentProps<typeof Link> & {
  /** Icon after the label; `arrow-right` by default, `null` for none. */
  icon?: IconName | null;
};

/**
 * Figma "Link": Label S with the 16px `arrow_right`, 8px gap and vertical padding (`spacing/2xs`).
 * Hover text is `black` in Figma, not a colour variable.
 */
export function TextLink({ icon = "arrow-right", className, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={`group/slide inline-flex items-center gap-(--spacing-2xs) py-(--spacing-2xs) text-label-s whitespace-nowrap text-ui-primary hover:text-black data-[state=hover]:text-black ${className ?? ""}`}
      {...props}
    >
      {children}
      {icon ? <SlidingIcon name={icon} /> : null}
    </Link>
  );
}
