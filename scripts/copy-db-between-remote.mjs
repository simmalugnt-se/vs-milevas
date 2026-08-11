#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import dotenv from "dotenv";
import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const validEnvs = new Set(["staging", "prod"]);
const suffixByEnv = {
  staging: "STAGING",
  prod: "PROD",
};
const remotePostgresImage = "postgres:18";

const parseArgs = () => {
  const args = process.argv.slice(2);
  let from = "";
  let to = "";
  let dryRun = false;
  let force = false;
  let confirm = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--from") {
      from = (args[i + 1] || "").toLowerCase();
      i++;
      continue;
    }

    if (arg === "--to") {
      to = (args[i + 1] || "").toLowerCase();
      i++;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--force") {
      force = true;
      continue;
    }

    if (arg === "--confirm") {
      confirm = args[i + 1] || "";
      i++;
      continue;
    }
  }

  return { from, to, dryRun, force, confirm };
};

const runCapture = (command, args, outputFile, env = process.env) =>
  new Promise((resolve, reject) => {
    const output = createWriteStream(outputFile);
    const child = spawn(command, args, { env, stdio: ["ignore", "pipe", "inherit"] });
    child.stdout.pipe(output);

    child.on("error", reject);
    child.on("exit", (code) => {
      output.end();
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "unknown"}`));
    });
  });

const runFromFile = (command, args, inputFile, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ["pipe", "inherit", "inherit"] });
    const input = createReadStream(inputFile);
    input.pipe(child.stdin);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "unknown"}`));
    });
  });

const ensureDocker = () => {
  const check = spawnSync("docker", ["version"], { stdio: "ignore" });
  if (check.status !== 0) {
    throw new Error("Docker is required. Install Docker Desktop and run again.");
  }
};

const getDirectUrl = (envName) => {
  const suffix = suffixByEnv[envName];
  const key = `DATABASE_URI_DIRECT_${suffix}`;
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key}.`);
  }

  return { key, value };
};

const getHost = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch {
    return "invalid-url";
  }
};

const main = async () => {
  const { from, to, dryRun, force, confirm } = parseArgs();

  if (!validEnvs.has(from) || !validEnvs.has(to) || from === to) {
    throw new Error(
      "Usage: node scripts/copy-db-between-remote.mjs --from <staging|prod> --to <staging|prod> [--dry-run] [--force --confirm OVERWRITE_PROD]",
    );
  }

  if (to === "prod") {
    if (!force || confirm !== "OVERWRITE_PROD") {
      throw new Error(
        "Refusing to overwrite production. Re-run with: --force --confirm OVERWRITE_PROD",
      );
    }
  }

  const source = getDirectUrl(from);
  const target = getDirectUrl(to);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tmpDir = path.resolve(process.cwd(), "tmp");
  const targetBackupPath = path.join(tmpDir, `${to}-before-${from}-sync-${timestamp}.dump`);
  const sourceDumpPath = path.join(tmpDir, `${from}-to-${to}-${timestamp}.dump`);

  if (dryRun) {
    console.log("[copy-db:remote] dry-run");
    console.log(`[copy-db:remote] source key: ${source.key}`);
    console.log(`[copy-db:remote] target key: ${target.key}`);
    console.log(`[copy-db:remote] source host: ${getHost(source.value)}`);
    console.log(`[copy-db:remote] target host: ${getHost(target.value)}`);
    console.log(`[copy-db:remote] target backup file: ${targetBackupPath}`);
    console.log(`[copy-db:remote] source dump file: ${sourceDumpPath}`);
    if (to === "prod") {
      console.log("[copy-db:remote] production overwrite guard satisfied in dry-run mode.");
    }
    return;
  }

  ensureDocker();
  await mkdir(tmpDir, { recursive: true });

  console.log(`[copy-db:remote] Backing up target (${to}) -> ${targetBackupPath}`);
  await runCapture(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      `DB_URL=${target.value}`,
      remotePostgresImage,
      "sh",
      "-lc",
      'pg_dump --no-owner --no-privileges --format=custom --dbname "$DB_URL"',
    ],
    targetBackupPath,
  );

  console.log(`[copy-db:remote] Dumping source (${from}) -> ${sourceDumpPath}`);
  await runCapture(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      `DB_URL=${source.value}`,
      remotePostgresImage,
      "sh",
      "-lc",
      'pg_dump --no-owner --no-privileges --format=custom --dbname "$DB_URL"',
    ],
    sourceDumpPath,
  );

  console.log(`[copy-db:remote] Restoring ${from} into ${to} (destructive on target)...`);
  await runFromFile(
    "docker",
    [
      "run",
      "--rm",
      "-i",
      "-e",
      `DB_URL=${target.value}`,
      remotePostgresImage,
      "sh",
      "-lc",
      'pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$DB_URL"',
    ],
    sourceDumpPath,
  );

  console.log("[copy-db:remote] Completed successfully.");
  console.log(`[copy-db:remote] target backup: ${targetBackupPath}`);
  console.log(`[copy-db:remote] source dump: ${sourceDumpPath}`);
};

main().catch((error) => {
  console.error(`[copy-db:remote] ${error.message}`);
  process.exit(1);
});
