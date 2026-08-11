import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(join(root, relativePath), "utf8");
}

test("Mux routes require Payload auth and avoid wildcard upload CORS", async () => {
  const routeFiles = [
    "src/app/(payload)/api/mux/asset-status/route.ts",
    "src/app/(payload)/api/mux/delete-asset/route.ts",
    "src/app/(payload)/api/mux/get-assets/route.ts",
    "src/app/(payload)/api/mux/upload-asset/route.ts",
  ];

  const shared = await read("src/app/(payload)/api/mux/shared.ts");
  assert.match(shared, /payload\.auth/);

  for (const routeFile of routeFiles) {
    const source = await read(routeFile);
    assert.match(source, /requireMuxAuth\(req\)/, `${routeFile} should enforce Payload auth`);
  }

  const uploadRoute = await read("src/app/(payload)/api/mux/upload-asset/route.ts");
  assert.match(uploadRoute, /cors_origin:\s*getCorsOrigin\(\)/);
  assert.doesNotMatch(uploadRoute, /cors_origin:\s*["']\*["']/);
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
    /preferredSize:\s*"full"\s*\|\s*"card"\s*\|\s*"thumbnail"\s*=\s*"full"/,
  );
  assert.match(mediaUtility, /if \(preferredSize === "full"\)/);

  const component = await read("src/components/cms/payload-media.tsx");
  assert.match(component, /aria-label=\{resolved\.alt \|\| undefined\}/);
});

test("R2 upload collections use their matching object prefixes", async () => {
  const payloadConfig = await read("src/payload.config.ts");

  assert.match(
    payloadConfig,
    /media:\s*\{\s*prefix:\s*"media",\s*disablePayloadAccessControl:\s*true/,
  );
  assert.match(
    payloadConfig,
    /documents:\s*\{\s*prefix:\s*"documents",\s*disablePayloadAccessControl:\s*true/,
  );
});
