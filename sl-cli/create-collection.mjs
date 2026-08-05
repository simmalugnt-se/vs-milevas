#!/usr/bin/env node
/*
  sl-create collection generator
  Usage:
    - pnpm run sl-create:collection CollectionName
*/

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getPaths,
  parseNameFromArgs,
  runGenerateTypes,
  safeName,
  toLowerCamelCase,
  toPascalCase,
} from "./utils.mjs";

function singularizePascal(pascalName) {
  const lower = pascalName.toLowerCase();
  if (lower === "news" || lower === "series" || lower === "species") return pascalName;
  if (pascalName.endsWith("ies")) return pascalName.slice(0, -3) + "y";
  if (pascalName.endsWith("s")) return pascalName.slice(0, -1);
  return pascalName;
}

function pluralizeLabel(pascalName) {
  const lower = pascalName.toLowerCase();
  if (lower === "news" || lower === "series" || lower === "species") return pascalName;
  if (pascalName.endsWith("y")) return pascalName.slice(0, -1) + "ies";
  if (pascalName.endsWith("s")) return pascalName;
  return `${pascalName}s`;
}

function createCollectionRevalidateHookTs(exportConstName, slug) {
  const singularPascal = singularizePascal(exportConstName);

  return `import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath, revalidateTag } from "next/cache"

import type { ${singularPascal} } from "@/payload-types"

function entryPath(itemSlug: string | null | undefined): string {
  if (!itemSlug) {
    return "/"
  }

  return \`/${slug}/\${itemSlug}\`
}

export const revalidateCollection: CollectionAfterChangeHook<${singularPascal}> = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (context?.disableRevalidate) {
    return doc
  }

  if (doc._status === "published" && doc.slug) {
    revalidatePath(entryPath(doc.slug))
    revalidateTag("${slug}", "max")
    revalidateTag(\`collection:${slug}:\${doc.slug}\`, "max")
  }

  if (
    previousDoc?._status === "published" &&
    doc._status !== "published" &&
    previousDoc.slug
  ) {
    revalidatePath(entryPath(previousDoc.slug))
    revalidateTag("${slug}", "max")
  }

  if (
    doc._status === "published" &&
    previousDoc?._status === "published" &&
    previousDoc.slug &&
    doc.slug &&
    previousDoc.slug !== doc.slug
  ) {
    revalidatePath(entryPath(previousDoc.slug))
    revalidateTag(\`collection:${slug}:\${previousDoc.slug}\`, "max")
  }

  return doc
}

export const revalidateCollectionDelete: CollectionAfterDeleteHook<${singularPascal}> = ({
  doc,
  req: { context },
}) => {
  if (context?.disableRevalidate || !doc?.slug) {
    return doc
  }

  revalidatePath(entryPath(doc.slug))
  revalidateTag("${slug}", "max")
  revalidateTag(\`collection:${slug}:\${doc.slug}\`, "max")

  return doc
}
`;
}

function createCollectionConfigTs(exportConstName, slug) {
  const singularPascal = singularizePascal(exportConstName);
  const collectionLabelSingular = singularPascal;
  let collectionLabelPlural = pluralizeLabel(singularPascal);

  if (exportConstName === "Jury" || exportConstName === "Team") {
    collectionLabelPlural = singularPascal;
  }

  return `import type { CollectionConfig } from "payload"

import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts"
import { isAuthenticated } from "../../access/isAuthenticated.ts"
import { slugField } from "../../fields/slug.ts"
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts"
import { revalidateCollection, revalidateCollectionDelete } from "./hooks/revalidate.ts"

export const ${exportConstName}: CollectionConfig = {
  slug: "${slug}",
  labels: {
    singular: "${collectionLabelSingular}",
    plural: "${collectionLabelPlural}",
  },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 500,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
`;
}

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "" });
  if (help) {
    console.log("Usage: pnpm run sl-create:collection CollectionName");
    process.exit(0);
  }

  if (!name) {
    console.error(
      "Error: Missing collection name. Use the dedicated script: pnpm run sl-create:collection CollectionName",
    );
    process.exit(1);
  }

  const cleaned = safeName(name);
  if (!cleaned) {
    console.error("Error: Invalid collection name.");
    process.exit(1);
  }

  const exportConstName = toPascalCase(cleaned);
  const slug = toLowerCamelCase(exportConstName);

  const { collectionsDir } = getPaths();
  const newDir = resolve(collectionsDir, exportConstName);
  if (existsSync(newDir)) {
    console.error(`Error: Collection folder already exists at ${newDir}`);
    process.exit(1);
  }
  mkdirSync(resolve(newDir, "hooks"), { recursive: true });

  const configPath = resolve(newDir, "config.ts");
  const hookPath = resolve(newDir, "hooks/revalidate.ts");

  writeFileSync(hookPath, createCollectionRevalidateHookTs(exportConstName, slug), "utf8");
  writeFileSync(configPath, createCollectionConfigTs(exportConstName, slug), "utf8");

  const registryPath = resolve(collectionsDir, "registry.ts");
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
    console.warn("Warning: Could not update registry.ts automatically:", e?.message || e);
  }

  runGenerateTypes(getPaths().root);

  console.log(`\nCreated collection:`);
  console.log(`- ${configPath}`);
  console.log(`- ${hookPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
