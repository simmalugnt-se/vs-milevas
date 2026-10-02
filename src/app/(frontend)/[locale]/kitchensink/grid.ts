/**
 * Figma "01 — Foundations" → "GRIDS" and the `layout/grid/*` and `layout/shape/*` variables.
 * `tests/design-tokens.test.mts` checks these lists against `src/styles/site-theme.css`.
 */
import type { ModeName } from "./breakpoints";

/** `layout/grid/*` per mode; margin and gap in px. */
export const grid: Record<"columns" | "margin" | "gap", Record<ModeName, number>> = {
  columns: { "Desktop L": 12, "Desktop S": 12, Tablet: 6, Mobile: 6 },
  margin: { "Desktop L": 8, "Desktop S": 8, Tablet: 8, Mobile: 8 },
  gap: { "Desktop L": 8, "Desktop S": 8, Tablet: 8, Mobile: 8 },
};

/** `layout/shape/*` in px, the same in every mode. */
export const radii = { sm: 8, lg: 16 } as const;

export type CardGrid = {
  name: string;
  className: string;
  /** Cards per row. Desktop follows Figma; Tablet and Mobile are our own decision (see `fromFigma`). */
  perRow: Record<ModeName, number>;
  /** Slot height in the Figma frame, px. */
  slotHeight: number;
};

/** Which modes the Figma frame shows. Tablet and Mobile were decided by us on 2026-10-02. */
export const fromFigma: Record<ModeName, boolean> = {
  "Desktop L": true,
  "Desktop S": true,
  Tablet: false,
  Mobile: false,
};

export const cardGrids: CardGrid[] = [
  {
    name: "4 Columns",
    className: "card-grid-4",
    perRow: { "Desktop L": 4, "Desktop S": 4, Tablet: 2, Mobile: 1 },
    slotHeight: 380,
  },
  {
    name: "3 Columns",
    className: "card-grid-3",
    perRow: { "Desktop L": 3, "Desktop S": 3, Tablet: 2, Mobile: 1 },
    slotHeight: 520,
  },
  {
    name: "2 Columns",
    className: "card-grid-2",
    perRow: { "Desktop L": 2, "Desktop S": 2, Tablet: 2, Mobile: 1 },
    slotHeight: 800,
  },
];
