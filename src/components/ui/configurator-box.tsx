import type { HTMLAttributes, ReactNode } from "react";
import { ConfiguratorTopbar } from "./configurator-topbar";

/**
 * configurator-box from Figma "02 — Components" → "Configurator" (9250:32719): one step of the
 * configurator, a <ConfiguratorTopbar> over its <Choice> options, two per row (`grid`, Figma's
 * Grid) or one per row (`stack`, Figma's Stack). Each choice keeps its own frame, and the frames
 * overlap by `stroke/width`, with the topbar's too, so there is one line between them. The box rounds the bottom corners of the last row; do not
 * pass `bottom` to choices inside it. Figma's finance box stacks <FinancingChoice> options, with
 * a <CheckboxChoice> (the service agreement) `spacing/2xs` under the box as `addon`.
 */

type ConfiguratorBoxProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Step number, shown as `[01]`. */
  number: string;
  /** Step name; also the group's accessible name. */
  label: string;
  layout?: "grid" | "stack";
  /** Below Tablet; `stack` when two choices per row would be too narrow, e.g. for long prices. */
  mobileLayout?: "grid" | "stack";
  /** The step's <Choice> or <FinancingChoice> elements. */
  children: ReactNode;
  /** Under the box, e.g. a <CheckboxChoice>. */
  addon?: ReactNode;
};

/** The frames overlap, and the last row's bottom corners are round, per layout. */
const layoutClasses = {
  grid: "grid grid-cols-2 [&>:nth-child(n+3)]:-mt-(--stroke-width) [&>:nth-child(even)]:-ml-(--stroke-width) [&>:last-child]:rounded-br-sm [&>:last-child:nth-child(odd)]:rounded-bl-sm [&>:nth-last-child(2):nth-child(odd)]:rounded-bl-sm",
  stack: "flex flex-col [&>:not(:first-child)]:-mt-(--stroke-width) [&>:last-child]:rounded-b-sm",
} as const;

/** Stacked below Tablet, a grid from Tablet up. */
const stackOnMobile =
  "flex flex-col [&>:not(:first-child)]:-mt-(--stroke-width) [&>:last-child]:rounded-b-sm tablet:grid tablet:grid-cols-2 tablet:[&>:nth-child(2)]:mt-0 tablet:[&>:nth-child(even)]:-ml-(--stroke-width) tablet:[&>:last-child:nth-child(even)]:rounded-bl-none tablet:[&>:nth-last-child(2):nth-child(odd)]:rounded-bl-sm";

export function ConfiguratorBox({
  number,
  label,
  layout = "grid",
  mobileLayout = layout,
  children,
  addon,
  className,
  ...props
}: ConfiguratorBoxProps) {
  return (
    <div
      role="group"
      aria-label={`${number} ${label}`}
      className={`flex flex-col gap-(--spacing-2xs) ${className ?? ""}`}
      {...props}
    >
      <div className="flex flex-col">
        <ConfiguratorTopbar aria-hidden number={number} label={label} />
        <div
          className={`-mt-(--stroke-width) w-full ${
            layout === "grid" && mobileLayout === "stack" ? stackOnMobile : layoutClasses[layout]
          }`}
        >
          {children}
        </div>
      </div>
      {addon}
    </div>
  );
}
