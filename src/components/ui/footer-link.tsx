import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * The roll from Figma's prototype (Hover → Change to hover): both lines move up in 0.18s with
 * `cubic-bezier(0.688, 0, 0.33, 1)`, and back when the pointer leaves.
 */
const roll =
  "desktop-s:transition-[translate] desktop-s:duration-[180ms] desktop-s:ease-[cubic-bezier(0.688,0,0.33,1)] motion-reduce:transition-none desktop-s:group-hover/roll:-translate-y-full desktop-s:group-data-[state=hover]/roll:-translate-y-full";

/**
 * footerlink from Figma "02 — Components" → "Buttons & Links" (9321:51222), in `ui-primary`, with
 * the text centred in Figma's fixed height: 25px on Mobile (Text M), 38px from Desktop S (Text L).
 * From Desktop S, where there is a pointer, hover rolls the text up and a copy in after it, as
 * Figma's prototype does. Pass `data-state="hover"` to show the hover look without a pointer.
 */
export function FooterLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`group/roll relative flex h-[1.5625rem] flex-col overflow-hidden text-text-m whitespace-nowrap text-ui-primary desktop-s:h-[2.375rem] desktop-s:text-text-l ${className ?? ""}`}
      {...props}
    >
      <span className={`flex h-full shrink-0 items-center ${roll}`}>{children}</span>
      <span aria-hidden className={`hidden h-full shrink-0 items-center desktop-s:flex ${roll}`}>
        {children}
      </span>
    </Link>
  );
}
