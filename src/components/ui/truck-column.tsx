import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./arrow";

/**
 * truck-column from Figma "02 — Components" → "blabla" (8539:7382): one column of a row laid over
 * an image, linking to a truck's configurator. Default is empty with a rule on the right; Active
 * fills with `bg-surface` and shows the small halfup arrow, a Display XS heading and the prices at
 * the bottom. From Desktop S, active means hover or keyboard focus, or `data-state="active"`.
 *
 * Figma has no touch behaviour. Like product-card's "tablet" state, below Desktop S the content is
 * always shown; unlike it the column also keeps `bg-surface`, since the dark text sits on a photo
 * and is unreadable without it (decided 2026-10-02).
 *
 * Figma's rule uses `Color/BG/surface` (yellow), though it looks grey in the frame; the variable is
 * followed.
 */

type PriceRow = { label: ReactNode; value: ReactNode };

type TruckColumnProps = Omit<ComponentProps<typeof Link>, "children"> & {
  /** Figma: "Bygg din Truck:". */
  heading: ReactNode;
  /** Figma: "Från" 169 000 kr, "Leasing från:" 3 326 kr/mån. */
  rows?: PriceRow[];
};

/** Always shown below Desktop S; from Desktop S only while the column is active. */
const showWhenActive =
  "desktop-s:invisible desktop-s:group-hover/column:visible desktop-s:group-focus-visible/column:visible desktop-s:group-data-[state=active]/column:visible";

export function TruckColumn({ heading, rows = [], className, ...props }: TruckColumnProps) {
  return (
    <Link
      className={`group/column flex h-full flex-col justify-end border-r border-bg-surface bg-bg-surface p-(--spacing-sm) transition-colors desktop-s:bg-transparent desktop-s:hover:bg-bg-surface desktop-s:focus-visible:bg-bg-surface desktop-s:data-[state=active]:bg-bg-surface ${className ?? ""}`}
      {...props}
    >
      <span className={`flex flex-col gap-4 ${showWhenActive}`}>
        <span className="flex flex-col gap-(--spacing-2xs) text-ui-primary">
          <Arrow name="halfup-s" />
          <span className="text-display-xs">{heading}</span>
        </span>
        {rows.length > 0 ? (
          <span className="flex flex-col gap-1 text-ui-primary">
            {rows.map((row, index) => (
              <span key={index} className="flex items-center justify-between gap-4">
                <span className="text-text-xs">{row.label}</span>
                <span className="text-text-s">{row.value}</span>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
