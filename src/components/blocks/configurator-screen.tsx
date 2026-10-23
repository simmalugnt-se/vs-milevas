import type { ReactNode } from "react";

/**
 * The configurator's step screen from Figma "04 — Blocks" → "COnfigurator" (`9264:6653`, types
 * 1–5), on `bg-fill-secondary`:
 * - Desktop L: the step over the first 4 of 12 columns and the truck over the other 8; Desktop S
 *   5 and 7. `spacing/md` at the sides.
 * - Tablet and Mobile: the truck above, the step under it. `spacing/xl` and `spacing/sm` at the
 *   sides.
 * - The price box and "Boka samtal" stand top right over the truck, 263px wide on desktop and
 *   229px below, `spacing/2xs` apart. The step is at the bottom: its box, the help line and the
 *   buttons `spacing/2xs` apart, the buttons `spacing/3xs` apart.
 * At least Figma's height (800, 1000 and 800px), and on Desktop S and L one screen, as on Figma's
 * Konfigurator page (832px there); the truck takes the room the step leaves.
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
};

export function ConfiguratorScreen({
  image,
  price,
  contact,
  step,
  help,
  actions,
}: ConfiguratorScreenProps) {
  return (
    <section className="grid min-h-[50rem] grid-rows-[minmax(0,1fr)_auto] bg-bg-fill-secondary px-(--spacing-sm) py-(--spacing-xl) tablet:min-h-[62.5rem] tablet:px-(--spacing-xl) desktop-s:min-h-[max(50rem,100svh)] desktop-s:grid-cols-12 desktop-s:grid-rows-1 desktop-s:px-(--spacing-md)">
      <div className="relative row-start-1 flex min-h-[23.5rem] min-w-0 flex-col items-end tablet:min-h-[33.875rem] desktop-s:col-span-7 desktop-s:col-start-6 desktop-s:min-h-0 desktop-l:col-span-8 desktop-l:col-start-5">
        {image ? <div className="absolute inset-0">{image}</div> : null}
        <div className="relative flex w-[14.3125rem] flex-col gap-(--spacing-2xs) desktop-s:w-[16.4375rem]">
          {price}
          {contact}
        </div>
      </div>

      <div className="row-start-2 flex min-w-0 flex-col justify-end gap-(--spacing-2xs) desktop-s:col-span-5 desktop-s:col-start-1 desktop-s:row-start-1 desktop-l:col-span-4">
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
