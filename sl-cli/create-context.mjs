#!/usr/bin/env node
/*
  sl-create context generator
  Usage:
    - npm run sl-create:x MyContext
    - npm run sl-create -x MyContext
    - npm run sl-create MyContext
*/

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createContextIndexTsx,
  getPaths,
  parseNameFromArgs,
  safeName,
  toPascalCase,
} from "./utils.mjs";

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-x" });
  if (help) {
    console.log("Usage: npm run sl-create:x MyContext");
    process.exit(0);
  }

  if (!name) {
    console.error(
      "Error: Missing context name. Use the dedicated script: npm run sl-create:x MyContext",
    );
    process.exit(1);
  }

  const safe = safeName(name);
  if (!safe) {
    console.error("Error: Invalid context name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(safe) || "App";

  const { contextsDir } = getPaths();
  const newCtxDir = resolve(contextsDir, exportConstName);
  if (existsSync(newCtxDir)) {
    console.error(`Error: Context folder already exists at ${newCtxDir}`);
    process.exit(1);
  }
  mkdirSync(newCtxDir, { recursive: true });
  const indexPath = resolve(newCtxDir, "index.tsx");
  writeFileSync(indexPath, createContextIndexTsx(exportConstName), "utf8");
  console.log(`\nCreated context:`);
  console.log(`- ${indexPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
