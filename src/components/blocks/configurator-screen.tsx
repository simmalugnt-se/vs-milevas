import type { ReactNode } from "react";

/**
 * The configurator's step screen from Figma "04 — Blocks" → "Configurator" (frame 15, 8721:16450;
 * frame 12 is the old design with the price-box). On `bg-fill-secondary`:
 * - Desktop L: choices/price over 4 columns and truck over 8; Desktop S uses 5 and 7.
 * - Tablet and Mobile: price and contact share the truck area, with the choices below it.
 * Minimum heights follow the reference frames (50rem, 62.5rem, 50rem). Rows can grow with content;
 * the truck area takes the space left by the choices, as in Figma's grid.
 *
 * Decided 2026-10-05, to be checked again with the design: the truck always fits its area with a
 * `spacing/md` margin (Figma crops and enlarges it, differently per mode), and only the contact
 * panel and (below Desktop) total lie over it; the step remains below.
 *
 * Presentational: the configurator passes the step (a <ConfiguratorBox>), its buttons and the
 * contact button, which hold the behaviour.
 */

export type ConfiguratorScreenPrice = { label: ReactNode; value: ReactNode };

type ConfiguratorScreenProps = {
  /** "Totalt: 173 900 kr". */
  total: ReactNode;
  /** Monthly prices under the total, e.g. Leasing (48 mån) 3 261 kr/mån. */
  prices?: ConfiguratorScreenPrice[];
  /** The truck, e.g. a `next/image` with `fill` and `object-contain`. */
  image?: ReactNode;
  /** The current step: a <ConfiguratorBox> with its choices. */
  step: ReactNode;
  /** Optional note under the step (Figma: "Behöver du hjälp med andra mastalternativ?"). */
  help?: ReactNode;
  /** "Föregående" (from the second step) and "Nästa". */
  actions: ReactNode;
  /** Text above the contact button (Figma: "Har du frågor eller önskar något annat …?"). */
  contactText?: ReactNode;
  /** "Boka samtal". */
  contact?: ReactNode;
};

export function ConfiguratorScreen({
  total,
  prices = [],
  image,
  step,
  help,
  actions,
  contactText,
  contact,
}: ConfiguratorScreenProps) {
  const priceContent = (
    <>
      <p className="text-text-xl text-ui-primary">{total}</p>
      {prices.length > 0 ? (
        <dl className="flex flex-col gap-(--spacing-3xs) text-text-xs text-ui-secondary">
          {prices.map((price, index) => (
            <div key={index} className="flex gap-(--spacing-3xs)">
              <dt>{price.label}</dt>
              <dd className="text-text-s">{price.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </>
  );

  return (
    <section className="grid min-h-[50rem] grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] grid-rows-[minmax(0,1fr)_auto] gap-(--grid-gap) bg-bg-fill-secondary px-(--grid-margin) py-(--spacing-xl) tablet:min-h-[62.5rem] tablet:px-(--spacing-xl) desktop-s:min-h-[50rem] desktop-s:grid-rows-1">
      {/* Price and truck share row 1 below Desktop; the truck spans 7/8 columns on Desktop S/L. */}
      <div className="relative col-span-full row-start-1 flex min-h-[19.6875rem] min-w-0 flex-col items-start justify-between gap-(--spacing-md) tablet:min-h-[29.875rem] tablet:items-end desktop-s:col-span-7 desktop-s:col-start-6 desktop-s:min-h-0 desktop-s:justify-end desktop-s:p-(--grid-gap) desktop-l:col-span-8 desktop-l:col-start-5">
        {image ? <div className="absolute inset-(--spacing-md)">{image}</div> : null}
        <div className="relative flex w-full flex-col gap-(--spacing-2xs) desktop-s:hidden">
          {priceContent}
        </div>
        {contact ? (
          <div className="relative flex w-full max-w-[9.125rem] flex-col gap-(--grid-gap) tablet:max-w-[15.125rem]">
            {contactText ? (
              <p className="rounded-sm bg-bg-fill p-(--spacing-sm) text-text-xs text-ui-secondary">
                {contactText}
              </p>
            ) : null}
            {contact}
          </div>
        ) : null}
      </div>

      <div className="col-span-full row-start-2 flex min-w-0 flex-col gap-(--spacing-xl) desktop-s:col-span-5 desktop-s:col-start-1 desktop-s:row-start-1 desktop-s:justify-between desktop-l:col-span-4">
        <div className="hidden flex-col gap-(--spacing-2xs) desktop-s:flex">{priceContent}</div>
        <div className="flex flex-col gap-(--grid-gap)">
          {step}
          {help ? (
            <p className="rounded-sm bg-bg-fill p-(--spacing-sm) text-center text-text-xs text-ui-tertiary">
              {help}
            </p>
          ) : null}
          <div className="flex gap-(--grid-gap) *:flex-1">{actions}</div>
        </div>
      </div>
    </section>
  );
}
