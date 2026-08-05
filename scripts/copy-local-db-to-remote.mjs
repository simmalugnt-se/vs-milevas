#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import dotenv from "dotenv";
import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const validTargets = new Set(["staging", "prod"]);
const suffixByEnv = {
  staging: "STAGING",
  prod: "PROD",
};

const localHosts = new Set(["127.0.0.1", "localhost", "host.docker.internal"]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  let to = "staging";
  let dryRun = false;
  let force = false;
  let confirm = "";
  let skipBackup = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

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

    if (arg === "--skip-backup") {
      skipBackup = true;
      continue;
    }
  }

  return { confirm, dryRun, force, skipBackup, to };
};

const run = (command, args, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "unknown"}`));
    });
  });

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
  const docker = spawnSync("docker", ["version"], { stdio: "ignore" });
  if (docker.status !== 0) {
    throw new Error("Docker is required. Install Docker Desktop and run again.");
  }

  const compose = spawnSync("docker", ["compose", "version"], { stdio: "ignore" });
  if (compose.status !== 0) {
    throw new Error(
      "Docker Compose is required. Install Docker Desktop / Docker Compose and run again.",
    );
  }
};

const parseLocalDirectUrl = (url) => {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URI_DIRECT is not a valid URL.");
  }

  if (!localHosts.has(parsed.hostname)) {
    throw new Error(
      `DATABASE_URI_DIRECT must target local host (${[...localHosts].join(", ")}). Received host: ${parsed.hostname}`,
    );
  }

  const database = parsed.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URI_DIRECT must include a database name.");
  }

  const username = decodeURIComponent(parsed.username || "");
  const password = decodeURIComponent(parsed.password || "");

  if (!username) {
    throw new Error("DATABASE_URI_DIRECT must include a username.");
  }

  return {
    database,
    password,
    username,
  };
};

const localExecArgs = ({ username, password, database }, sqlCommand) => [
  "compose",
  "exec",
  "-T",
  "-e",
  "PGHOST=127.0.0.1",
  "-e",
  "PGPORT=5432",
  "-e",
  `PGUSER=${username}`,
  "-e",
  `PGPASSWORD=${password}`,
  "-e",
  `PGDATABASE=${database}`,
  "postgres",
  "sh",
  "-lc",
  sqlCommand,
];

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

const assertOverwriteGuard = ({ confirm, force, to }) => {
  if (to === "prod") {
    if (!force || confirm !== "OVERWRITE_PROD") {
      throw new Error(
        "Refusing to overwrite production. Re-run with: --force --confirm OVERWRITE_PROD",
      );
    }

    return;
  }

  if (confirm !== "OVERWRITE_STAGING") {
    throw new Error("Refusing to overwrite staging. Re-run with: --confirm OVERWRITE_STAGING");
  }
};

const main = async () => {
  const { confirm, dryRun, force, skipBackup, to } = parseArgs();

  if (!validTargets.has(to)) {
    throw new Error(
      "Usage: node scripts/copy-local-db-to-remote.mjs --to <staging|prod> [--dry-run] [--skip-backup] [--confirm OVERWRITE_STAGING] [--force --confirm OVERWRITE_PROD]",
    );
  }

  assertOverwriteGuard({ confirm, force, to });

  const localDirectUrl = process.env.DATABASE_URI_DIRECT;
  if (!localDirectUrl) {
    throw new Error("Missing DATABASE_URI_DIRECT for local source.");
  }

  const local = parseLocalDirectUrl(localDirectUrl);
  const target = getDirectUrl(to);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tmpDir = path.resolve(process.cwd(), "tmp");
  const localDumpPath = path.join(tmpDir, `local-to-${to}-${timestamp}.dump`);
  const targetBackupPath = path.join(tmpDir, `${to}-before-local-sync-${timestamp}.dump`);

  if (dryRun) {
    console.log("[copy-db:local-to-remote] dry-run");
    console.log("[copy-db:local-to-remote] source key: DATABASE_URI_DIRECT (local)");
    console.log(`[copy-db:local-to-remote] target key: ${target.key}`);
    console.log(`[copy-db:local-to-remote] target host: ${getHost(target.value)}`);
    console.log(
      `[copy-db:local-to-remote] target backup: ${skipBackup ? "skipped" : targetBackupPath}`,
    );
    console.log(`[copy-db:local-to-remote] local dump file: ${localDumpPath}`);
    return;
  }

  ensureDocker();
  await mkdir(tmpDir, { recursive: true });

  console.log("[copy-db:local-to-remote] Ensuring local postgres container is running...");
  await run("docker", ["compose", "up", "-d", "postgres"]);

  if (!skipBackup) {
    console.log(`[copy-db:local-to-remote] Backing up target (${to}) -> ${targetBackupPath}`);
    await runCapture(
      "docker",
      [
        "run",
        "--rm",
        "-e",
        `DB_URL=${target.value}`,
        "postgres:17",
        "sh",
        "-lc",
        'pg_dump --no-owner --no-privileges --format=custom --dbname "$DB_URL"',
      ],
      targetBackupPath,
    );
  }

  console.log(`[copy-db:local-to-remote] Dumping local DB -> ${localDumpPath}`);
  await runCapture(
    "docker",
    localExecArgs(
      local,
      'pg_dump --no-owner --no-privileges --format=custom --dbname "$PGDATABASE"',
    ),
    localDumpPath,
  );

  console.log(`[copy-db:local-to-remote] Resetting ${to} public schema...`);
  await run("docker", [
    "run",
    "--rm",
    "-e",
    `DB_URL=${target.value}`,
    "postgres:17",
    "sh",
    "-lc",
    'psql --dbname "$DB_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"',
  ]);

  console.log(`[copy-db:local-to-remote] Restoring local DB into ${to} (destructive on target)...`);
  await runFromFile(
    "docker",
    [
      "run",
      "--rm",
      "-i",
      "-e",
      `DB_URL=${target.value}`,
      "postgres:17",
      "sh",
      "-lc",
      'pg_restore --no-owner --no-privileges --dbname "$DB_URL"',
    ],
    localDumpPath,
  );

  console.log("[copy-db:local-to-remote] Completed successfully.");
  if (!skipBackup) {
    console.log(`[copy-db:local-to-remote] target backup: ${targetBackupPath}`);
  }
  console.log(`[copy-db:local-to-remote] local dump: ${localDumpPath}`);
};

main().catch((error) => {
  console.error(`[copy-db:local-to-remote] ${error.message}`);
  process.exit(1);
});
