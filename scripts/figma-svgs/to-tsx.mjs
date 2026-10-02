// Prints the entries for `src/components/ui/{icon,arrow,logo}.tsx` from SVGs on Figma desktop's
// local MCP asset server: `node scripts/figma-svgs/to-tsx.mjs icon`. Figma must be open with the
// file. `assets.json` maps each name to its asset hash (the `http://localhost:3845/assets/<hash>.svg`
// URLs get_design_context returns); add new icons there, run, and paste the output between
// `const icons = {` and `} satisfies`.
import { readFile } from "node:fs/promises";

const group = process.argv[2];
const assets = JSON.parse(await readFile(new URL("./assets.json", import.meta.url), "utf8"))[group];
if (!assets)
  throw new Error(
    `Usage: node scripts/figma-svgs/to-tsx.mjs <${Object.keys(assets ?? {}).join("|") || "icon|arrow|logo"}>`,
  );

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** Figma's SVG → { viewBox, JSX body }: #121212 becomes currentColor, ids, styles, empty masks and clip paths go. */
const convert = (svg) => {
  const root = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  const viewBox = root[1].match(/viewBox="([^"]+)"/)[1];
  let body = root[2]
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/<mask[\s\S]*?<\/mask>/g, "")
    .replace(/\s(id|clip-path|mask|style|data-[a-z-]+)="[^"]*"/g, "")
    .replace(/#121212/gi, "currentColor")
    .replace(/\s([a-z]+(?:-[a-z]+)+)=/g, (_, a) => ` ${camel(a)}=`);
  while (/<g>/.test(body)) body = body.replace(/<g>\s*([\s\S]*?)\s*<\/g>/g, "$1");
  body = body.trim().replace(/\n\s*/g, "\n");
  const left = body.match(/(fill|stroke)="(?!currentColor|none)[^"]+"/g);
  if (left) throw new Error(`Unexpected colours (only #121212 is themed): ${left}`);
  return { viewBox, body };
};

for (const [name, hash] of Object.entries(assets)) {
  const response = await fetch(`http://localhost:3845/assets/${hash}.svg`);
  if (!response.ok) throw new Error(`${name}: ${response.status} (is Figma desktop open?)`);
  const { viewBox, body } = convert(await response.text());
  const lines = body
    .split("\n")
    .map((line) => `        ${line}`)
    .join("\n");
  console.log(
    `  "${name}": {\n    viewBox: "${viewBox}",\n    body: (\n      <>\n${lines}\n      </>\n    ),\n  },`,
  );
}
