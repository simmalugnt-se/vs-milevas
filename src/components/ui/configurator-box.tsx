import type { HTMLAttributes, ReactNode } from "react";

/**
 * configurator-box from Figma "02 — Components" → "Configurator" (frame 9, 8721:17422): one step of
 * the configurator. A `bg-fill` box with a `[01] LABEL` tag and its <Choice> options, two per row
 * (`grid`) or one per row (`stack`). Inside the box each choice keeps only its top rule, and in the
 * grid the left column also gets a rule on the right, as in Figma. Frame 9 replaces frame 6, which
 * Figma shows faded; its `choises=2, image=true, Grid` variant has no counterpart in 9 and is left out.
 * Stacked choices in Figma have rules above and below, which doubles them between options; one rule
 * is used here.
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

const layoutClasses = {
  grid: "grid grid-cols-2 [&>*:nth-child(odd)]:border-r",
  stack: "flex flex-col",
} as const;

/** A grid from Tablet up, stacked below it. */
const stackOnMobile =
  "flex flex-col tablet:grid tablet:grid-cols-2 tablet:[&>*:nth-child(odd)]:border-r";

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
      className={`flex flex-col gap-(--spacing-sm) overflow-hidden rounded-sm bg-bg-fill pt-(--spacing-sm) ${className ?? ""}`}
      {...props}
    >
      <p aria-hidden className="flex gap-4 px-4 text-label-s">
        <span className="text-ui-tertiary">[{number}]</span>
        <span className="text-ui-primary">{label}</span>
      </p>
      <div
        className={`w-full *:border-b-0 ${
          layout === "grid" && mobileLayout === "stack" ? stackOnMobile : layoutClasses[layout]
        }`}
      >
        {children}
      </div>
    </div>
  );
}
