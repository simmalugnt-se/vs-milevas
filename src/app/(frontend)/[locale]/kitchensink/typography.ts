/**
 * Figma "01 — Foundations" → "TEXT STYLES" and the `layout/sizes` variables they use.
 * `tests/design-tokens.test.mts` checks these lists against `src/styles/site-theme.css`.
 */
import type { ModeName } from "./breakpoints";

/** `layout/sizes/*` in px per mode; the CSS holds them as `--sizes-*` in rem. */
export const sizes: Record<string, Record<ModeName, number>> = {
  "4xl": { "Desktop L": 128, "Desktop S": 96, Tablet: 80, Mobile: 64 },
  "3xl": { "Desktop L": 96, "Desktop S": 80, Tablet: 64, Mobile: 48 },
  "2xl": { "Desktop L": 64, "Desktop S": 64, Tablet: 56, Mobile: 32 },
  xl: { "Desktop L": 36, "Desktop S": 36, Tablet: 32, Mobile: 24 },
  lg: { "Desktop L": 32, "Desktop S": 32, Tablet: 28, Mobile: 20 },
  md: { "Desktop L": 24, "Desktop S": 24, Tablet: 24, Mobile: 18 },
  sm: { "Desktop L": 16, "Desktop S": 16, Tablet: 16, Mobile: 16 },
  xs: { "Desktop L": 12, "Desktop S": 12, Tablet: 12, Mobile: 12 },
  "2xs": { "Desktop L": 8, "Desktop S": 8, Tablet: 8, Mobile: 8 },
  "3xs": { "Desktop L": 4, "Desktop S": 4, Tablet: 4, Mobile: 4 },
  "4xs": { "Desktop L": 2, "Desktop S": 2, Tablet: 2, Mobile: 2 },
};

export type TextStyle = {
  name: string;
  className: string;
  family: "display" | "text" | "label";
  size: keyof typeof sizes;
  weight: number;
  lineHeight: number;
  /** In em; Figma gives it in percent (-1 → -0.01em). */
  letterSpacing?: number;
  uppercase?: boolean;
};

export const textStyles: TextStyle[] = [
  {
    name: "Display L",
    className: "text-display-l",
    family: "display",
    size: "3xl",
    weight: 700,
    lineHeight: 0.9,
    uppercase: true,
  },
  {
    name: "Display M",
    className: "text-display-m",
    family: "display",
    size: "2xl",
    weight: 700,
    lineHeight: 0.9,
    uppercase: true,
  },
  {
    name: "Display S",
    className: "text-display-s",
    family: "display",
    size: "lg",
    weight: 700,
    lineHeight: 0.9,
    uppercase: true,
  },
  {
    name: "Display XS",
    className: "text-display-xs",
    family: "display",
    size: "md",
    weight: 700,
    lineHeight: 0.9,
    uppercase: true,
  },
  {
    name: "Text XL",
    className: "text-text-xl",
    family: "display",
    size: "xl",
    weight: 450,
    lineHeight: 1.1,
  },
  {
    name: "Text L",
    className: "text-text-l",
    family: "text",
    size: "md",
    weight: 500,
    lineHeight: 1.2,
  },
  {
    name: "Text M",
    className: "text-text-m",
    family: "text",
    size: "sm",
    weight: 500,
    lineHeight: 1.3,
    letterSpacing: -0.01,
  },
  {
    name: "Text S",
    className: "text-text-s",
    family: "text",
    size: "xs",
    weight: 600,
    lineHeight: 1,
  },
  {
    name: "Text XS",
    className: "text-text-xs",
    family: "text",
    size: "xs",
    weight: 500,
    lineHeight: 1,
  },
  {
    name: "Label L",
    className: "text-label-l",
    family: "label",
    size: "sm",
    weight: 800,
    lineHeight: 1,
    uppercase: true,
  },
  {
    name: "Label S",
    className: "text-label-s",
    family: "label",
    size: "xs",
    weight: 800,
    lineHeight: 1,
    uppercase: true,
  },
];

/** Inline style that pins every `--sizes-*` to one mode, so a column renders as that breakpoint. */
export const sizesForMode = (mode: ModeName): Record<`--sizes-${string}`, string> =>
  Object.fromEntries(
    Object.entries(sizes).map(([key, values]) => [`--sizes-${key}`, `${values[mode] / 16}rem`]),
  );
