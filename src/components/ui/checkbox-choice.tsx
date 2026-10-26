import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";

/**
 * The add-on under the finance configurator-box in Figma "02 — Components" → "Configurator"
 * (9264:5790, "Lägg till serviceavtal"): a `bg-fill` card with `radius-sm` and `spacing/sm`
 * around, the label in Text L, and top right the price in Label S (`ui-secondary`) beside a 16px
 * checkbox, a `stroke/width` frame in `border-primary` with 4px corners. The whole card is the
 * label of the checkbox. Figma draws it unchecked only; checked, the card is Tejp like a chosen
 * `Choice` and the box shows the `check` icon (see figma-notes).
 */

type CheckboxChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  price?: ReactNode;
};

export function CheckboxChoice({ label, price, className, ...props }: CheckboxChoiceProps) {
  return (
    <label
      className={`flex w-full cursor-pointer items-start justify-between rounded-sm bg-bg-fill p-(--spacing-sm) wrap-break-word has-checked:mode-tejp ${className ?? ""}`}
    >
      <span className="min-w-0 flex-1 text-text-l text-ui-primary">{label}</span>
      <span className="flex shrink-0 items-center gap-[0.6875rem]">
        {price ? (
          <span className="whitespace-nowrap text-label-s text-ui-secondary">{price}</span>
        ) : null}
        <span className="relative flex size-4 shrink-0">
          <input
            type="checkbox"
            className="peer m-0 size-4 cursor-pointer appearance-none rounded-[0.25rem] ring-(length:--stroke-width) ring-border-primary ring-inset"
            {...props}
          />
          <Icon
            name="check"
            className="pointer-events-none invisible absolute inset-0 size-4 text-ui-primary peer-checked:visible"
          />
        </span>
      </span>
    </label>
  );
}
