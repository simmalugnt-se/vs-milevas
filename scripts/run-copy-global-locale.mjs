#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });
const pnpmDir = path.join(root, "node_modules", ".pnpm");

const tsxPackageDir = readdirSync(pnpmDir)
  .filter((name) => name.startsWith("tsx@"))
  .map((name) => path.join(pnpmDir, name, "node_modules", "tsx"))
  .find((candidate) => {
    try {
      return readdirSync(path.join(candidate, "dist", "esm", "api")).includes("index.mjs");
    } catch {
      return false;
    }
  });

if (!tsxPackageDir) {
  console.error("Could not find tsx in node_modules/.pnpm. Run pnpm install.");
  process.exit(1);
}

const { tsImport } = await import(
  pathToFileURL(path.join(tsxPackageDir, "dist/esm/api/index.mjs")).href
);

await tsImport("./copy-global-locale.ts", import.meta.url);
