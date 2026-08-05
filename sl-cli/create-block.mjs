#!/usr/bin/env node
/*
  sl-create block generator
  Usage:
    - pnpm run sl-create:block BlockName
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createBlockComponentTsx,
  createBlockConfigTs,
  getPaths,
  parseNameFromArgs,
  runGenerateTypes,
  safeName,
  toLowerCamelCase,
  toPascalCase,
} from "./utils.mjs";

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExactLine(content, line) {
  const exactLine = line.trim();
  const linePattern = new RegExp(`^\\s*${escapeRegExp(exactLine)}\\s*$`, "m");
  return linePattern.test(content);
}

function hasObjectKey(content, key) {
  const keyPattern = new RegExp(`^\\s*['"]?${escapeRegExp(key)}['"]?\\s*:`, "m");
  return keyPattern.test(content);
}

function toObjectKey(key) {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return key;
  }

  return `'${key}'`;
}

function insertBeforeMarker(content, marker, line, indent = "") {
  const markerPattern = new RegExp(`^\\s*${escapeRegExp(marker)}\\s*$`, "m");
  if (!markerPattern.test(content) || hasExactLine(content, line)) {
    return content;
  }

  return content.replace(markerPattern, `${indent}${line.trim()}\n$&`);
}

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-b" });
  if (help) {
    console.log("Usage: pnpm run sl-create:block BlockName (not sl-create:b)");
    process.exit(0);
  }

  if (!name) {
    console.error(
      "Error: Missing block name. Use: pnpm run sl-create:block BlockName (not sl-create:b)",
    );
    process.exit(1);
  }

  const safe = safeName(name);
  if (!safe) {
    console.error("Error: Invalid block name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(safe) || "Block";
  const slug = toLowerCamelCase(exportConstName);
  const interfaceName = `${exportConstName}Block`;
  const blockName = `${exportConstName}Block`;
  const componentName = `${exportConstName}BlockComponent`;

  const { blocksDir } = getPaths();
  const newDir = resolve(blocksDir, safe);
  if (existsSync(newDir)) {
    console.error(`Error: Block folder already exists at ${newDir}`);
    process.exit(1);
  }
  mkdirSync(newDir, { recursive: true });

  const configPath = resolve(newDir, "config.ts");
  const componentPath = resolve(newDir, "Component.tsx");
  const blocksIndexPath = resolve(blocksDir, "definitions.ts");

  writeFileSync(configPath, createBlockConfigTs(slug, interfaceName, exportConstName), "utf8");
  writeFileSync(
    componentPath,
    createBlockComponentTsx(componentName, interfaceName, slug, exportConstName),
    "utf8",
  );

  try {
    let current = readFileSync(blocksIndexPath, "utf8");
    const original = current;

    const componentImportLine = `import { ${componentName} } from "./${safe}/Component"`;
    current = insertBeforeMarker(
      current,
      "// sl-cli:block-component-imports (do not remove)",
      componentImportLine,
    );

    const configImportLine = `import { ${blockName} } from "./${safe}/config"`;
    current = insertBeforeMarker(
      current,
      "// sl-cli:block-config-imports (do not remove)",
      configImportLine,
    );

    const layoutEntry = `${blockName},`;
    current = insertBeforeMarker(
      current,
      "// sl-cli:layout-blocks (do not remove)",
      layoutEntry,
      "  ",
    );

    if (!hasObjectKey(current, slug)) {
      const mapEntry = `  ${toObjectKey(slug)}: renderTypedBlock("${slug}", ({ block }) => ${componentName}({ block })),`;
      current = insertBeforeMarker(
        current,
        "// sl-cli:block-components-map (do not remove)",
        mapEntry,
      );
    }

    if (current !== original) {
      writeFileSync(blocksIndexPath, current, "utf8");
    }
  } catch (e) {
    console.warn("Warning: Could not update blocks/definitions.ts automatically:", e?.message || e);
  }

  runGenerateTypes(getPaths().root);

  console.log(`\nCreated block:`);
  console.log(`- ${configPath}`);
  console.log(`- ${componentPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
