import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(join(root, relativePath), "utf8");
}

test("videos come from the Mux plugin, before MCP, with the site's cache tags", async () => {
  const plugins = await read("src/payload/plugins/index.ts");
  // The plugin's own tests cover its endpoints; here: the project's wiring.
  assert.ok(plugins.indexOf("muxPlugin({") < plugins.indexOf("mcpPlugin({"));
  assert.match(plugins, /posterCollection: "images"/);
  assert.match(
    plugins,
    /afterChange: \[\.\.\.\(collection\.hooks\?\.afterChange \?\? \[\]\), revalidateVideos\]/,
  );
});

test("Payload content defaults are localized where regular sites need them", async () => {
  const pages = await read("src/payload/collections/Pages/config.ts");
  assert.match(pages, /name:\s*"title"[\s\S]*?localized:\s*false/);
  assert.match(pages, /name:\s*"layout"[\s\S]*?localized:\s*false/);
  assert.match(pages, /slugField\(\{\s*localized:\s*false\s*\}\)/);

  const richTextBlock = await read("src/payload/blocks/RichText/config.ts");
  assert.match(richTextBlock, /name:\s*"content"[\s\S]*?localized:\s*true/);

  const mediaBlock = await read("src/payload/blocks/Media/config.ts");
  assert.match(mediaBlock, /name:\s*"caption"[\s\S]*?localized:\s*true/);

  const linkField = await read("src/payload/fields/link.ts");
  assert.match(linkField, /name:\s*"label"[\s\S]*?localized:\s*true/);

  const footer = await read("src/payload/globals/Footer/config.ts");
  assert.match(footer, /name:\s*"copyright"[\s\S]*?localized:\s*true/);
});

test("Payload media renders full-size images by default and labels videos", async () => {
  const mediaUtility = await read("src/payload/utilities/media.ts");
  assert.match(
    mediaUtility,
    /type PreferredSize = "full" \| "card" \| "thumbnail";[\s\S]*preferredSize: PreferredSize = "full"/,
  );
  assert.match(mediaUtility, /if \(preferredSize === "full"\)/);

  const component = await read("src/components/cms/payload-media.tsx");
  assert.match(component, /aria-label=\{resolved\.alt \|\| undefined\}/);
});

test("R2 upload collections use their matching object prefixes", async () => {
  const payloadConfig = await read("src/payload.config.ts");

  assert.match(
    payloadConfig,
    /images:\s*\{\s*prefix:\s*"media",\s*disablePayloadAccessControl:\s*true/,
  );
  assert.match(
    payloadConfig,
    /documents:\s*\{\s*prefix:\s*"documents",\s*disablePayloadAccessControl:\s*true/,
  );
});
