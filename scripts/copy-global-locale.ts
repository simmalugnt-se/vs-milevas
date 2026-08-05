#!/usr/bin/env node

/**
 * Copy Payload global content from one locale to another.
 *
 * Workaround for Payload "Copy to locale" on globals (globals[slug] lookup bug).
 *
 * Usage:
 *   pnpm cms:copy-global-locale
 *   pnpm cms:copy-global-locale -- --from en --to sv --globals header,footer
 *   pnpm cms:copy-global-locale -- --dry-run
 */

import type { Data, TypedLocale } from "payload";

const seedContext = { disableRevalidate: true };

type CliArgs = {
  dryRun: boolean;
  from: string;
  globals: string[];
  to: string;
};

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2);
  let from = "en";
  let to = "sv";
  let globals = ["header", "footer"];
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--from") {
      from = args[++i] ?? from;
      continue;
    }

    if (arg === "--to") {
      to = args[++i] ?? to;
      continue;
    }

    if (arg === "--globals") {
      globals = (args[++i] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { from, to, globals, dryRun };
};

const stripGlobalMeta = (doc: Data): Data => {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    globalType: _globalType,
    ...data
  } = doc;
  return data;
};

const main = async () => {
  const { from, to, globals, dryRun } = parseArgs();

  if (from === to) {
    throw new Error(`Source and target locale must differ (both "${from}").`);
  }

  const { default: config } = await import("@payload-config");
  const { getPayload } = await import("payload");
  const { importMap } = await import("../src/app/(payload)/importMap.js");

  const payload = await getPayload({ config, importMap });

  console.log(
    dryRun
      ? `[dry-run] Would copy globals ${globals.join(", ")} from "${from}" to "${to}"`
      : `Copying globals ${globals.join(", ")} from "${from}" to "${to}"…`,
  );

  for (const slug of globals) {
    const source = await payload.findGlobal({
      slug: slug as "header" | "footer",
      locale: from as TypedLocale,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });

    if (!source) {
      console.warn(`  ${slug}: no draft found for locale "${from}", skipping.`);
      continue;
    }

    const data = stripGlobalMeta(source);
    const fieldKeys = Object.keys(data).filter((key) => !key.startsWith("_"));

    if (dryRun) {
      console.log(`  ${slug}: would copy fields [${fieldKeys.join(", ")}]`);
      continue;
    }

    await payload.updateGlobal({
      slug: slug as "header" | "footer",
      locale: to as TypedLocale,
      data,
      draft: true,
      overrideAccess: true,
      context: seedContext,
    });

    console.log(`  ${slug}: copied (${fieldKeys.join(", ")}).`);
  }

  if (dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to apply.");
  } else {
    console.log(
      'Done. Open each global in Payload admin (locale "sv"), review the draft, then publish.',
    );
  }

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
