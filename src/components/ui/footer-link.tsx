import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

const roll =
  "desktop-s:group-hover/roll:-translate-y-full desktop-s:group-data-[state=hover]/roll:-translate-y-full";

/**
 * footerlink from Figma "02 — Components" → "Buttons & Links" (9321:51222), in `ui-primary`, with
 * the text centred in Figma's fixed height: 25px on Mobile (Text M), 38px from Desktop S (Text L).
 * From Desktop S, where there is a pointer, hover shows the copy below the text in its place, as
 * Figma's hover state. Figma has no animation between them, so there is none here. Pass
 * `data-state="hover"` to show the hover look without a pointer.
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
