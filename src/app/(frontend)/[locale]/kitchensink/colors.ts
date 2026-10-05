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
      {
        name: "UI Brand",
        token: "--color-ui-brand",
        className: "bg-ui-brand",
        value: "#e0ff3c",
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
      {
        name: "BG Active",
        token: "--color-bg-active",
        className: "bg-bg-active",
        value: "#ffffff",
      },
      {
        name: "BG Fill Secondary",
        token: "--color-bg-fill-secondary",
        className: "bg-bg-fill-secondary",
        value: "#d9d9d9",
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
  {
    /** Color/BTN/*: not on the COLOR STYLES frame, used by the buttons on "02 — Components". */
    title: "Button",
    colors: [
      {
        name: "BTN Primary Fill",
        token: "--color-btn-primary-fill",
        className: "bg-btn-primary-fill",
        value: "#121212",
      },
      {
        name: "BTN Primary Text",
        token: "--color-btn-primary-text",
        className: "text-btn-primary-text",
        value: "#f0f0f0",
      },
      {
        name: "BTN Primary Fill Hover",
        token: "--color-btn-primary-fill-hover",
        className: "bg-btn-primary-fill-hover",
        value: "#121212d9",
      },
      {
        name: "BTN Primary Fill Disabled",
        token: "--color-btn-primary-fill-disabled",
        className: "bg-btn-primary-fill-disabled",
        value: "#12121299",
      },
      {
        name: "BTN Primary Text Disabled",
        token: "--color-btn-primary-text-disabled",
        className: "text-btn-primary-text-disabled",
        value: "#f0f0f099",
      },
      {
        name: "BTN Tejp Fill",
        token: "--color-btn-tejp-fill",
        className: "bg-btn-tejp-fill",
        value: "#e0ff3c",
      },
      {
        name: "BTN Tejp Text",
        token: "--color-btn-tejp-text",
        className: "text-btn-tejp-text",
        value: "#121212",
      },
      {
        name: "BTN Tejp Fill Hover",
        token: "--color-btn-tejp-fill-hover",
        className: "bg-btn-tejp-fill-hover",
        value: "#e0ff3cd9",
      },
      {
        name: "BTN Tejp Fill Disabled",
        token: "--color-btn-tejp-fill-disabled",
        className: "bg-btn-tejp-fill-disabled",
        value: "#e0ff3c99",
      },
      {
        name: "BTN Tejp Text Disabled",
        token: "--color-btn-tejp-text-disabled",
        className: "text-btn-tejp-text-disabled",
        value: "#12121299",
      },
      {
        name: "BTN Inverted Fill",
        token: "--color-btn-inverted-fill",
        className: "bg-btn-inverted-fill",
        value: "#f0f0f0",
      },
      {
        name: "BTN Inverted Text",
        token: "--color-btn-inverted-text",
        className: "text-btn-inverted-text",
        value: "#121212",
      },
      {
        name: "BTN Inverted Fill Hover",
        token: "--color-btn-inverted-fill-hover",
        className: "bg-btn-inverted-fill-hover",
        value: "#f0f0f0d9",
      },
      {
        name: "BTN Inverted Fill Disabled",
        token: "--color-btn-inverted-fill-disabled",
        className: "bg-btn-inverted-fill-disabled",
        value: "#f0f0f099",
      },
      {
        name: "BTN Inverted Text Disabled",
        token: "--color-btn-inverted-text-disabled",
        className: "text-btn-inverted-text-disabled",
        value: "#12121299",
      },
      {
        name: "BTN Gray Fill",
        token: "--color-btn-gray-fill",
        className: "bg-btn-gray-fill",
        value: "#575757",
      },
      {
        name: "BTN Gray Text",
        token: "--color-btn-gray-text",
        className: "text-btn-gray-text",
        value: "#f0f0f0",
      },
      {
        name: "BTN Gray Fill Hover",
        token: "--color-btn-gray-fill-hover",
        className: "bg-btn-gray-fill-hover",
        value: "#575757d9",
      },
      {
        name: "BTN Gray Fill Disabled",
        token: "--color-btn-gray-fill-disabled",
        className: "bg-btn-gray-fill-disabled",
        value: "#2b2b2b99",
      },
      {
        name: "BTN Gray Text Disabled",
        token: "--color-btn-gray-text-disabled",
        className: "text-btn-gray-text-disabled",
        value: "#f0f0f099",
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
