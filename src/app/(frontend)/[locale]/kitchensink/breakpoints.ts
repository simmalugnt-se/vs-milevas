/**
 * Figma "01 — Foundations" → "BREAKPOINTS": the modes of the `layout` collection and their
 * `breakpoints/*` variables, widest first. `tests/design-tokens.test.mts` checks the variants against
 * `--breakpoint-*` in `src/styles/site-theme.css`.
 */
export const modes = [
  {
    name: "Desktop L",
    /** Tailwind variant; `null` for Mobile, which is the unprefixed base. */
    variant: "desktop-l",
    minWidth: 1440,
    maxWidth: 1920,
    designWidth: 1440,
  },
  { name: "Desktop S", variant: "desktop-s", minWidth: 1024, maxWidth: 1439, designWidth: 1280 },
  { name: "Tablet", variant: "tablet", minWidth: 768, maxWidth: 1023, designWidth: 800 },
  { name: "Mobile", variant: null, minWidth: 320, maxWidth: 767, designWidth: 375 },
] as const;

export type Mode = (typeof modes)[number];
export type ModeName = Mode["name"];
