import type { ReactNode } from "react";

/**
 * The configurator's step screen from Figma "04 — Blocks" → "COnfigurator" (`9264:6653`, types
 * 1–5), on `bg-fill-secondary`:
 * - Desktop L: the step over the first 4 of 12 columns and the truck over the other 8; Desktop S
 *   5 and 7. The columns are the page grid's (`grid/margin` at the sides, `grid/gap` between),
 *   where Figma has `spacing/md` at the sides (see figma-notes); the truck keeps `spacing/md` from
 *   the step inside its columns, and as much from the right edge; below Desktop S above it.
 * - Tablet and Mobile: the truck above, the step under it. `spacing/xl` and `spacing/sm` at the
 *   sides.
 * - The price box and "Boka samtal" stand top right over the truck, 263px wide on desktop and
 *   229px below, `spacing/2xs` apart. The step is at the bottom: its box, the help line and the
 *   buttons `spacing/2xs` apart, the buttons `spacing/3xs` apart.
 * Below Desktop S the price box starts under the overlaid navigation's row, where Figma has it
 * touch the row.
 * One screen high, so the step and its buttons fit in the window: the truck takes the room the
 * step leaves (below Desktop S at least 12rem, for the price box), and the screen grows only when
 * the step itself is taller; from Desktop S the truck then keeps its size. From Desktop S the top padding is the overlaid navigation's row, which
 * the price box touches as in Figma; the step keeps `spacing/xl` more, so in a low window it stops
 * short of the navigation instead of touching it (the quote and the thank-you screen do the same). Figma draws 800, 1000 and 800px, 832px on its Konfigurator page.
 *
 * Decided 2026-10-05, to be checked again with the design: the truck always fits its area (Figma
 * crops and enlarges a photo, differently per mode).
 *
 * Presentational: the configurator passes the step (a <ConfiguratorStep>), its buttons, the
 * price box and the contact button, which hold the behaviour.
 */

type ConfiguratorScreenProps = {
  /** The truck, e.g. a `next/image` with `fill` and `object-contain`. */
  image?: ReactNode;
  /** A <PriceBox>: Totalpris, Leasing and Långtidshyra. */
  price: ReactNode;
  /** "Boka samtal". */
  contact?: ReactNode;
  /** The current step: a <ConfiguratorStep>. */
  step: ReactNode;
  /** Note under the step (Figma: "Behöver du hjälp med andra mastalternativ? Kontakta oss …"). */
  help?: ReactNode;
  /** "Föregående" (from the second step) and "Nästa". */
  actions: ReactNode;
  /**
   * The step over 7 of 12 columns from Desktop S, for a step two per row when there is room (the
   * truck type step, which Figma does not draw); the truck and the price box take the other 5.
   */
  wide?: boolean;
};

export function ConfiguratorScreen({
  image,
  price,
  contact,
  step,
  help,
  actions,
  wide = false,
}: ConfiguratorScreenProps) {
  return (
    <section className="grid min-h-svh grid-rows-[minmax(0,1fr)_auto] bg-bg-fill-secondary px-(--spacing-sm) pt-[calc(var(--spacing-sm)*3+1rem)] pb-(--spacing-xl) tablet:px-(--spacing-xl) tablet:pt-[calc(var(--spacing-sm)*3+1.5rem)] desktop-s:pt-(--spacing-xl) desktop-s:grid-cols-12 desktop-s:grid-rows-1 desktop-s:gap-x-(--grid-gap) desktop-s:px-(--grid-margin)">
      <div
        className={`relative row-start-1 flex min-h-[12rem] min-w-0 flex-col items-end desktop-s:min-h-0 ${
          wide
            ? "desktop-s:col-span-5 desktop-s:col-start-8"
            : "desktop-s:col-span-7 desktop-s:col-start-6 desktop-l:col-span-8 desktop-l:col-start-5"
        }`}
      >
        {/* `spacing/md` from the step, above it or beside it, so the truck never touches it, and as
            much from the right edge. From Desktop S at most one window high (less the screen's
            padding) and at the bottom, so a step taller than the window (an open financing
            choice) grows the screen without growing the truck. */}
        {image ? (
          <div className="absolute inset-0 bottom-(--spacing-md) desktop-s:top-auto desktop-s:bottom-0 desktop-s:inset-x-(--spacing-md) desktop-s:h-full desktop-s:max-h-[calc(100svh-var(--spacing-xl)*2)]">
            {image}
          </div>
        ) : null}
        {/* Fades as the request popup opens, as on the quote (Figma 9321:55718). */}
        <div className="relative flex w-[14.3125rem] flex-col gap-(--spacing-2xs) transition-opacity duration-1200 ease-[cubic-bezier(0.72,0,0.37,1)] motion-reduce:transition-none [html[data-request-popup=open]_&]:opacity-0 desktop-s:w-[16.4375rem]">
          {price}
          {contact}
        </div>
      </div>

      <div
        className={`row-start-2 flex min-w-0 flex-col justify-end gap-(--spacing-2xs) desktop-s:col-start-1 desktop-s:row-start-1 desktop-s:pt-(--spacing-xl) ${
          wide ? "desktop-s:col-span-7" : "desktop-s:col-span-5 desktop-l:col-span-4"
        }`}
      >
        {step}
        {help ? (
          <p className="rounded-sm bg-bg-fill p-(--spacing-sm) text-center text-text-xs text-ui-tertiary">
            {help}
          </p>
        ) : null}
        <div className="flex gap-(--spacing-3xs) *:flex-1">{actions}</div>
      </div>
    </section>
  );
}
