/**
 * Figma `motion` (mode Fast): easings and durations.
 * `tests/design-tokens.test.mts` checks these lists against `src/styles/site-theme.css`.
 */
export const easings: { name: string; className: string; value: string }[] = [
  { name: "slow-in", className: "ease-slow-in", value: "cubic-bezier(1, 0, 0.4, 1)" },
  { name: "slow-out", className: "ease-slow-out", value: "cubic-bezier(0.6, 0, 0, 1)" },
  { name: "slow-in-out", className: "ease-slow-in-out", value: "cubic-bezier(0.8, 0, 0.2, 1)" },
  { name: "fade-in", className: "ease-fade-in", value: "cubic-bezier(0, 0, 0, 1)" },
];

/** In ms. */
export const durations: { name: string; className: string; value: number }[] = [
  { name: "short", className: "duration-short", value: 300 },
  { name: "medium", className: "duration-medium", value: 600 },
  { name: "long", className: "duration-long", value: 1200 },
  { name: "very-long", className: "duration-very-long", value: 2400 },
];
