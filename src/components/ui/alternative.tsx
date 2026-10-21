import type { InputHTMLAttributes, ReactNode } from "react";

type AlternativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & {
  /** The option's text. */
  children: ReactNode;
  /** Label S above the option, after the number (Figma's `Heading=True`). */
  label?: ReactNode;
  /** Shown in brackets before the label, as Figma's `[01]`. */
  number?: string;
  /** `data-state="active"` shows the selected look without selecting (the kitchensink does). */
  "data-state"?: "active";
};

/**
 * form-alternative from Figma "02 — Components" → "Form" (8882:12777): one option of a choice, a
 * radio in a box on `bg-fill` with Text XS and `spacing/md` above and below. Active (selected) adds
 * a `stroke/width` border in `border-primary`, drawn inside as in Figma. Give the options of one
 * choice the same `name`, in a fieldset with a legend.
 */
export function Alternative({
  children,
  label,
  number,
  className,
  "data-state": dataState,
  ...props
}: AlternativeProps) {
  return (
    <label className={`flex flex-col gap-(--spacing-2xs) ${className ?? ""}`}>
      {label ? (
        <span className="flex gap-(--spacing-2xs) text-label-s text-ui-primary">
          {number ? <span>[{number}]</span> : null}
          {label}
        </span>
      ) : null}
      <span
        data-state={dataState}
        className="flex cursor-pointer items-center rounded-sm bg-bg-fill px-(--spacing-sm) py-(--spacing-md) text-text-xs text-ui-primary ring-(length:--stroke-width) ring-transparent ring-inset has-checked:ring-border-primary data-[state=active]:ring-border-primary"
      >
        <input type="radio" className="sr-only" {...props} />
        {children}
      </span>
    </label>
  );
}
