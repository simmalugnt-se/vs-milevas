import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * The add-on under the finance configurator-box in Figma "02 — Components" → "Configurator"
 * (9264:5790, "Lägg till serviceavtal"): a `bg-fill` card with `radius-sm` and `spacing/sm`
 * around, the label in Text L, and top right the price in Label S (`ui-secondary`) beside a 16px
 * checkbox, a `stroke/width` frame in `border-primary` with 4px corners. The whole card is the
 * label of the checkbox. Figma draws it unchecked only.
 */

type CheckboxChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  price?: ReactNode;
};

export function CheckboxChoice({ label, price, className, ...props }: CheckboxChoiceProps) {
  return (
    <label
      className={`flex w-full cursor-pointer items-start justify-between rounded-sm bg-bg-fill p-(--spacing-sm) wrap-break-word ${className ?? ""}`}
    >
      <span className="min-w-0 flex-1 text-text-l text-ui-primary">{label}</span>
      <span className="flex shrink-0 items-center gap-[0.6875rem]">
        {price ? (
          <span className="whitespace-nowrap text-label-s text-ui-secondary">{price}</span>
        ) : null}
        <input
          type="checkbox"
          className="m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-[0.25rem] ring-(length:--stroke-width) ring-border-primary ring-inset"
          {...props}
        />
      </span>
    </label>
  );
}
