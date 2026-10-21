import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { modes } from "../src/app/(frontend)/[locale]/kitchensink/breakpoints.ts";
import { allColorTokens, colorModes } from "../src/app/(frontend)/[locale]/kitchensink/colors.ts";
import { cardGrids, grid, radii } from "../src/app/(frontend)/[locale]/kitchensink/grid.ts";
import { durations, easings } from "../src/app/(frontend)/[locale]/kitchensink/motion.ts";
import { spacing, strokes } from "../src/app/(frontend)/[locale]/kitchensink/spacing.ts";
import { sizes, textStyles } from "../src/app/(frontend)/[locale]/kitchensink/typography.ts";

const themeCss = await readFile(new URL("../src/styles/site-theme.css", import.meta.url), "utf8");

/** The body of the first top-level block opened by `opener` (`:root`, `@theme`) that contains `marker`. */
const cssBlock = (opener: string, marker: string) =>
  [...themeCss.matchAll(new RegExp(`^${opener} \\{\\n([\\s\\S]*?)\\n\\}$`, "gm"))]
    .map((match) => match[1])
    .find((block) => block.includes(marker)) ?? "";

const customProperties = (block: string, prefix: string) =>
  new Map(
    [...block.matchAll(new RegExp(`(${prefix}[a-z0-9-]+)\\s*:\\s*([^;]+);`, "g"))].map(
      ([, token, value]) => [token, value.trim().toLowerCase()],
    ),
  );

/** `--primitive-*` from the `:root` block that holds Figma's primitives. */
const primitives = customProperties(cssBlock(":root", "--primitive-"), "--primitive-");

/** A color as written in the CSS, with a `var(--primitive-*)` replaced by its value. */
const resolveColor = (value: string) =>
  value.replace(/^var\((--primitive-[a-z0-9-]+)\)$/, (_, token) => {
    assert.ok(primitives.has(token), `${token} is not defined`);
    return primitives.get(token) ?? "";
  });

const colorDeclarations = (block: string) => customProperties(block, "--color-");

/** The `@theme` block with the colors: every color, with its Light value. */
const themeColors = colorDeclarations(cssBlock("@theme", "--color-ui-primary"));

const modeColors = (mode: string) =>
  colorDeclarations(
    themeCss.match(new RegExp(`@utility mode-${mode} \\{\\n([\\s\\S]*?)\\n\\}`))?.[1] ?? "",
  );

const resolved = (colors: Map<string, string>) =>
  new Map([...colors].map(([token, value]) => [token, resolveColor(value)]));

test("kitchensink color list and site-theme.css define the same tokens", () => {
  const listed = allColorTokens.map((color) => color.token).sort();
  assert.equal(new Set(listed).size, listed.length, "duplicate token in kitchensink list");
  assert.deepEqual(listed, [...themeColors.keys()].sort());
});

test("@theme holds the Light value of every color", () => {
  for (const color of allColorTokens) {
    assert.equal(
      resolveColor(themeColors.get(color.token) ?? ""),
      color.values.light.toLowerCase(),
      color.token,
    );
  }
});

test("each mode utility sets exactly the colors that differ between modes", () => {
  const modeDependent = allColorTokens.filter(
    (color) => new Set(Object.values(color.values)).size > 1,
  );
  for (const { mode } of colorModes) {
    assert.deepEqual(
      resolved(modeColors(mode)),
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
const layoutRoot = cssBlock(":root", "--grid-columns");

const withPrefix = (values: Map<string, string>, prefix: string) =>
  new Map([...values].filter(([property]) => property.startsWith(prefix)));

for (const [prefix, table] of [
  ["--sizes-", sizes],
  ["--spacing-", spacing],
  ["--stroke-", strokes],
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

const motionTheme = cssBlock("@theme", "--ease-");

test("motion in site-theme.css matches the kitchensink lists", () => {
  assert.deepEqual(
    customProperties(motionTheme, "--ease-"),
    new Map(easings.map((easing) => [`--ease-${easing.name}`, easing.value])),
  );
  assert.deepEqual(
    customProperties(motionTheme, "--transition-duration-"),
    new Map(
      durations.map((duration) => [
        `--transition-duration-${duration.name}`,
        `${duration.value}ms`,
      ]),
    ),
  );
});

/**
 * Figma's variable export in `docs/figma-variables`, one file per collection and mode
 * (Variables → collection → Export). Replace the files after a change in Figma; these tests then
 * say what the CSS has to follow.
 */
type FigmaVariable = {
  $type: string;
  $value: unknown;
  $extensions?: { "com.figma.aliasData"?: { targetVariableName: string } };
};

const readExport = async (collection: string, mode: string) => {
  const json = JSON.parse(
    await readFile(
      new URL(`../docs/figma-variables/${collection}/${mode}.tokens.json`, import.meta.url),
      "utf8",
    ),
  );
  const variables = new Map<string, FigmaVariable>();
  const walk = (node: Record<string, unknown>, path: string[]) => {
    if ("$value" in node) {
      variables.set(path.join("/"), node as FigmaVariable);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith("$")) walk(child as Record<string, unknown>, [...path, key]);
    }
  };
  walk(json, []);
  return variables;
};

const figmaHex = (value: unknown) => {
  const { hex, alpha } = value as { hex: string; alpha: number };
  return `${hex.toLowerCase()}${
    alpha < 1
      ? Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")
      : ""
  }`;
};

/** `color/neutral/700/100` → `--primitive-neutral-700-100`. */
const primitiveToken = (name: string) =>
  `--primitive-${name.replace(/^color\//, "").replaceAll("/", "-")}`;

/** `Color/BTN/secondary/border disabled` → `--color-btn-secondary-border-disabled`. */
const themeToken = (name: string) =>
  `--color-${name
    .toLowerCase()
    .replace(/^color\//, "")
    .replace(/[/ ]/g, "-")
    .replace("iinfo", "info")}`;

test("primitives in site-theme.css match Figma's ---primitives", async () => {
  const figma = await readExport("primitives", "Value");
  const colors = [...figma].filter(([, variable]) => variable.$type === "color");
  assert.deepEqual(
    primitives,
    new Map(colors.map(([name, variable]) => [primitiveToken(name), figmaHex(variable.$value)])),
  );
});

test("theme colors match Figma's theme collection in every mode, aliases included", async () => {
  for (const { mode, name } of colorModes) {
    const figma = await readExport("theme", name);
    const css = new Map([...themeColors, ...modeColors(mode)]);
    for (const [variableName, variable] of figma) {
      if (variable.$type !== "color") continue;
      const alias = variable.$extensions?.["com.figma.aliasData"]?.targetVariableName;
      assert.equal(
        css.get(themeToken(variableName)),
        alias ? `var(${primitiveToken(alias)})` : figmaHex(variable.$value),
        `${name} ${variableName}`,
      );
    }
  }
});

test("layout in site-theme.css matches Figma's layout collection in every mode", async () => {
  for (const mode of modes) {
    const figma = await readExport("layout", mode.name);
    const css = resolveForWidth(layoutRoot, mode.minWidth);
    const value = (name: string) => figma.get(name)?.$value;
    for (const [name, variable] of figma) {
      const [group, key] = name.split("/");
      if (group === "sizes" || group === "spacing" || group === "stroke") {
        const token = `--${group}-${key}`;
        assert.equal(toPx(css.get(token) ?? ""), variable.$value, `${mode.name} ${name}`);
      }
    }
    assert.equal(Number(css.get("--grid-columns")), value("grid/columns"), mode.name);
    assert.equal(toPx(css.get("--grid-margin") ?? ""), value("grid/margin"), mode.name);
    assert.equal(toPx(css.get("--grid-gap") ?? ""), value("grid/gap"), mode.name);
    assert.equal(radii.sm, value("shape/radius-sm"), mode.name);
    assert.equal(radii.lg, value("shape/radius-lg"), mode.name);
    assert.equal(mode.minWidth, value("breakpoints/width-min"), mode.name);
    assert.equal(mode.maxWidth, value("breakpoints/width-max"), mode.name);
    assert.equal(mode.designWidth, value("breakpoints/width-design"), mode.name);
  }
});

test("motion in site-theme.css matches Figma's motion collection", async () => {
  const figma = await readExport("motion", "Fast");
  for (const [name, variable] of figma) {
    const [group, key] = name.split("/");
    if (group === "easing") {
      assert.equal(customProperties(motionTheme, "--ease-").get(`--ease-${key}`), variable.$value);
    } else {
      const { value, unit } = variable.$value as { value: number; unit: string };
      assert.equal(
        customProperties(motionTheme, "--transition-duration-").get(`--transition-duration-${key}`),
        `${value}${unit}`,
      );
    }
  }
});

test("Figma's font families are the fonts the site loads ([locale]/layout.tsx)", async () => {
  const figma = await readExport("primitives", "Value");
  const families = {
    display: "Clash Grotesk Variable",
    text: "Clash Grotesk Variable",
    label: "Geist Mono",
  };
  for (const [family, font] of Object.entries(families)) {
    assert.equal(figma.get(`font/family/${family}`)?.$value, font, family);
  }
});
