import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getPickerBlocks } from "./block-thumbnail-blocks.mjs";

/** Every block in the picker has its thumbnail URL and a 600 × 400 image. */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

for (const block of await getPickerBlocks()) {
  const expectedUrl = `/block-thumbnails/${block.slug}.webp`;
  const thumbnail = block.admin?.images?.thumbnail;
  const actualUrl = typeof thumbnail === "string" ? thumbnail : thumbnail?.url;
  if (actualUrl !== expectedUrl) errors.push(`${block.slug}: thumbnail URL is not ${expectedUrl}`);

  const file = path.join(repoRoot, "public", expectedUrl);
  try {
    await access(file);
    const { width, height } = await sharp(file).metadata();
    if (width !== 600 || height !== 400) {
      errors.push(`${block.slug}: expected 600x400, got ${width}x${height}`);
    }
  } catch {
    errors.push(`${block.slug}: image missing or unreadable`);
  }
}

if (errors.length) {
  for (const error of errors) process.stderr.write(`${error}\n`);
  process.exit(1);
}
process.stdout.write("Block thumbnails are complete.\n");
process.exit(0);
