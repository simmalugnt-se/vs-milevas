/**
 * Figma's color modes ("01 — Foundations" → "COLOR STYLES"). The page is Light; a `mode-*` class
 * switches the colors for an element and everything in it (see `site-theme.css`).
 */
export type ColorMode = "light" | "dark" | "tejp";

/** Literal class names, so Tailwind finds them. */
export const modeClass: Record<ColorMode, string> = {
  light: "mode-light",
  dark: "mode-dark",
  tejp: "mode-tejp",
};
