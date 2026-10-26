import type { ReactNode } from "react";

export type QuoteTable = {
  heading: ReactNode;
  /** Beside the heading from Desktop S (Figma: "Tillbaka till konfigurator" by Konfiguration). */
  action?: ReactNode;
  rows: Array<{ label: ReactNode; value: ReactNode }>;
};

type ConfiguratorQuoteProps = {
  /** Display M: the family in singular, "Elektrisk motviktstruck". */
  heading: ReactNode;
  /** "Tillbaka till konfigurator", under the heading below Desktop S. */
  back?: ReactNode;
  /** A <PriceBox variant="checkout">. */
  price: ReactNode;
  /** "Boka samtal". */
  contact?: ReactNode;
  /** The truck, from Desktop S. */
  image?: ReactNode;
  /** "Konfiguration" and "Tekniska specifikationer". */
  tables: QuoteTable[];
  /** "Skicka kopia till mig": a field and its button. */
  copy?: ReactNode;
  /** "Fortsätt beställning". */
  order?: ReactNode;
};

/** A line under each row but the last, inside it, as Figma draws the rows. */
const divider =
  "not-last:shadow-[inset_0_calc(var(--stroke-width)*-1)_var(--color-border-primary)]";

/**
 * Text L heading over rows of Text XS label and Text S value, as the checkout price box's: one box
 * with a `border-primary` line around it (`radius-sm`) and one between the rows.
 */
function Table({ heading, action, rows }: QuoteTable) {
  return (
    <section className="flex flex-col gap-(--spacing-sm)">
      <div className="flex items-center justify-between gap-(--spacing-sm)">
        <h2 className="text-text-l text-ui-primary">{heading}</h2>
        {action}
      </div>
      <dl className="flex flex-col overflow-hidden rounded-sm outline-solid outline-(length:--stroke-width) outline-offset-[calc(var(--stroke-width)*-1)] outline-border-primary">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`flex items-center justify-between gap-(--spacing-2xs) bg-bg-fill px-(--spacing-2xs) py-(--spacing-xs) ${divider}`}
          >
            <dt className="text-text-xs text-ui-secondary">{row.label}</dt>
            <dd className="text-right whitespace-nowrap text-text-s text-ui-primary">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * The quote from Figma "04 — Blocks" → "COnfigurator" (`type=offert`, 9264:10759), on
 * `bg-fill-secondary`. Below Desktop S 6rem on top for the site's overlaid navigation; from it the
 * navigation's row (`spacing/xl`), which the price box touches, and `spacing/xl` more for the rest,
 * as the configurator's steps:
 * - Desktop S and L: the heading, the two tables and the buttons on the left, spread over the
 *   window's height (Figma's frame is 832px) and `spacing/sm` apart at least, growing only when
 *   they do not fit, as the configurator's steps; the truck on the right with the price box and
 *   "Boka samtal" top right (304px). On the page grid as the step screen, so the truck has the same
 *   area there and here: the left over 5 of 12 columns (4 on Desktop L, where Figma gives it
 *   555px), the truck over the rest with `spacing/md` inside on both sides.
 * - Tablet and Mobile: one column `spacing/md` apart: the heading and the back link, the price box,
 *   the tables (side by side on Tablet), and the buttons with "Boka samtal" between the copy field
 *   and "Fortsätt beställning". No truck.
 * The back link, the price box and "Boka samtal" have a place per layout; the one not in use is
 * hidden, so each is shown once.
 */
export function ConfiguratorQuote({
  heading,
  back,
  price,
  contact,
  image,
  tables,
  copy,
  order,
}: ConfiguratorQuoteProps) {
  return (
    <section className="bg-bg-fill-secondary px-(--spacing-md) pt-[calc(6rem+var(--spacing-xl))] pb-(--spacing-xl) tablet:px-(--spacing-xl) desktop-s:grid desktop-s:min-h-svh desktop-s:grid-cols-12 desktop-s:gap-x-(--grid-gap) desktop-s:px-(--grid-margin) desktop-s:pt-(--spacing-xl)">
      <div className="flex flex-col gap-(--spacing-md) desktop-s:col-span-5 desktop-s:justify-between desktop-s:gap-(--spacing-sm) desktop-s:pt-(--spacing-xl) desktop-l:col-span-4">
        <div className="flex flex-col gap-(--spacing-2xs)">
          <h1 className="text-display-m text-ui-primary">{heading}</h1>
          {back ? <div className="desktop-s:hidden">{back}</div> : null}
        </div>
        <div className="desktop-s:hidden">{price}</div>
        <div className="grid gap-(--spacing-md) tablet:grid-cols-2 tablet:gap-(--grid-gap) desktop-s:grid-cols-1 desktop-s:gap-(--spacing-xs)">
          {tables.map((table, index) => (
            <Table
              key={index}
              {...table}
              action={
                table.action ? <div className="hidden desktop-s:block">{table.action}</div> : null
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-(--spacing-2xs)">
          {copy}
          {contact ? <div className="flex flex-col desktop-s:hidden">{contact}</div> : null}
          {order}
        </div>
      </div>
      <div className="relative hidden flex-col items-end desktop-s:col-span-7 desktop-s:col-start-6 desktop-s:flex desktop-l:col-span-8 desktop-l:col-start-5">
        {image ? <div className="absolute inset-0 inset-x-(--spacing-md)">{image}</div> : null}
        {/* Out of Figma's popup frame (9321:55718), so it fades as the popup opens. */}
        <div className="relative flex w-[19rem] flex-col gap-(--spacing-2xs) transition-opacity duration-1200 ease-[cubic-bezier(0.72,0,0.37,1)] motion-reduce:transition-none [html[data-request-popup=open]_&]:opacity-0">
          {price}
          {contact}
        </div>
      </div>
    </section>
  );
}
