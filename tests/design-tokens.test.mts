import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { modes } from "../src/app/(frontend)/[locale]/kitchensink/breakpoints.ts";
import { allColorTokens, colorModes } from "../src/app/(frontend)/[locale]/kitchensink/colors.ts";
import { cardGrids, grid, radii } from "../src/app/(frontend)/[locale]/kitchensink/grid.ts";
import { spacing } from "../src/app/(frontend)/[locale]/kitchensink/spacing.ts";
import { sizes, textStyles } from "../src/app/(frontend)/[locale]/kitchensink/typography.ts";

const themeCss = await readFile(new URL("../src/styles/site-theme.css", import.meta.url), "utf8");

const colorDeclarations = (block: string) =>
  new Map(
    [...block.matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, token, value]) => [
      token,
      value.trim().toLowerCase(),
    ]),
  );

/** The first `@theme` block: every color, with its Light value. */
const themeColors = colorDeclarations(themeCss.match(/@theme \{\n([\s\S]*?)\n\}/)?.[1] ?? "");

const modeColors = (mode: string) =>
  colorDeclarations(
    themeCss.match(new RegExp(`@utility mode-${mode} \\{\\n([\\s\\S]*?)\\n\\}`))?.[1] ?? "",
  );

test("kitchensink color list and site-theme.css define the same tokens", () => {
  const listed = allColorTokens.map((color) => color.token).sort();
  assert.equal(new Set(listed).size, listed.length, "duplicate token in kitchensink list");
  assert.deepEqual(listed, [...themeColors.keys()].sort());
});

test("@theme holds the Light value of every color", () => {
  for (const color of allColorTokens) {
    assert.equal(themeColors.get(color.token), color.values.light.toLowerCase(), color.token);
  }
});

test("each mode utility sets exactly the colors that differ between modes", () => {
  const modeDependent = allColorTokens.filter(
    (color) => new Set(Object.values(color.values)).size > 1,
  );
  for (const { mode } of colorModes) {
    assert.deepEqual(
      modeColors(mode),
      new Map(modeDependent.map((color) => [color.token, color.values[mode].toLowerCase()])),
      `mode-${mode}`,
    );
  }
});

const declarations = (block: string) =>
  new Map(
    [...block.matchAll(/([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, property, value]) => [
      property,
      value.trim(),
    ]),
  );

const toPx = (value: string) => {
  assert.match(value, /^[\d.]+rem$/);
  return Number.parseFloat(value) * 16;
};

const breakpoints = new Map(
  [...themeCss.matchAll(/--breakpoint-([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
    name,
    toPx(value.trim()),
  ]),
);

test("breakpoints in site-theme.css match Figma breakpoints/width-min", () => {
  const expected = new Map(
    modes.flatMap((mode) => (mode.variant ? [[mode.variant, mode.minWidth] as const] : [])),
  );
  assert.deepEqual(breakpoints, expected);
});

const variantPattern = /@variant ([a-z0-9-]+) \{([^}]*)\}/g;

/** Declarations in a mobile-first block as a viewport of `width` sees them: base plus matching variants. */
const resolveForWidth = (block: string, width: number) => {
  const resolved = declarations(block.replace(variantPattern, ""));
  for (const [, variant, variantBlock] of block.matchAll(variantPattern)) {
    const minWidth = breakpoints.get(variant);
    assert.ok(minWidth, `@variant ${variant} is not a breakpoint`);
    if (minWidth <= width)
      for (const [property, value] of declarations(variantBlock)) {
        resolved.set(property, value);
      }
  }
  return resolved;
};

/** The `:root` block with the per-mode layout variables (`--sizes-*`, `--grid-*`). */
const layoutRoot = themeCss.match(/:root \{\n([\s\S]*?)\n\}\n/)?.[1] ?? "";

const withPrefix = (values: Map<string, string>, prefix: string) =>
  new Map([...values].filter(([property]) => property.startsWith(prefix)));

for (const [prefix, table] of [
  ["--sizes-", sizes],
  ["--spacing-", spacing],
] as const) {
  test(`${prefix}* in site-theme.css match Figma layout for every mode`, () => {
    for (const mode of modes) {
      const css = withPrefix(resolveForWidth(layoutRoot, mode.minWidth), prefix);
      const expected = new Map(
        Object.entries(table).map(([key, values]) => [`${prefix}${key}`, values[mode.name]]),
      );
      assert.deepEqual(new Map([...css].map(([k, v]) => [k, toPx(v)])), expected, mode.name);
    }
  });
}

test("--grid-* in site-theme.css match Figma layout/grid for every mode", () => {
  for (const mode of modes) {
    const css = withPrefix(resolveForWidth(layoutRoot, mode.minWidth), "--grid-");
    assert.deepEqual(
      new Map([
        ["--grid-columns", Number(css.get("--grid-columns"))],
        ["--grid-margin", toPx(css.get("--grid-margin") ?? "")],
        ["--grid-gap", toPx(css.get("--grid-gap") ?? "")],
      ]),
      new Map([
        ["--grid-columns", grid.columns[mode.name]],
        ["--grid-margin", grid.margin[mode.name]],
        ["--grid-gap", grid.gap[mode.name]],
      ]),
      mode.name,
    );
    assert.equal(css.size, 3, `${mode.name}: unexpected --grid-* variables`);
  }
});

test("radii in site-theme.css match Figma layout/shape", () => {
  const css = new Map(
    [...themeCss.matchAll(/--radius-([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      toPx(value.trim()),
    ]),
  );
  assert.deepEqual(css, new Map(Object.entries(radii)));
});

const cardGridUtilities = new Map(
  [...themeCss.matchAll(/@utility (card-grid-[a-z0-9-]+) \{\n([\s\S]*?)\n\}/g)].map(
    ([, name, block]) => [name, block],
  ),
);

test("card grids in site-theme.css match the kitchensink list for every mode", () => {
  assert.deepEqual(
    cardGrids.map((cardGrid) => cardGrid.className).sort(),
    [...cardGridUtilities.keys()].sort(),
  );
  for (const cardGrid of cardGrids) {
    const block = cardGridUtilities.get(cardGrid.className) ?? "";
    for (const mode of modes) {
      const columns = resolveForWidth(block, mode.minWidth).get("grid-template-columns");
      assert.equal(
        columns,
        `repeat(${cardGrid.perRow[mode.name]}, minmax(0, 1fr))`,
        `${cardGrid.className} ${mode.name}`,
      );
    }
  }
});

const textUtilities = new Map(
  [...themeCss.matchAll(/@utility (text-[a-z-]+) \{([^}]*)\}/g)].map(([, name, block]) => [
    name,
    declarations(block),
  ]),
);

test("kitchensink text styles and site-theme.css define the same utilities", () => {
  assert.deepEqual(
    textStyles.map((style) => style.className).sort(),
    [...textUtilities.keys()].sort(),
  );
});

test("text style utilities match the Figma text styles", () => {
  for (const style of textStyles) {
    const css = textUtilities.get(style.className);
    assert.ok(css, style.className);
    assert.equal(css.get("font-family"), `--theme(--font-${style.family})`, style.className);
    assert.equal(css.get("font-size"), `var(--sizes-${style.size})`, style.className);
    assert.equal(css.get("font-weight"), String(style.weight), style.className);
    assert.equal(css.get("line-height"), String(style.lineHeight), style.className);
    assert.equal(
      css.get("letter-spacing"),
      style.letterSpacing ? `${style.letterSpacing}em` : undefined,
      style.className,
    );
    assert.equal(
      css.get("text-transform"),
      style.uppercase ? "uppercase" : undefined,
      style.className,
    );
  }
});
