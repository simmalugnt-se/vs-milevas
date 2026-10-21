import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

export type NavLinkVariant = "primary" | "secondary";

/** Primary: Label S, `spacing/2xs` above and below. Secondary: Text XL, `spacing/3xs`. */
const variantClasses: Record<NavLinkVariant, string> = {
  primary: "py-(--spacing-2xs) text-label-s",
  secondary: "py-(--spacing-3xs) text-text-xl",
};

type NavLinkProps = ComponentProps<typeof Link> & {
  variant?: NavLinkVariant;
  /** The current page: `ui-brand` in Secondary; Primary has no active look in Figma. */
  active?: boolean;
  /** Greyed out (`ui-tertiary`) and not a link. */
  disabled?: boolean;
};

/**
 * navlink-secondary from Figma "02 — Components" → "Buttons & Links" (9004:10878): a navigation
 * link in `ui-primary`, `ui-tertiary` when disabled. Figma has no hover. The navigation block does
 * not use it yet; it is waiting for its own pass against Figma.
 */
export function NavLink({
  variant = "primary",
  active,
  disabled,
  className,
  children,
  ...props
}: NavLinkProps) {
  const color = disabled
    ? "text-ui-tertiary"
    : active && variant === "secondary"
      ? "text-ui-brand"
      : "text-ui-primary";
  const classes = `block whitespace-nowrap ${variantClasses[variant]} ${color} ${className ?? ""}`;

  if (disabled) {
    return (
      <span aria-disabled className={classes}>
        {children}
      </span>
    );
  }
  return (
    <Link aria-current={active ? "page" : undefined} className={classes} {...props}>
      {children}
    </Link>
  );
}
