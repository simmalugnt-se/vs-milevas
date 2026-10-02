import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { modes } from "../src/app/(frontend)/[locale]/kitchensink/breakpoints.ts";
import { allColorTokens } from "../src/app/(frontend)/[locale]/kitchensink/colors.ts";
import { cardGrids, grid, radii } from "../src/app/(frontend)/[locale]/kitchensink/grid.ts";
import { sizes, textStyles } from "../src/app/(frontend)/[locale]/kitchensink/typography.ts";

const themeCss = await readFile(new URL("../src/styles/site-theme.css", import.meta.url), "utf8");

const cssColorTokens = new Map(
  [...themeCss.matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, token, value]) => [
    token,
    value.trim().toLowerCase(),
  ]),
);

test("kitchensink color list and site-theme.css define the same tokens", () => {
  const listed = allColorTokens.map((color) => color.token).sort();
  assert.equal(new Set(listed).size, listed.length, "duplicate token in kitchensink list");
  assert.deepEqual(listed, [...cssColorTokens.keys()].sort());
});

test("kitchensink color values match site-theme.css", () => {
  for (const color of allColorTokens) {
    assert.equal(cssColorTokens.get(color.token), color.value.toLowerCase(), color.token);
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

test("--sizes-* in site-theme.css match the Figma sizes for every mode", () => {
  for (const mode of modes) {
    const css = withPrefix(resolveForWidth(layoutRoot, mode.minWidth), "--sizes-");
    const expected = new Map(
      Object.entries(sizes).map(([key, values]) => [`--sizes-${key}`, values[mode.name]]),
    );
    assert.deepEqual(new Map([...css].map(([k, v]) => [k, toPx(v)])), expected, mode.name);
  }
});

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
