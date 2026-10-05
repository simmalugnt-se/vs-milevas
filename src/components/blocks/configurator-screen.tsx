import type { ReactNode } from "react";

/**
 * The configurator's step screen from Figma "04 — Blocks" → "Configurator" (frame 15, 8721:16450;
 * frame 12 is the old design with the price-box). On `bg-fill-secondary`:
 * - Desktop L and S: the total and monthly prices at the top of the first 4 columns, the step at the
 *   bottom of them; the truck over the last 8, with the contact panel at its bottom right.
 * - Tablet and Mobile: the total, then the truck with the contact panel over its bottom (right on
 *   Tablet, left on Mobile), then the step.
 * The truck area keeps the proportion of Figma's (893:704 on Desktop L, 787:704 on Desktop S, and
 * about 704:480 and 359:340 below), so the screen grows with it; nothing has a fixed height.
 *
 * Decided 2026-10-05, to be checked again with the design: the truck always fits its area with a
 * `spacing/md` margin (Figma crops and enlarges it, differently per mode), and only the contact
 * panel lies over it; the total and the step never do.
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
  /** The truck, e.g. a `next/image` with `fill` and `object-contain`; without it (no truck chosen
   * yet) the area shrinks to the contact panel. */
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
  return (
    <section className="grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-(--grid-gap) bg-bg-fill-secondary px-(--grid-margin) py-(--spacing-xl) tablet:px-(--spacing-xl)">
      {/* The truck: row 2 below Desktop, columns 5–12 from Desktop S. */}
      <div
        className={`relative col-span-full row-start-2 flex flex-col items-start justify-end tablet:items-end desktop-s:col-span-8 desktop-s:col-start-5 desktop-s:row-start-1 ${
          image
            ? "aspect-[359/340] tablet:aspect-[704/480] desktop-s:aspect-[787/704] desktop-l:aspect-[893/704]"
            : ""
        }`}
      >
        {image ? <div className="absolute inset-(--spacing-md)">{image}</div> : null}
        {contact ? (
          <div className="relative flex w-full max-w-60 flex-col gap-(--grid-gap)">
            {contactText ? (
              <p className="rounded-sm bg-bg-fill p-(--spacing-sm) text-text-xs text-ui-secondary">
                {contactText}
              </p>
            ) : null}
            {contact}
          </div>
        ) : null}
      </div>

      {/* Below Desktop its children sit in the grid themselves; from Desktop S a column over 1–4. */}
      <div className="contents desktop-s:col-span-4 desktop-s:col-start-1 desktop-s:row-start-1 desktop-s:flex desktop-s:flex-col desktop-s:justify-between desktop-s:gap-(--spacing-xl)">
        <div className="col-span-full row-start-1 flex flex-col gap-(--spacing-2xs)">
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
        </div>
        <div className="col-span-full row-start-3 flex flex-col gap-(--grid-gap)">
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
