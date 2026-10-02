import type { HTMLAttributes, ReactNode } from "react";

/**
 * text-box from Figma "02 — Components" → "blabla" (8502:6114): Text XL heading with a Label S tag
 * on the right and Text M body in `ui-tertiary`, optionally with a rule below (`Border=true`).
 */

type TextBoxProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  heading: ReactNode;
  label?: ReactNode;
  text?: ReactNode;
  border?: boolean;
};

export function TextBox({
  heading,
  label,
  text,
  border = true,
  className,
  ...props
}: TextBoxProps) {
  return (
    <div
      className={`flex flex-col gap-(--spacing-sm) p-(--spacing-sm) ${border ? "border-b border-border-primary" : ""} ${className ?? ""}`}
      {...props}
    >
      <div className="flex items-start gap-(--spacing-2xs) text-ui-primary">
        <p className="min-w-0 flex-1 text-text-xl">{heading}</p>
        {label ? <p className="shrink-0 whitespace-nowrap text-label-s">{label}</p> : null}
      </div>
      {text ? <p className="text-text-m text-ui-tertiary">{text}</p> : null}
    </div>
  );
}
