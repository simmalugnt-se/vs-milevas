import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./arrow";
import { Icon } from "./icon";

/**
 * product-card from Figma "02 — Components" → "Cards" (8268:2970): a truck model linking to its page.
 *
 * Figma has three states. Default: `bg-fill`, name and specs. Hover: `bg-surface`, plus the
 * `halfup` arrow and the prices. Tablet: Default's colours with the arrow and prices always shown.
 * We read "tablet" as "no hover": below Desktop S the arrow and prices are always there, from
 * Desktop S they appear on hover. Its proportions are those of product-grid's instances at each
 * mode's design width (339, 388, 416 and 469 wide, all 507 high), so it keeps Figma's shape as the
 * width grows; the image shrinks to make room.
 * Pass `data-state="hover"` to show the hover look without a pointer.
 */

export type ProductCardProps = Omit<ComponentProps<typeof Link>, "children"> & {
  /** Grey label, top left (Figma: "Baoli"). */
  brand: ReactNode;
  /** Dark label next to it (Figma: "Modeller"). */
  category: ReactNode;
  name: ReactNode;
  /** Short specs joined with `///` (Figma: lift capacity, battery). */
  specs?: ReactNode[];
  /** Truck image, e.g. a `next/image` with `fill` and `object-contain`. */
  image: ReactNode;
  price?: ReactNode;
  /** Monthly leasing cost, shown with `perMonthLabel`. */
  leasing?: ReactNode;
  priceLabel?: ReactNode;
  leasingLabel?: ReactNode;
  perMonthLabel?: ReactNode;
};

/** Hidden on Desktop until the card is hovered (or has `data-state="hover"`). */
const revealOnHover =
  "desktop-s:hidden desktop-s:group-hover/card:flex desktop-s:group-data-[state=hover]/card:flex";

export function ProductCard({
  brand,
  category,
  name,
  specs = [],
  image,
  price,
  leasing,
  priceLabel = "Från:",
  leasingLabel = "Leasing:",
  perMonthLabel = "/mån",
  className,
  ...props
}: ProductCardProps) {
  return (
    <Link
      className={`group/card flex aspect-[339/507] flex-col tablet:aspect-[388/507] desktop-s:aspect-[416/507] desktop-l:aspect-[469/507] rounded-lg bg-bg-fill p-(--spacing-sm) transition-colors hover:bg-bg-surface data-[state=hover]:bg-bg-surface ${className ?? ""}`}
      {...props}
    >
      <span className="flex w-full items-start justify-between">
        <span className="flex gap-4 text-label-s">
          <span className="text-ui-tertiary">{brand}</span>
          <span className="text-ui-primary">{category}</span>
        </span>
        <span className={`flex text-ui-primary ${revealOnHover}`}>
          <Arrow name="halfup" />
        </span>
      </span>

      <span className="flex min-h-0 w-full flex-1 items-center justify-center p-8">
        <span className="relative block aspect-[489/365] h-full max-w-full">{image}</span>
      </span>

      <span className="flex w-full flex-col gap-(--spacing-xs)">
        <span className="flex w-full items-center justify-between gap-4">
          <span className="flex flex-wrap gap-4 text-label-s text-ui-secondary">
            {specs.map((spec, index) => (
              <span key={index} className="flex gap-4">
                {index > 0 ? <span aria-hidden>{"///"}</span> : null}
                {spec}
              </span>
            ))}
          </span>
          <Icon name="info" className="text-ui-secondary" />
        </span>
        <span className="text-display-s text-ui-primary">{name}</span>
        {price || leasing ? (
          <span
            className={`flex w-full items-center justify-between text-ui-primary ${revealOnHover}`}
          >
            {price ? (
              <span className="flex flex-col gap-2">
                <span className="text-label-s">{priceLabel}</span>
                <span className="whitespace-nowrap text-text-l">{price}</span>
              </span>
            ) : (
              <span />
            )}
            {leasing ? (
              <span className="flex flex-col gap-2">
                <span className="text-label-s">{leasingLabel}</span>
                <span className="flex items-end gap-1">
                  <span className="whitespace-nowrap text-text-l">{leasing}</span>
                  <span className="pb-[0.2em] text-label-s text-ui-secondary">{perMonthLabel}</span>
                </span>
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
