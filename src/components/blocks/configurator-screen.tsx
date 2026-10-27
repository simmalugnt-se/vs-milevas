"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";

/**
 * The configurator's step screen from Figma "04 — Blocks" → "COnfigurator" (`9264:6653`, types
 * 1–5), on `bg-fill-secondary`:
 * - Desktop L: the step over the first 4 of 12 columns and the truck over the other 8; Desktop S
 *   5 and 7. The columns are the page grid's (`grid/margin` at the sides, `grid/gap` between),
 *   where Figma has `spacing/md` at the sides (see figma-notes); the truck keeps `spacing/md` from
 *   the step inside its columns, and as much from the right edge; below Desktop S above it.
 * - Tablet and Mobile: the price box at the top right and the step under it; the truck takes the
 *   room above the step left of the price box, never behind it, centred between the left edge and
 *   the box: at the top, or centred on the box when it is lower than the box (`useTruckOffset`).
 *   As far from the box as the box is from the edge (`spacing/sm`, on Tablet `spacing/xl`). Decided 2026-10-27; Figma has the truck behind the price box.
 *   `spacing/xl` and `spacing/sm` at the sides.
 * - The price box and "Boka samtal" stand top right, 263px wide on desktop, 229px on Tablet and as
 *   wide as their text on Mobile, where the price box puts each label above its value
 *   (`stackOnMobile`), `spacing/2xs` apart. The step is at the bottom: its box, the help line and
 *   the buttons `spacing/2xs` apart, the buttons `spacing/3xs` apart.
 * Below Desktop S the price box starts under the overlaid navigation's row, where Figma has it
 * touch the row.
 * One screen high, so the step and its buttons fit in the window, and the screen grows only when
 * the step itself is taller (the truck's row is then as high as the price box). From Desktop S the
 * top padding is the overlaid navigation's row, which
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

/**
 * Below Desktop S, how far down the truck stands in its area: centred on the price box when the
 * truck, fitted to the area, is lower than the box, else at the top. Set as `--truck-y` on the row,
 * which the configurator's image reads in its `object-position`, and read again as the window, the
 * step or the image changes.
 */
function useTruckOffset() {
  const row = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = row.current;
    const column = box.current;
    if (!element || !column) return;
    const place = () => {
      const area = element.querySelector<HTMLElement>("[data-truck]");
      const image = area?.querySelector("img");
      if (!area || !image?.naturalWidth) return;
      const height = Math.min(
        (area.clientWidth * image.naturalHeight) / image.naturalWidth,
        area.clientHeight,
      );
      element.style.setProperty(
        "--truck-y",
        `${Math.max(0, (column.offsetHeight - height) / 2)}px`,
      );
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(element);
    observer.observe(column);
    element.addEventListener("load", place, true);
    return () => {
      observer.disconnect();
      element.removeEventListener("load", place, true);
    };
  }, []);
  return { row, box };
}

export function ConfiguratorScreen({
  image,
  price,
  contact,
  step,
  help,
  actions,
  wide = false,
}: ConfiguratorScreenProps) {
  const { row, box } = useTruckOffset();
  return (
    <section className="grid min-h-svh grid-rows-[1fr_auto] bg-bg-fill-secondary px-(--spacing-sm) pt-[calc(var(--spacing-sm)*3+1rem)] pb-(--spacing-xl) tablet:px-(--spacing-xl) tablet:pt-[calc(var(--spacing-sm)*3+1.5rem)] desktop-s:pt-(--spacing-xl) desktop-s:grid-cols-12 desktop-s:grid-rows-1 desktop-s:gap-x-(--grid-gap) desktop-s:px-(--grid-margin)">
      <div
        ref={row}
        className={`relative row-start-1 flex min-w-0 items-start justify-end gap-(--spacing-sm) pb-(--spacing-md) tablet:gap-(--spacing-xl) desktop-s:flex-col desktop-s:items-end desktop-s:justify-start desktop-s:pb-0 ${
          wide
            ? "desktop-s:col-span-5 desktop-s:col-start-8"
            : "desktop-s:col-span-7 desktop-s:col-start-6 desktop-l:col-span-8 desktop-l:col-start-5"
        }`}
      >
        {/* `spacing/md` from the step, above it or beside it, so the truck never touches it, and as
            much from the right edge. Below Desktop S left of the price box, as high as the room above
            the step. From Desktop S at most one window high (less the screen's padding) and at the bottom,
            so a step taller than the window (an open financing choice) grows the screen without
            growing the truck. */}
        {image ? (
          <div
            data-truck
            className="relative flex-1 self-stretch desktop-s:absolute desktop-s:inset-0 desktop-s:top-auto desktop-s:bottom-0 desktop-s:inset-x-(--spacing-md) desktop-s:h-full desktop-s:max-h-[calc(100svh-var(--spacing-xl)*2)]"
          >
            {image}
          </div>
        ) : null}
        {/* Fades as the request popup opens, as on the quote (Figma 9321:55718). */}
        <div
          ref={box}
          className="relative flex w-max shrink-0 flex-col gap-(--spacing-2xs) tablet:w-[14.3125rem] transition-opacity duration-1200 ease-[cubic-bezier(0.72,0,0.37,1)] motion-reduce:transition-none [html[data-request-popup=open]_&]:opacity-0 desktop-s:w-[16.4375rem]"
        >
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
