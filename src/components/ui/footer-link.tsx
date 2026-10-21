import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

const roll =
  "desktop-s:group-hover/roll:-translate-y-full desktop-s:group-data-[state=hover]/roll:-translate-y-full";

/**
 * footerlink from Figma "02 — Components" → "Buttons & Links" (9321:51222), in `ui-primary`.
 * Mobile: Text M, no hover. Desktop (from Desktop S, where there is a pointer): Text L with
 * `spacing/4xs` above and below; hover shows the copy below the text in its place, as Figma's hover
 * state. Figma has no animation between them, so there is none here. Pass `data-state="hover"` to
 * show the hover look without a pointer. The footer block does not use it yet; it is waiting for
 * its own pass against Figma.
 */
export function FooterLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`group/roll relative inline-flex overflow-hidden text-text-m text-ui-primary desktop-s:text-text-l ${className ?? ""}`}
      {...props}
    >
      <span className={`block desktop-s:py-(--spacing-4xs) ${roll}`}>{children}</span>
      <span
        aria-hidden
        className={`absolute inset-x-0 top-full hidden py-(--spacing-4xs) desktop-s:block ${roll}`}
      >
        {children}
      </span>
    </Link>
  );
}
