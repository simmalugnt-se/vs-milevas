import type { HTMLAttributes, ReactNode } from "react";

/**
 * pricebox from Figma "02 — Components" → "blabla" (9207:25676), in a `stroke/width` frame in
 * `border-primary` with `radius-sm`.
 * - The total: Label S label and Text L amount on `bg-active`, `spacing/2xs` × `spacing/xs`.
 * - Rows: Text XS label in `ui-secondary` and Text S value on `bg-fill`, one line between each.
 *   `configurator` pads them `spacing/2xs`, `checkout` `spacing/2xs` × `spacing/xs`.
 * - `checkout` adds a note: a row and a Text XS text in `ui-tertiary` (Figma: the warranty).
 * Lines are drawn inside, as Figma's strokes are, so the box is Figma's height (109 and 193).
 * Figma's rows have no gap between label and value; here `spacing/2xs`, and the value stays on
 * one line. `stackOnMobile` puts each label above its value below Tablet, so the box can be as
 * narrow as its text (the configurator's, beside the truck on a phone), which Figma does not draw.
 */

type PriceRow = { label: ReactNode; value: ReactNode };

type PriceBoxProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "configurator" | "checkout";
  /** Figma: "Totalpris". */
  totalLabel: ReactNode;
  total: ReactNode;
  /** Figma: "Leasing (48mån)", "Långtidshyra" or "Uppskattad leverans". */
  rows?: PriceRow[];
  /** checkout: Figma's "Garanti", "4 år" with its text. */
  note?: PriceRow & { text: ReactNode };
  /** Below Tablet, each label above its value. */
  stackOnMobile?: boolean;
};

/** A line above each row, inside it: one line between rows, the frame drawn around them all. */
const line = "shadow-[inset_0_var(--stroke-width)_var(--color-border-primary)]";

/** Label and value above each other below Tablet, for `stackOnMobile`. */
const stacked =
  "max-tablet:flex-col max-tablet:items-start max-tablet:justify-start max-tablet:gap-(--spacing-3xs)";

function Row({ label, value }: PriceRow) {
  return (
    <>
      <dt className="text-text-xs text-ui-secondary">{label}</dt>
      <dd className="text-right whitespace-nowrap text-text-s text-ui-primary">{value}</dd>
    </>
  );
}

export function PriceBox({
  variant = "configurator",
  totalLabel,
  total,
  rows = [],
  note,
  stackOnMobile = false,
  className,
  ...props
}: PriceBoxProps) {
  const stack = stackOnMobile ? stacked : "";
  const checkout = variant === "checkout";
  const rowPadding = checkout ? "px-(--spacing-2xs) py-(--spacing-xs)" : "p-(--spacing-2xs)";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-sm outline-solid outline-(length:--stroke-width) outline-offset-[calc(var(--stroke-width)*-1)] outline-border-primary ${className ?? ""}`}
      {...props}
    >
      <div
        className={`flex items-center justify-between gap-4 bg-bg-active px-(--spacing-2xs) py-(--spacing-xs) text-ui-primary ${stack}`}
      >
        <p className="text-label-s">{totalLabel}</p>
        <p className="text-text-l whitespace-nowrap">{total}</p>
      </div>
      {rows.map((row, index) => (
        <dl
          key={index}
          className={`flex items-center justify-between gap-(--spacing-2xs) bg-bg-fill ${line} ${rowPadding} ${stack}`}
        >
          <Row {...row} />
        </dl>
      ))}
      {checkout && note ? (
        <div
          className={`flex flex-col gap-(--spacing-2xs) bg-bg-fill px-(--spacing-2xs) py-(--spacing-xs) ${line}`}
        >
          <dl className="flex items-center justify-between gap-4">
            <Row label={note.label} value={note.value} />
          </dl>
          <p className="text-text-xs text-ui-tertiary">{note.text}</p>
        </div>
      ) : null}
    </div>
  );
}
