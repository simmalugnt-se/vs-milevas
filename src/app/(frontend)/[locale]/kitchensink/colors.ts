import type { ColorMode } from "@/components/ui/color-mode";

/**
 * Color tokens as grouped on Figma "01 — Foundations" → "COLOR STYLES", with a value per mode; the
 * values match Figma's variable export (`Light.tokens.json`, `Dark.tokens.json`, `Tejp.tokens.json`).
 * `tests/design-tokens.test.mts` checks this list against `src/styles/site-theme.css`.
 */
export type ColorToken = {
  name: string;
  /** CSS custom property defined in `site-theme.css`. */
  token: `--color-${string}`;
  /** Tailwind class that applies the token the way the group is meant to be used. */
  className: string;
  values: Record<ColorMode, string>;
};

export type ColorGroup = {
  title: string;
  colors: ColorToken[];
};

/** The frame's three columns. */
export const colorModes: { mode: ColorMode; name: string }[] = [
  { mode: "light", name: "Light" },
  { mode: "dark", name: "Dark" },
  { mode: "tejp", name: "Tejp" },
];

export const colorGroups: ColorGroup[] = [
  {
    title: "UI",
    colors: [
      {
        name: "UI Primary",
        token: "--color-ui-primary",
        className: "text-ui-primary",
        values: { light: "#121212", dark: "#f0f0f0", tejp: "#121212" },
      },
      {
        name: "UI Secondary",
        token: "--color-ui-secondary",
        className: "text-ui-secondary",
        values: { light: "#575757", dark: "#999999", tejp: "#575757" },
      },
      {
        name: "UI Tertiary",
        token: "--color-ui-tertiary",
        className: "text-ui-tertiary",
        values: { light: "#999999", dark: "#575757", tejp: "#999999" },
      },
      {
        name: "Brand",
        token: "--color-ui-brand",
        className: "bg-ui-brand",
        values: { light: "#e0ff3c", dark: "#e0ff3c", tejp: "#e0ff3c" },
      },
    ],
  },
  {
    title: "Background",
    colors: [
      {
        name: "BG Fill",
        token: "--color-bg-fill",
        className: "bg-bg-fill",
        values: { light: "#f0f0f0", dark: "#121212", tejp: "#e0ff3c" },
      },
      {
        name: "BG Fill Secondary",
        token: "--color-bg-fill-secondary",
        className: "bg-bg-fill-secondary",
        values: { light: "#d9d9d9", dark: "#2b2b2b", tejp: "#d9d9d9" },
      },
      {
        name: "Active",
        token: "--color-bg-active",
        className: "bg-bg-active",
        values: { light: "#ffffff", dark: "#000000", tejp: "#e0ff3c" },
      },
    ],
  },
  {
    title: "Border",
    colors: [
      {
        name: "Border Primary",
        token: "--color-border-primary",
        className: "border-border-primary",
        values: { light: "#999999", dark: "#999999", tejp: "#575757" },
      },
      {
        name: "Border Secondary",
        token: "--color-border-secondary",
        className: "border-border-secondary",
        values: { light: "#121212", dark: "#121212", tejp: "#121212" },
      },
    ],
  },
  {
    title: "BTN",
    colors: [
      {
        name: "Primary Fill",
        token: "--color-btn-primary-fill",
        className: "bg-btn-primary-fill",
        values: { light: "#f0f0f0", dark: "#121212", tejp: "#e0ff3c" },
      },
      {
        name: "Primary Fill Hover",
        token: "--color-btn-primary-fill-hover",
        className: "bg-btn-primary-fill-hover",
        values: { light: "#f0f0f0d9", dark: "#363636", tejp: "#e5ff59" },
      },
      {
        name: "Primary Fill Disabled",
        token: "--color-btn-primary-fill-disabled",
        className: "bg-btn-primary-fill-disabled",
        values: { light: "#f0f0f099", dark: "#12121299", tejp: "#e0ff3c99" },
      },
      {
        name: "Primary Text",
        token: "--color-btn-primary-text",
        className: "text-btn-primary-text",
        values: { light: "#121212", dark: "#f0f0f0", tejp: "#121212" },
      },
      {
        name: "Primary Text Disabled",
        token: "--color-btn-primary-text-disabled",
        className: "text-btn-primary-text-disabled",
        values: { light: "#12121299", dark: "#f0f0f099", tejp: "#12121299" },
      },
      {
        name: "Primary Border",
        token: "--color-btn-primary-border",
        className: "ring-btn-primary-border",
        values: { light: "#121212", dark: "#f0f0f0", tejp: "#121212" },
      },
      {
        name: "Secondary Fill",
        token: "--color-btn-secondary-fill",
        className: "bg-btn-secondary-fill",
        values: { light: "#575757", dark: "#575757", tejp: "#121212" },
      },
      {
        name: "Secondary Fill Hover",
        token: "--color-btn-secondary-fill-hover",
        className: "bg-btn-secondary-fill-hover",
        values: { light: "#575757d9", dark: "#575757d9", tejp: "#e0ff3c" },
      },
      {
        name: "Secondary Fill Disabled",
        token: "--color-btn-secondary-fill-disabled",
        className: "bg-btn-secondary-fill-disabled",
        values: { light: "#575757d9", dark: "#57575799", tejp: "#12121299" },
      },
      {
        name: "Secondary Text",
        token: "--color-btn-secondary-text",
        className: "text-btn-secondary-text",
        values: { light: "#f0f0f0", dark: "#f0f0f0", tejp: "#e0ff3c" },
      },
      {
        name: "Secondary Text Hover",
        token: "--color-btn-secondary-text-hover",
        className: "text-btn-secondary-text-hover",
        values: { light: "#f0f0f0", dark: "#f0f0f0", tejp: "#121212" },
      },
      {
        name: "Secondary Text Disabled",
        token: "--color-btn-secondary-text-disabled",
        className: "text-btn-secondary-text-disabled",
        values: { light: "#f0f0f099", dark: "#f0f0f0", tejp: "#f0f0f099" },
      },
      {
        name: "Secondary Border",
        token: "--color-btn-secondary-border",
        className: "ring-btn-secondary-border",
        values: { light: "#575757d9", dark: "#575757d9", tejp: "#e0ff3c" },
      },
      {
        name: "Secondary Border Disabled",
        token: "--color-btn-secondary-border-disabled",
        className: "ring-btn-secondary-border-disabled",
        values: { light: "#57575799", dark: "#575757d9", tejp: "#e0ff3c99" },
      },
    ],
  },
  {
    title: "Navigation",
    colors: [
      {
        name: "Fill",
        token: "--color-navigation-fill",
        className: "bg-navigation-fill",
        values: { light: "#121212eb", dark: "#121212eb", tejp: "#121212eb" },
      },
      {
        name: "Overlay",
        token: "--color-navigation-overlay",
        className: "bg-navigation-overlay",
        values: { light: "#00000066", dark: "#00000066", tejp: "#00000066" },
      },
    ],
  },
  {
    title: "Status",
    colors: [
      {
        name: "Success",
        token: "--color-status-success",
        className: "text-status-success",
        values: { light: "#168a67", dark: "#168a67", tejp: "#168a67" },
      },
      {
        name: "Warning",
        token: "--color-status-warning",
        className: "text-status-warning",
        values: { light: "#f4a900", dark: "#f4a900", tejp: "#f4a900" },
      },
      {
        name: "Error",
        token: "--color-status-error",
        className: "text-status-error",
        values: { light: "#e44737", dark: "#e44737", tejp: "#e44737" },
      },
      {
        name: "Info",
        token: "--color-status-info",
        className: "text-status-info",
        values: { light: "#3478f6", dark: "#3478f6", tejp: "#3478f6" },
      },
    ],
  },
];

export const allColorTokens: ColorToken[] = colorGroups.flatMap((group) => group.colors);
