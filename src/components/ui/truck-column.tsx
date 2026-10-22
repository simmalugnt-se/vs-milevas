import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./arrow";

/**
 * truck-column from Figma "02 — Components" → "blabla" (8539:7382): one column of a row laid over
 * an image, linking to a truck's configurator. Default is empty with a `stroke/width` rule on the
 * right; Active fills with Tejp `bg-fill` and shows a Display XS heading and the prices at the
 * bottom. Active+scroll (`scrollLabel`) adds a centred scroll hint, Label L under the sideways
 * up-down arrow, `spacing/5xl` from the top. From Desktop S, active means hover or
 * `data-state="active"`.
 *
 * Figma has no touch behaviour. Like product-card's "tablet" state, below Desktop S the content is
 * always shown; unlike it the column also keeps its fill, since the dark text sits on a photo
 * and is unreadable without it (decided 2026-10-02).
 *
 * Figma's rule uses `Color/BG/surface` (yellow), though it looks grey in the frame; the variable is
 * followed. The column is in Tejp mode, so both are its `bg-fill`.
 *
 * `controlled` leaves the state to the block (the hero): active only with `data-state="active"`,
 * at every width and without hover. `children` is a layer under the content, clipped by the column
 * (the hero's truck), and `contentClassName` goes on the hint and the content.
 */

type PriceRow = { label: ReactNode; value: ReactNode };

type TruckColumnProps = Omit<ComponentProps<typeof Link>, "children"> & {
  /** Figma: "Bygg din Truck:". */
  heading: ReactNode;
  /** Figma: "Från" 169 000 kr, "Leasing från:" 3 326 kr/mån. */
  rows?: PriceRow[];
  /** Figma's `Acitve+scroll`: the hint at the top, e.g. "Skrolla". */
  scrollLabel?: ReactNode;
  /** Active only through `data-state="active"`, at every width. */
  controlled?: boolean;
  contentClassName?: string;
  children?: ReactNode;
};

/** Always shown below Desktop S; from Desktop S only while the column is active. */
const showWhenActive =
  "desktop-s:invisible desktop-s:group-hover/column:visible desktop-s:group-data-[state=active]/column:visible";

/** Controlled: shown only while the column is active. */
const showWhenSet = "invisible group-data-[state=active]/column:visible";

export function TruckColumn({
  heading,
  rows = [],
  scrollLabel,
  controlled = false,
  contentClassName = "",
  children,
  className,
  ...props
}: TruckColumnProps) {
  const show = controlled ? showWhenSet : showWhenActive;
  return (
    <Link
      className={`group/column mode-tejp relative flex h-full flex-col overflow-hidden border-r-(length:--stroke-width) border-bg-fill p-(--spacing-sm) ${
        controlled
          ? "data-[state=active]:bg-bg-fill"
          : "bg-bg-fill desktop-s:bg-transparent desktop-s:hover:bg-bg-fill desktop-s:data-[state=active]:bg-bg-fill"
      } ${scrollLabel ? "items-center justify-between pt-(--spacing-5xl)" : "justify-end"} ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
      {scrollLabel ? (
        <span
          className={`relative flex flex-col items-center gap-(--spacing-2xs) text-ui-primary ${show} ${contentClassName}`}
        >
          <Arrow name="up-down" className="h-[2.4rem] w-6 rotate-90" />
          <span className="text-label-l">{scrollLabel}</span>
        </span>
      ) : null}
      <span className={`relative flex w-full flex-col gap-4 ${show} ${contentClassName}`}>
        <span className="text-display-xs text-ui-primary">{heading}</span>
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
