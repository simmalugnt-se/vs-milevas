#!/usr/bin/env node
/*
  sl-create component generator
  Usage:
    - npm run sl-create:c ComponentName
    - npm run sl-create -c ComponentName
    - npm run sl-create ComponentName
*/

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createGenericComponentIndexTsx,
  getPaths,
  parseNameFromArgs,
  safeName,
  toPascalCase,
} from "./utils.mjs";

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-c" });
  if (help) {
    console.log("Usage: npm run sl-create:c ComponentName");
    process.exit(0);
  }

  if (!name) {
    console.error(
      "Error: Missing component name. Use the dedicated script: npm run sl-create:c ComponentName",
    );
    process.exit(1);
  }

  const safe = safeName(name);
  if (!safe) {
    console.error("Error: Invalid component name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(safe) || "Component";

  const { componentsDir } = getPaths();
  const newCompDir = resolve(componentsDir, exportConstName);
  if (existsSync(newCompDir)) {
    console.error(`Error: Component folder already exists at ${newCompDir}`);
    process.exit(1);
  }
  mkdirSync(newCompDir, { recursive: true });
  const indexPath = resolve(newCompDir, "index.tsx");
  writeFileSync(indexPath, createGenericComponentIndexTsx(exportConstName), "utf8");
  console.log(`\nCreated component:`);
  console.log(`- ${indexPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
