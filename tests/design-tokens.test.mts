import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { modes } from "../src/app/(frontend)/[locale]/kitchensink/breakpoints.ts";
import { allColorTokens } from "../src/app/(frontend)/[locale]/kitchensink/colors.ts";
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

const sizesInPx = (block: string) =>
  new Map(
    [...declarations(block)]
      .filter(([property]) => property.startsWith("--sizes-"))
      .map(([property, value]) => [property, toPx(value)]),
  );

/** The `:root` block with `--sizes-*`: base declarations plus one `@variant <breakpoint>` per mode. */
const sizesRoot = themeCss.match(/:root \{\n([\s\S]*?)\n\}\n/)?.[1] ?? "";
const variantPattern = /@variant ([a-z0-9-]+) \{([^}]*)\}/g;
const baseSizes = sizesInPx(sizesRoot.replace(variantPattern, ""));
const variantSizes = new Map(
  [...sizesRoot.matchAll(variantPattern)].map(([, variant, block]) => [variant, sizesInPx(block)]),
);

/** `--sizes-*` in px as a viewport of `width` sees them. */
const cssSizesForWidth = (width: number) => {
  const resolved = new Map(baseSizes);
  for (const [variant, values] of variantSizes) {
    const minWidth = breakpoints.get(variant);
    assert.ok(minWidth, `@variant ${variant} is not a breakpoint`);
    if (minWidth <= width) for (const [property, px] of values) resolved.set(property, px);
  }
  return resolved;
};

test("--sizes-* in site-theme.css match the Figma sizes for every mode", () => {
  for (const mode of modes) {
    const expected = new Map(
      Object.entries(sizes).map(([key, values]) => [`--sizes-${key}`, values[mode.name]]),
    );
    assert.deepEqual(cssSizesForWidth(mode.minWidth), expected, mode.name);
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
