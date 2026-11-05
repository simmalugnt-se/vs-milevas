import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { getPickerBlocks } from "./block-thumbnail-blocks.mjs";

/** Screenshots each block at Desktop S, from the running dev server. See docs/block-thumbnails.md. */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.BLOCK_PREVIEW_BASE_URL ?? "http://localhost:3000";
const browserChannel =
  process.env.BLOCK_PREVIEW_BROWSER_CHANNEL ??
  (existsSync(chromium.executablePath()) ? undefined : "chrome");
const only = process.argv[2];
const WIDTH = 600;
const HEIGHT = 400;

const allBlockTypes = (await getPickerBlocks()).map((block) => block.slug);
if (only && !allBlockTypes.includes(only)) throw new Error(`Unknown block: ${only}`);
const blockTypes = only ? [only] : allBlockTypes;

const outputDir = path.join(repoRoot, "public", "block-thumbnails");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(browserChannel ? { channel: browserChannel } : {}),
});
const page = await browser.newPage({
  // The narrowest desktop layout, so that the text can be read in a 600 px picture.
  viewport: { width: 1024, height: 683 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});

try {
  for (const blockType of blockTypes) {
    const url = new URL(`/preview-block/${blockType}`, baseUrl);
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await page.goto(url.toString(), {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      if (response?.ok() || response?.status() !== 500) break;
      await page.waitForTimeout(1000);
    }
    if (!response?.ok()) {
      throw new Error(`${blockType}: preview returned HTTP ${response?.status() ?? "no response"}`);
    }

    const preview = page.locator(`#block-preview-capture[data-block-preview="${blockType}"]`);
    await preview.waitFor({ state: "visible", timeout: 60000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const images = Array.from(document.querySelectorAll("#block-preview-capture img"));
      await Promise.race([
        Promise.all(
          images.map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => {});
          }),
        ),
        new Promise((resolve) => setTimeout(resolve, 30000)),
      ]);
    });
    await page.waitForTimeout(500);

    const screenshot = await preview.screenshot({
      animations: "disabled",
      scale: "css",
      style: "nextjs-portal { display: none !important; }",
    });
    const { width, height } = await sharp(screenshot).metadata();
    if (!width || !height) throw new Error(`${blockType}: empty screenshot`);

    // Pad short blocks with the page's background; crop tall ones from the top.
    const background = await page.evaluate(
      () => getComputedStyle(document.querySelector("body > .canvas, body")).backgroundColor,
    );
    const frameHeight = Math.round((width * HEIGHT) / WIDTH);
    const visibleHeight = Math.min(height, frameHeight);
    const cropped = await sharp(screenshot)
      .extract({ left: 0, top: 0, width, height: visibleHeight })
      .toBuffer();
    const framed =
      visibleHeight < frameHeight
        ? await sharp(cropped)
            .extend({
              top: Math.floor((frameHeight - visibleHeight) / 2),
              bottom: Math.ceil((frameHeight - visibleHeight) / 2),
              left: 0,
              right: 0,
              background,
            })
            .toBuffer()
        : cropped;
    const output = path.join(outputDir, `${blockType}.webp`);
    await sharp(framed).resize(WIDTH, HEIGHT).webp({ quality: 82 }).toFile(output);
    process.stdout.write(`${blockType}: ${width}x${height}\n`);
  }

  if (!only) {
    // One picture of them all for review, outside `public` since the site does not need it.
    const sheet = path.join(repoRoot, "tmp", "block-thumbnails-contact-sheet.webp");
    await mkdir(path.dirname(sheet), { recursive: true });
    const columns = 4;
    await sharp({
      create: {
        width: columns * WIDTH,
        height: Math.ceil(allBlockTypes.length / columns) * HEIGHT,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite(
        allBlockTypes.map((blockType, index) => ({
          input: path.join(outputDir, `${blockType}.webp`),
          left: (index % columns) * WIDTH,
          top: Math.floor(index / columns) * HEIGHT,
        })),
      )
      .webp({ quality: 82 })
      .toFile(sheet);
    process.stdout.write(`Contact sheet: ${sheet}\n`);
  }
} finally {
  await browser.close();
}
process.exit(0);
