#!/usr/bin/env node
/*
  sl-create global generator
  Usage:
    - pnpm run sl-create:global GlobalName
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createUiWrapper,
  getPaths,
  parseNameFromArgs,
  runGenerateTypes,
  safeName,
  toLowerCamelCase,
  toPascalCase,
} from "./utils.mjs";

function createGlobalRevalidateHookTs(slug) {
  return `import { revalidateTag } from "next/cache"
import type { GlobalAfterChangeHook } from "payload"

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  const isPublished = (value) =>
    !value ||
    typeof value !== "object" ||
    !("_status" in value) ||
    value._status === "published"

  if (!context?.disableRevalidate && (isPublished(doc) || isPublished(previousDoc))) {
    revalidateTag("global:${slug}", "max")
  }

  return doc
}
`;
}

function createGlobalConfigTs(exportConstName, slug) {
  return `import type { GlobalConfig } from "payload"

import { revalidateGlobal } from "./hooks/revalidate"

export const ${exportConstName}: GlobalConfig = {
  slug: "${slug}",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
      schedulePublish: true,
    },
    max: 50,
  },
}
`;
}

function createGlobalComponentTsx(exportConstName) {
  const propsName = `${exportConstName}ComponentProps`;
  const body = createUiWrapper(`Global: ${exportConstName}`, "{data.title}");

  return `import type { ${exportConstName} } from "@/payload-types"

type ${propsName} = {
  data: ${exportConstName}
}

export function ${exportConstName}Component({ data }: ${propsName}) {
  return (
    <section>
${body}
    </section>
  )
}
`;
}

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-g" });
  if (help) {
    console.log("Usage: pnpm run sl-create:global GlobalName");
    process.exit(0);
  }

  if (!name) {
    console.error("Error: Missing global name. Use: pnpm run sl-create:global GlobalName");
    process.exit(1);
  }

  const cleaned = safeName(name);
  if (!cleaned) {
    console.error("Error: Invalid global name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(cleaned);
  const slug = toLowerCamelCase(exportConstName);

  const { globalsDir } = getPaths();
  const newDir = resolve(globalsDir, exportConstName);
  if (existsSync(newDir)) {
    console.error(`Error: Global folder already exists at ${newDir}`);
    process.exit(1);
  }
  mkdirSync(resolve(newDir, "hooks"), { recursive: true });

  const configPath = resolve(newDir, "config.ts");
  const componentPath = resolve(newDir, "Component.tsx");
  const hookPath = resolve(newDir, "hooks/revalidate.ts");

  writeFileSync(hookPath, createGlobalRevalidateHookTs(slug), "utf8");
  writeFileSync(configPath, createGlobalConfigTs(exportConstName, slug), "utf8");
  writeFileSync(componentPath, createGlobalComponentTsx(exportConstName), "utf8");

  const registryPath = resolve(globalsDir, "registry.ts");
  try {
    let current = readFileSync(registryPath, "utf8");

    const importLine = `import { ${exportConstName} } from "./${exportConstName}/config.ts"\n`;
    if (!current.includes(importLine.trim())) {
      current = current.replace(/\/\/ sl-cli:imports \(do not remove\)\n/, (m) => m + importLine);
    }

    const arrayEntry = `  ${exportConstName},\n`;
    if (!current.includes(arrayEntry.trim())) {
      current = current.replace(/\/\/ sl-cli:array \(do not remove\)\n/, (m) => m + arrayEntry);
    }

    writeFileSync(registryPath, current, "utf8");
  } catch (e) {
    console.warn("Warning: Could not update globals registry.ts automatically:", e?.message || e);
  }

  runGenerateTypes(getPaths().root);

  console.log(`\nCreated global:`);
  console.log(`- ${configPath}`);
  console.log(`- ${componentPath}`);
  console.log(`- ${hookPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
