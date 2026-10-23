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

/** A line above and below, inside the row, as Figma's text-box strokes. */
const lines =
  "shadow-[inset_0_var(--stroke-width)_var(--color-border-primary),inset_0_calc(var(--stroke-width)*-1)_var(--color-border-primary)]";

/** Text L heading over rows of Text XS label and Text S value, as the checkout price box's. */
function Table({ heading, action, rows }: QuoteTable) {
  return (
    <section className="flex flex-col gap-(--spacing-sm)">
      <div className="flex items-center justify-between gap-(--spacing-sm)">
        <h2 className="text-text-l text-ui-primary">{heading}</h2>
        {action}
      </div>
      <dl className="flex flex-col">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`flex items-center justify-between gap-(--spacing-2xs) bg-bg-fill px-(--spacing-2xs) py-(--spacing-xs) first:rounded-t-sm last:rounded-b-sm ${lines}`}
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
 * `bg-fill-secondary`:
 * - Desktop S and L: the heading, the two tables and the buttons on the left, spread over the
 *   height (832px at least); the truck on the right with the price box and "Boka samtal" top right
 *   (304px). Desktop L gives the left 555px, Desktop S half.
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
    <section className="bg-bg-fill-secondary px-(--spacing-md) py-(--spacing-xl) tablet:px-(--spacing-xl) desktop-s:grid desktop-s:min-h-[52rem] desktop-s:grid-cols-2 desktop-s:px-(--spacing-md) desktop-l:grid-cols-[34.6875rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-(--spacing-md) desktop-s:justify-between desktop-s:gap-0">
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
      <div className="relative hidden flex-col items-end desktop-s:flex">
        {image ? <div className="absolute inset-0">{image}</div> : null}
        <div className="relative flex w-[19rem] flex-col gap-(--spacing-2xs)">
          {price}
          {contact}
        </div>
      </div>
    </section>
  );
}
