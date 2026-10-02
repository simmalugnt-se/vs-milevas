/**
 * Color tokens as grouped on Figma "01 — Foundations" → "COLOR STYLES".
 * `tests/design-tokens.test.mts` checks this list against `src/styles/site-theme.css`.
 */
export type ColorToken = {
  name: string;
  /** CSS custom property defined in `site-theme.css`. */
  token: `--color-${string}`;
  /** Tailwind class that applies the token the way the group is meant to be used. */
  className: string;
  value: string;
};

export type ColorGroup = {
  title: string;
  colors: ColorToken[];
};

export const colorGroups: ColorGroup[] = [
  {
    title: "UI",
    colors: [
      {
        name: "UI Primary",
        token: "--color-ui-primary",
        className: "text-ui-primary",
        value: "#121212",
      },
      {
        name: "UI Secondary",
        token: "--color-ui-secondary",
        className: "text-ui-secondary",
        value: "#575757",
      },
      {
        name: "UI Tertiary",
        token: "--color-ui-tertiary",
        className: "text-ui-tertiary",
        value: "#999999",
      },
      {
        name: "UI Inv Primary",
        token: "--color-ui-inv-primary",
        className: "text-ui-inv-primary",
        value: "#f0f0f0",
      },
      {
        name: "UI Inv Secondary",
        token: "--color-ui-inv-secondary",
        className: "text-ui-inv-secondary",
        value: "#999999",
      },
      {
        name: "UI Inv Tertiary",
        token: "--color-ui-inv-tertiary",
        className: "text-ui-inv-tertiary",
        value: "#575757",
      },
    ],
  },
  {
    title: "Background",
    colors: [
      { name: "BG Fill", token: "--color-bg-fill", className: "bg-bg-fill", value: "#f0f0f0" },
      {
        name: "BG Surface",
        token: "--color-bg-surface",
        className: "bg-bg-surface",
        value: "#e0ff3c",
      },
      {
        name: "BG Inv Fill",
        token: "--color-bg-inv-fill",
        className: "bg-bg-inv-fill",
        value: "#121212",
      },
      {
        name: "BG Inv Surface",
        token: "--color-bg-inv-surface",
        className: "bg-bg-inv-surface",
        value: "#0b0b0b",
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
        value: "#999999",
      },
      {
        name: "Border Secondary",
        token: "--color-border-secondary",
        className: "border-border-secondary",
        value: "#121212",
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
        value: "#168a67",
      },
      {
        name: "Warning",
        token: "--color-status-warning",
        className: "text-status-warning",
        value: "#f4a900",
      },
      {
        name: "Error",
        token: "--color-status-error",
        className: "text-status-error",
        value: "#e44737",
      },
      {
        name: "Info",
        token: "--color-status-info",
        className: "text-status-info",
        value: "#3478f6",
      },
    ],
  },
];

/** The two stops behind `bg-gradient-inv`; shown as one swatch under Background. */
export const gradientStops: ColorToken[] = [
  {
    name: "Gradient Inv Start",
    token: "--color-gradient-inv-start",
    className: "bg-gradient-inv",
    value: "#12121299",
  },
  {
    name: "Gradient Inv End",
    token: "--color-gradient-inv-end",
    className: "bg-gradient-inv",
    value: "#12121200",
  },
];

export const allColorTokens: ColorToken[] = [
  ...colorGroups.flatMap((group) => group.colors),
  ...gradientStops,
];
