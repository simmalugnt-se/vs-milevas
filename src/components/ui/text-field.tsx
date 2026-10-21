"use client";

import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from "react";
import { Icon } from "./icon";

type FieldProps = {
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
  className?: string;
};

const controlClassName =
  "min-w-0 flex-1 self-stretch bg-transparent text-text-xs text-ui-primary caret-ui-primary outline-none placeholder:text-ui-tertiary";

/**
 * form from Figma "02 — Components" → "Form" (8861:10820): a Label S heading with its number, then
 * a field on `bg-fill` in Text XS, the placeholder in `ui-tertiary`. The field stays in Light mode,
 * as in the contact form on a Dark background, while the heading follows the mode around it.
 * - Default: no border. Active (focus): a `border-primary` border, drawn inside as in Figma.
 * - Error: a `status-error` border and cross, and the message below in `status-error`.
 * - Success: a check at the end.
 */
function Field({
  label,
  number,
  error,
  success,
  className,
  "data-state": dataState,
  multiline,
  children,
}: FieldProps & {
  multiline?: boolean;
  children: (control: { id: string; describedBy?: string }) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col gap-(--spacing-2xs) ${className ?? ""}`}>
      <label htmlFor={id} className="flex gap-(--spacing-2xs) text-label-s text-ui-primary">
        {number ? <span>[{number}]</span> : null}
        {label}
      </label>
      <div
        data-state={dataState}
        className={`mode-light flex gap-(--spacing-2xs) rounded-sm bg-bg-fill px-(--spacing-sm) ring-1 ring-inset ${
          multiline ? "items-start py-(--spacing-xs)" : "min-h-10 items-center"
        } ${
          error
            ? "ring-status-error"
            : "ring-transparent focus-within:ring-border-primary data-[state=active]:ring-border-primary"
        }`}
      >
        {children({ id, describedBy: error ? errorId : undefined })}
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

type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "className" | "id">;

/** A one-line field: 40px high (Figma's `form`). */
export function TextField({
  label,
  number,
  error,
  success,
  className,
  "data-state": dataState,
  ...props
}: TextFieldProps) {
  return (
    <Field {...{ label, number, error, success, className, "data-state": dataState }}>
      {({ id, describedBy }) => (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={controlClassName}
          {...props}
        />
      )}
    </Field>
  );
}

type TextAreaFieldProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children" | "className" | "id">;

/**
 * The same field over four lines of Text XS (72px), as the message in Figma's `contact-form`. Figma
 * draws no resize handle, so there is none.
 */
export function TextAreaField({
  label,
  number,
  error,
  success,
  className,
  "data-state": dataState,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field multiline {...{ label, number, error, success, className, "data-state": dataState }}>
      {({ id, describedBy }) => (
        <textarea
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${controlClassName} resize-none`}
          {...props}
        />
      )}
    </Field>
  );
}
