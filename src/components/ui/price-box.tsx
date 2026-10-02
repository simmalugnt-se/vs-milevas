import type { HTMLAttributes, ReactNode } from "react";

/**
 * price-box from Figma "02 — Components" → "Configurator" (frame 6, 8389:7276; frame 9 has none):
 * the configured truck's price in Text XL, monthly alternatives and an optional delivery estimate
 * (Text XS label, Text S value, `ui-secondary`), and a full-width action, in Figma a primary M
 * <Button>.
 */

type PriceRow = { label: ReactNode; value: ReactNode };

type PriceBoxProps = HTMLAttributes<HTMLDivElement> & {
  price: ReactNode;
  /** Figma: "Leasing (48 mån)", "Långtidshyra (48 mån)". */
  rows?: PriceRow[];
  /** Figma's `Deliviry=True`: "Uppskattad leverans", "4–6 veckor". */
  delivery?: PriceRow;
  /** E.g. `<Button size="m" className="w-full">`. */
  action?: ReactNode;
};

function Row({ label, value }: PriceRow) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-text-xs">{label}</dt>
      <dd className="text-right text-text-s">{value}</dd>
    </div>
  );
}

export function PriceBox({
  price,
  rows = [],
  delivery,
  action,
  className,
  ...props
}: PriceBoxProps) {
  return (
    <div
      className={`flex flex-col gap-(--spacing-md) overflow-hidden rounded-lg bg-bg-fill p-(--spacing-sm) ${className ?? ""}`}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <p className="text-text-xl text-ui-primary">{price}</p>
        {rows.length > 0 ? (
          <dl className="flex flex-col gap-1 text-ui-secondary">
            {rows.map((row, index) => (
              <Row key={index} {...row} />
            ))}
          </dl>
        ) : null}
        {delivery ? (
          <dl className="text-ui-secondary">
            <Row {...delivery} />
          </dl>
        ) : null}
      </div>
      {action}
    </div>
  );
}
