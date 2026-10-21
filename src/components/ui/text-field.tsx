"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { Icon } from "./icon";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children"> & {
  /** Label S above the field, after the number. */
  label: ReactNode;
  /** Shown in brackets before the label, as Figma's `[01]`. */
  number?: string;
  /** The error message: a red border and cross, and the message below. */
  error?: ReactNode;
  /** A check at the end, for a value that has been accepted. */
  success?: boolean;
  /** `data-state="active"` shows the focused look without focus (the kitchensink does). */
  "data-state"?: "active";
};

/**
 * form from Figma "02 — Components" → "Form" (8861:10820): a Label S heading with its number, then
 * a 40px field on `bg-fill` in Text XS, the placeholder in `ui-tertiary`.
 * - Default: no border. Active (focus): a `border-primary` border.
 * - Error: a `status-error` border and cross, and the message below in `status-error`.
 * - Success: a check at the end.
 */
export function TextField({
  label,
  number,
  error,
  success,
  id,
  className,
  "data-state": dataState,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-(--spacing-2xs) ${className ?? ""}`}>
      <label htmlFor={inputId} className="flex gap-(--spacing-2xs) text-label-s text-ui-primary">
        {number ? <span>[{number}]</span> : null}
        {label}
      </label>
      <div
        data-state={dataState}
        className={`flex min-h-10 items-center gap-(--spacing-2xs) rounded-sm border bg-bg-fill px-(--spacing-sm) ${
          error
            ? "border-status-error"
            : "border-transparent focus-within:border-border-primary data-[state=active]:border-border-primary"
        }`}
      >
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 self-stretch bg-transparent text-text-xs text-ui-primary caret-ui-primary outline-none placeholder:text-ui-tertiary"
          {...props}
        />
        {error ? (
          <Icon name="close" className="size-3 text-status-error" />
        ) : success ? (
          <Icon name="check" className="text-ui-primary" />
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-text-xs text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
