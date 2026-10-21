import type { HTMLAttributes, ReactNode } from "react";
import { ConfiguratorTopbar } from "./configurator-topbar";

/**
 * configurator-box from Figma "02 — Components" → "Configurator" (9250:32719): one step of the
 * configurator, a <ConfiguratorTopbar> over its <Choice> options, two per row (`grid`, Figma's
 * Grid) or one per row (`stack`, Figma's Stack). Each choice keeps its own frame, as in Figma, so
 * the lines between them are doubled. The box rounds the bottom corners of the last row; do not
 * pass `bottom` to choices inside it.
 */

type ConfiguratorBoxProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Step number, shown as `[01]`. */
  number: string;
  /** Step name; also the group's accessible name. */
  label: string;
  layout?: "grid" | "stack";
  /** Below Tablet; `stack` when two choices per row would be too narrow, e.g. for long prices. */
  mobileLayout?: "grid" | "stack";
  /** The step's <Choice> elements. */
  children: ReactNode;
};

/** The last row's bottom corners, per layout. */
const layoutClasses = {
  grid: "grid grid-cols-2 [&>:last-child]:rounded-br-sm [&>:last-child:nth-child(odd)]:rounded-bl-sm [&>:nth-last-child(2):nth-child(odd)]:rounded-bl-sm",
  stack: "flex flex-col [&>:last-child]:rounded-b-sm",
} as const;

/** Stacked below Tablet, a grid from Tablet up. */
const stackOnMobile =
  "flex flex-col [&>:last-child]:rounded-b-sm tablet:grid tablet:grid-cols-2 tablet:[&>:last-child:nth-child(even)]:rounded-bl-none tablet:[&>:nth-last-child(2):nth-child(odd)]:rounded-bl-sm";

/**
 * The layout for a step's choices: two per row when there are more than two (Figma's lift
 * capacity), stacked otherwise (battery, mast). Below Tablet a grid stacks too when a price is
 * longer than "+3500 kr", which would squeeze the titles in half the width.
 */
export function choiceLayout(prices: string[]) {
  const layout = prices.length > 2 ? "grid" : "stack";
  const mobileLayout = prices.some((price) => price.length > 8) ? "stack" : layout;
  return { layout, mobileLayout } as const;
}

export function ConfiguratorBox({
  number,
  label,
  layout = "grid",
  mobileLayout = layout,
  children,
  className,
  ...props
}: ConfiguratorBoxProps) {
  return (
    <div
      role="group"
      aria-label={`${number} ${label}`}
      className={`flex flex-col ${className ?? ""}`}
      {...props}
    >
      <ConfiguratorTopbar aria-hidden number={number} label={label} />
      <div
        className={`w-full ${
          layout === "grid" && mobileLayout === "stack" ? stackOnMobile : layoutClasses[layout]
        }`}
      >
        {children}
      </div>
    </div>
  );
}
