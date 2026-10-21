import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./arrow";
import { Icon } from "./icon";
import { TruckInfo } from "./truck-info";

/**
 * product-card from Figma "02 — Components" → "Cards" (8268:2970): a truck model linking to its page.
 *
 * Figma's states, per device:
 * - Mobile: Default is Light `bg-fill` with name and specs; Active (`data-state="active"`) is Tejp
 *   with the 36 × 48 `halfup` arrow and the prices.
 * - Tablet: Light, with the 36 × 48 arrow and the prices always shown; no hover.
 * - Desktop (from Desktop S): Default as on Mobile; Hover is Tejp with the arrow in a 64 × 64 box
 *   and the prices. `loggedIn` is Figma's `hover-INLOGGAD`: "Ditt ÅF-pris:" and "Kundpris:" without
 *   "/mån", and the 48 × 64 arrow without the box.
 * It keeps the component's 430 × 507 proportion in every state and width; the image shrinks to make
 * room for the arrow and prices. Content sits inside the ratio box so its intrinsic size cannot
 * change the card's height or the grid rows. Pass `data-state="hover"` to show the Desktop hover
 * without a pointer. The name is the link and covers the card, so the info button (`info`, Figma's
 * truckinfo) can sit on top of it.
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
  /** After `leasing`; `null` for none. */
  perMonthLabel?: ReactNode;
  /** Figma's `hover-INLOGGAD`: the labels and the arrow of a logged-in customer. */
  loggedIn?: boolean;
  /** The text the info button (Figma's `truckinfo`) shows; without it the icon is not a button. */
  info?: ReactNode;
  "data-state"?: "hover" | "active";
};

/** Hidden on Mobile until the card is active, always shown on Tablet, on Desktop on hover. */
const reveal =
  "hidden max-tablet:group-data-[state=active]/card:flex tablet:flex desktop-s:hidden desktop-s:group-hover/card:flex desktop-s:group-data-[state=hover]/card:flex";

export function ProductCard({
  brand,
  category,
  name,
  specs = [],
  image,
  price,
  leasing,
  loggedIn = false,
  priceLabel = loggedIn ? "Ditt ÅF-pris:" : "Från:",
  leasingLabel = loggedIn ? "Kundpris:" : "Leasing:",
  perMonthLabel = loggedIn ? null : "/mån",
  info,
  className,
  "data-state": dataState,
  ...props
}: ProductCardProps) {
  return (
    <div
      data-state={dataState}
      className={`group/card relative block aspect-[430/507] mode-light rounded-lg bg-bg-fill max-tablet:data-[state=active]:mode-tejp desktop-s:hover:mode-tejp desktop-s:data-[state=hover]:mode-tejp ${className ?? ""}`}
    >
      <span className="absolute inset-0 flex flex-col p-(--spacing-sm)">
        <span className="flex w-full items-start justify-between">
          <span className="flex gap-4 text-label-s">
            <span className="text-ui-tertiary">{brand}</span>
            <span className="text-ui-primary">{category}</span>
          </span>
          {/* Desktop Hover: the arrow centred in a 64 × 64 box; logged in, the arrow alone. */}
          <span
            className={`justify-end text-ui-primary ${reveal} ${loggedIn ? "" : "desktop-s:w-16 desktop-s:justify-center"}`}
          >
            <Arrow name="halfup" className="h-12 w-9 desktop-s:h-16 desktop-s:w-12" />
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
            {info ? <TruckInfo text={info} /> : <Icon name="info" className="text-ui-secondary" />}
          </span>
          {/* The name is the link; it covers the card, under the info button. */}
          <Link
            className="text-display-s text-ui-primary after:absolute after:inset-0 after:rounded-lg"
            {...props}
          >
            {name}
          </Link>
          {price || leasing ? (
            <span className={`w-full items-center justify-between text-ui-primary ${reveal}`}>
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
                    {perMonthLabel ? (
                      <span className="pb-[0.2em] text-label-s text-ui-secondary">
                        {perMonthLabel}
                      </span>
                    ) : null}
                  </span>
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </span>
    </div>
  );
}
