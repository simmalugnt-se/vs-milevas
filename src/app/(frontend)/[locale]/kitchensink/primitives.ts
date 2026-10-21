import palette from "../../../../../docs/figma-variables/primitives/Value.tokens.json";

/**
 * Figma `---primitives`, read from its export: `color/neutral/700/100` is
 * `--primitive-neutral-700-100` in `site-theme.css`. One group per shade, one swatch per opacity.
 */
export type Primitive = { name: string; token: `--primitive-${string}`; value: string };

type FigmaColor = { $value: { hex: string; alpha: number } };

const hex = ({ hex, alpha }: FigmaColor["$value"]) =>
  `${hex.toLowerCase()}${
    alpha < 1
      ? Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")
      : ""
  }`;

const group = (path: string[], colors: Record<string, FigmaColor>) => ({
  title: path.join("/"),
  colors: Object.entries(colors).map(
    ([opacity, color]): Primitive => ({
      name: opacity,
      token: `--primitive-${[...path, opacity].join("-")}`,
      value: hex(color.$value),
    }),
  ),
});

export const primitiveGroups = [
  group(["brand", "tejp"], palette.color.brand.tejp),
  ...Object.entries(palette.color.neutral).map(([shade, colors]) =>
    group(["neutral", shade], colors),
  ),
];
