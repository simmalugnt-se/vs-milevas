/**
 * Figma `layout/spacing/*` in px per mode; the CSS holds them as `--spacing-*` in rem.
 * `tests/design-tokens.test.mts` checks this list against `src/styles/site-theme.css`.
 */
import type { ModeName } from "./breakpoints";

export const spacing: Record<string, Record<ModeName, number>> = {
  "4xl": { "Desktop L": 128, "Desktop S": 96, Tablet: 80, Mobile: 64 },
  "3xl": { "Desktop L": 96, "Desktop S": 80, Tablet: 64, Mobile: 56 },
  "2xl": { "Desktop L": 64, "Desktop S": 64, Tablet: 56, Mobile: 48 },
  xl: { "Desktop L": 48, "Desktop S": 48, Tablet: 48, Mobile: 40 },
  lg: { "Desktop L": 32, "Desktop S": 32, Tablet: 32, Mobile: 24 },
  md: { "Desktop L": 24, "Desktop S": 24, Tablet: 24, Mobile: 24 },
  sm: { "Desktop L": 16, "Desktop S": 16, Tablet: 16, Mobile: 16 },
  xs: { "Desktop L": 12, "Desktop S": 12, Tablet: 12, Mobile: 12 },
  "2xs": { "Desktop L": 8, "Desktop S": 8, Tablet: 8, Mobile: 8 },
  "3xs": { "Desktop L": 4, "Desktop S": 4, Tablet: 4, Mobile: 4 },
  "4xs": { "Desktop L": 2, "Desktop S": 2, Tablet: 2, Mobile: 2 },
};
