"use client";

import type { HTMLAttributes, ReactNode } from "react";

type FinancingChoiceProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  price?: ReactNode;
  /** Figma's `active`: Tejp, and the term and residual value under the head. */
  selected?: boolean;
  /** Figma's `bottom`: rounded bottom corners. */
  bottom?: boolean;
  /** The head is the button. */
  onSelect?: () => void;
  /** Figma's "Avtalslängd": a slider over the steps, shown when selected. */
  term?: {
    label: ReactNode;
    steps: number[];
    value: number;
    onChange?: (value: number) => void;
  };
  /** Figma's "Restvärde" row, shown when selected. */
  residual?: { label: ReactNode; value: ReactNode };
  "data-state"?: "hover";
};

/**
 * choice `Type=Financiering` from Figma "02 — Components" → "Configurator" (9207:32217): a way to
 * pay. The head has the title in Display S and the price in Text L, `spacing/md` × `spacing/sm`
 * around; hover and active are Tejp, as on <Choice>. Active, Financiering shows the term and the
 * residual value under a line (`term`, `residual`); without them it is Financiering-02, the head
 * alone. A slider cannot sit in a button, so the head is the button and the panel follows it; a
 * client component, since the slider handles its own input.
 * The slider steps between `term.steps` (Figma: 24 to 84 months); the track is `ui-secondary`,
 * the part up to the thumb and the 16px thumb `ui-primary`. An invisible range input on top gives
 * it pointer and keyboard.
 */
export function FinancingChoice({
  title,
  price,
  selected = false,
  bottom = false,
  onSelect,
  term,
  residual,
  className,
  ...props
}: FinancingChoiceProps) {
  const index = term ? Math.max(0, term.steps.indexOf(term.value)) : 0;
  const position = term && term.steps.length > 1 ? index / (term.steps.length - 1) : 0;
  const thumbLeft = `calc(${position} * (100% - 1rem))`;

  return (
    <div
      className={`flex w-full flex-col bg-bg-fill text-ui-primary wrap-break-word ring-(length:--stroke-width) ring-border-primary ring-inset hover:mode-tejp data-[state=hover]:mode-tejp ${
        selected ? "mode-tejp" : ""
      } ${bottom ? "rounded-b-sm" : ""} ${className ?? ""}`}
      {...props}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="flex w-full items-start gap-(--spacing-md) px-(--spacing-sm) py-(--spacing-md) text-left"
      >
        <span className="min-w-0 flex-1 text-display-s">{title}</span>
        {price ? <span className="shrink-0 whitespace-nowrap text-text-l">{price}</span> : null}
      </button>
      {selected && (term || residual) ? (
        <div className="flex flex-col gap-(--spacing-md) border-t border-border-primary px-(--spacing-sm) py-(--spacing-md)">
          {term ? (
            <label className="flex flex-col gap-(--spacing-2xs)">
              <span className="text-text-m">{term.label}</span>
              <span className="flex flex-col gap-[0.3125rem]">
                <span className="relative block h-4">
                  <span className="absolute inset-x-0 top-1 h-2 rounded-sm bg-ui-secondary" />
                  <span
                    className="absolute top-1 left-0 h-2 rounded-sm bg-ui-primary"
                    style={{ width: `calc(${thumbLeft} + 1rem)` }}
                  />
                  <span
                    className="absolute top-0 size-4 rounded-sm bg-ui-primary"
                    style={{ left: thumbLeft }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={term.steps.length - 1}
                    step={1}
                    value={index}
                    aria-valuetext={String(term.steps[index])}
                    readOnly={!term.onChange}
                    onChange={(event) =>
                      term.onChange?.(term.steps[Number(event.target.value)] ?? term.value)
                    }
                    className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
                  />
                </span>
                <span aria-hidden className="flex justify-between text-label-s">
                  {term.steps.map((step) => (
                    <span key={step}>{step}</span>
                  ))}
                </span>
              </span>
            </label>
          ) : null}
          {residual ? (
            <p className="flex items-center gap-2 text-text-m">
              <span className="min-w-0 flex-1">{residual.label}</span>
              <span className="shrink-0 whitespace-nowrap">{residual.value}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
