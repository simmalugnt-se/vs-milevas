#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import dotenv from "dotenv";
import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const validSources = new Set(["staging", "prod"]);
const sourceSuffix = {
  staging: "STAGING",
  prod: "PROD",
};
const remotePostgresImage = "postgres:18";

const localHosts = new Set(["127.0.0.1", "localhost", "host.docker.internal"]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  let from = "staging";
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--from") {
      from = (args[i + 1] || "").toLowerCase();
      i++;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
  }

  return { from, dryRun };
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

const ensureTools = () => {
  const docker = spawnSync("docker", ["compose", "version"], { stdio: "ignore" });
  if (docker.status !== 0) {
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

const main = async () => {
  const { from, dryRun } = parseArgs();

  if (!validSources.has(from)) {
    throw new Error("Usage: node scripts/copy-db-to-local.mjs --from <staging|prod> [--dry-run]");
  }

  const suffix = sourceSuffix[from];
  const sourceDirectUrl = process.env[`DATABASE_URI_DIRECT_${suffix}`];
  const localDirectUrl = process.env.DATABASE_URI_DIRECT;

  if (!localDirectUrl) {
    throw new Error("Missing DATABASE_URI_DIRECT for local target.");
  }

  if (!sourceDirectUrl) {
    throw new Error(`Missing DATABASE_URI_DIRECT_${suffix} for source environment.`);
  }

  const local = parseLocalDirectUrl(localDirectUrl);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tmpDir = path.resolve(process.cwd(), "tmp");
  const backupPath = path.join(tmpDir, `local-before-${from}-sync-${timestamp}.dump`);
  const sourcePath = path.join(tmpDir, `${from}-to-local-${timestamp}.dump`);

  if (dryRun) {
    console.log(`[copy-db] dry-run`);
    console.log(`[copy-db] source: DATABASE_URI_DIRECT_${suffix}`);
    console.log(`[copy-db] target: DATABASE_URI_DIRECT (local)`);
    console.log(`[copy-db] backup file: ${backupPath}`);
    console.log(`[copy-db] dump file: ${sourcePath}`);
    return;
  }

  ensureTools();

  await mkdir(tmpDir, { recursive: true });

  console.log("[copy-db] Ensuring local postgres container is running...");
  await run("docker", ["compose", "up", "-d", "postgres"]);

  console.log(`[copy-db] Backing up local DB -> ${backupPath}`);
  await runCapture(
    "docker",
    localExecArgs(
      local,
      'pg_dump --no-owner --no-privileges --format=custom --dbname "$PGDATABASE"',
    ),
    backupPath,
  );

  console.log(`[copy-db] Dumping ${from} DB -> ${sourcePath}`);
  await runCapture(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      `DB_URL=${sourceDirectUrl}`,
      remotePostgresImage,
      "sh",
      "-lc",
      'pg_dump --no-owner --no-privileges --format=custom --dbname "$DB_URL"',
    ],
    sourcePath,
  );

  console.log("[copy-db] Resetting local public schema...");
  await run(
    "docker",
    localExecArgs(
      local,
      'psql --dbname "$PGDATABASE" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"',
    ),
  );

  console.log("[copy-db] Restoring source dump into local DB...");
  await runFromFile(
    "docker",
    localExecArgs(local, 'pg_restore --no-owner --no-privileges --dbname "$PGDATABASE"'),
    sourcePath,
  );

  console.log("[copy-db] Verifying migration status...");
  await run("pnpm", ["db:migrate:status"]);

  console.log("[copy-db] Completed successfully.");
  console.log(`[copy-db] local backup: ${backupPath}`);
  console.log(`[copy-db] source dump: ${sourcePath}`);
};

main().catch((error) => {
  console.error(`[copy-db] ${error.message}`);
  process.exit(1);
});
