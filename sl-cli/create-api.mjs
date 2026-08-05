#!/usr/bin/env node
/*
  sl-create API route generator
  Usage:
    - npm run sl-create:api RouteName
    - npm run sl-create -a RouteName
*/

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createApiRouteTs, getApiPaths, parseNameFromArgs, safeName } from "./utils.mjs";

async function main() {
  const { help, name } = parseNameFromArgs({ flag: "-a" });
  if (help) {
    console.log("Usage: npm run sl-create:api RouteName");
    console.log("Example: npm run sl-create:api my-endpoint");
    process.exit(0);
  }

  if (!name) {
    console.error("Error: Missing API route name. Use: npm run sl-create:api RouteName");
    process.exit(1);
  }

  const safe = safeName(name);
  if (!safe) {
    console.error("Error: Invalid API route name.");
    process.exit(1);
  }

  // Use lowercase with hyphens for API route folders (REST convention)
  const routeName = safe.toLowerCase();

  const { apiDir } = getApiPaths();
  const newRouteDir = resolve(apiDir, routeName);
  if (existsSync(newRouteDir)) {
    console.error(`Error: API route folder already exists at ${newRouteDir}`);
    process.exit(1);
  }

  mkdirSync(newRouteDir, { recursive: true });
  const routePath = resolve(newRouteDir, "route.ts");
  writeFileSync(routePath, createApiRouteTs(routeName), "utf8");

  console.log(`\nCreated API route:`);
  console.log(`- ${routePath}`);
  console.log(`\nYour API endpoint will be accessible at:`);
  console.log(`  /routes/${routeName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
