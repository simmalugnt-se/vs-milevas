#!/usr/bin/env node
/**
 * Robust local setup script for Payload boilerplates.
 *
 * Handles:
 *   - Docker installation detection
 *   - Docker daemon running check
 *   - Postgres container start + health wait
 *   - Baseline migration validation
 *   - Migration run with clear error messages
 *   - Schema mismatch detection
 *
 * Usage:
 *   node ./scripts/setup-local.mjs
 */

import { spawn, spawnSync } from "child_process";
import path from "path";

const PLATFORM = process.platform; // 'darwin', 'linux', 'win32'

/* ------------------------------------------------------------------ */
/*  ANSI helpers                                                       */
/* ------------------------------------------------------------------ */
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function info(msg) {
  console.log(`${C.blue}[setup-local]${C.reset} ${msg}`);
}
function success(msg) {
  console.log(`${C.green}[setup-local]${C.reset} ${C.bold}${msg}${C.reset}`);
}
function warn(msg) {
  console.log(`${C.yellow}[setup-local]${C.reset} ${msg}`);
}
function error(msg) {
  console.log(`${C.red}[setup-local]${C.reset} ${C.bold}${msg}${C.reset}`);
}
function logStep(n, title) {
  console.log(`\n${C.cyan}${C.bold}Step ${n}: ${title}${C.reset}`);
}

/* ------------------------------------------------------------------ */
/*  Docker helpers                                                     */
/* ------------------------------------------------------------------ */
function commandExists(cmd) {
  const result = spawnSync(cmd, ["--version"], { stdio: "pipe", shell: true });
  return result.status === 0;
}

function dockerDaemonRunning() {
  const result = spawnSync("docker", ["info"], { stdio: "pipe" });
  return result.status === 0;
}

function getDockerInstallGuide() {
  if (PLATFORM === "darwin") {
    return `
Docker Desktop is required on macOS.

1. Install Homebrew (if not already installed):
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

2. Install Docker Desktop:
   brew install --cask docker

3. Start Docker Desktop from Applications or run:
   open -a Docker

4. Wait for the whale icon in the menu bar to stop animating, then re-run:
   pnpm setup:local
`;
  }
  if (PLATFORM === "linux") {
    return `
Docker Engine is required.

Ubuntu/Debian:
   sudo apt-get update
   sudo apt-get install ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

Then start Docker:
   sudo systemctl start docker

And re-run:
   pnpm setup:local
`;
  }
  if (PLATFORM === "win32") {
    return `
Docker Desktop is required on Windows.

1. Download from: https://docs.docker.com/desktop/install/windows-install/
2. Run the installer and follow the WSL 2 backend setup if prompted.
3. Start Docker Desktop.
4. Re-run: pnpm setup:local
`;
  }
  return `
Please install Docker for your operating system:
https://docs.docker.com/get-docker/
`;
}

/* ------------------------------------------------------------------ */
/*  Spawn helpers                                                      */
/* ------------------------------------------------------------------ */
function run(command, args, env = process.env, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: opts.silent ? "pipe" : "inherit" });
    let stdout = "";
    let stderr = "";

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += String(data);
      });
    }
    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += String(data);
      });
    }

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || stdout || `${command} exited with ${code}`));
    });
  });
}

function runCapture(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const child = spawn(command, args, { env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (d) => chunks.push(d));
    child.stderr.on("data", (d) => chunks.push(d));
    child.on("error", reject);
    child.on("exit", (code) => {
      const output = Buffer.concat(chunks).toString();
      if (code === 0) resolve(output);
      else reject(new Error(output || `${command} exited with ${code}`));
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Health wait                                                        */
/* ------------------------------------------------------------------ */
async function waitForPostgres(timeoutMs = 60000) {
  const start = Date.now();
  const interval = 2000;

  while (Date.now() - start < timeoutMs) {
    try {
      const out = await runCapture("docker", ["compose", "ps", "--format", "json"]);
      const parsed = JSON.parse(out);
      // docker compose ps --format json returns a single object for one container,
      // or an array for multiple.
      const containers = Array.isArray(parsed) ? parsed : [parsed];
      const pg = containers.find((c) => c.Service === "postgres" || c.service === "postgres");
      if (pg && pg.Health === "healthy") return;
      if (pg && pg.health === "healthy") return;
      if (pg && pg.Status && pg.Status.includes("healthy")) return;
      if (pg && pg.status && pg.status.includes("healthy")) return;
    } catch {
      // container may not exist yet
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Postgres container did not become healthy within 60 seconds.");
}

/* ------------------------------------------------------------------ */
/*  Migration helpers                                                  */
/* ------------------------------------------------------------------ */
async function listMigrationFiles() {
  const migrationsDir = path.resolve(process.cwd(), "src/payload/migrations");
  try {
    const { readdir } = await import("fs/promises");
    const files = await readdir(migrationsDir);
    return files.filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("."));
  } catch {
    return [];
  }
}

async function migrationStatus() {
  try {
    const out = await runCapture("pnpm", ["exec", "payload", "migrate:status"], {
      ...process.env,
      NODE_OPTIONS: "--no-deprecation",
    });
    const lines = out.split("\n");
    const pending = lines.some((l) => l.includes("│") && l.includes(" No "));
    const none = lines.some((l) => l.toLowerCase().includes("no migrations"));
    return { text: out, pending, none };
  } catch (err) {
    return { text: String(err), pending: false, none: true, error: true };
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
async function main() {
  console.log(`${C.bold}${C.cyan}
╔══════════════════════════════════════════════════════════════════╗
║  Payload Boilerplate — Local Setup                               ║
╚══════════════════════════════════════════════════════════════════╝${C.reset}\n`);

  /* Step 1 — Docker install */
  logStep(1, "Check Docker installation");
  if (!commandExists("docker")) {
    error("Docker is not installed.");
    console.log(getDockerInstallGuide());
    process.exit(1);
  }
  success("Docker CLI found.");

  if (!commandExists("docker compose")) {
    error("Docker Compose plugin is not available.");
    console.log(`
Docker Compose is required. It is included with Docker Desktop (macOS/Windows)
and with the docker-ce package on Linux (docker-compose-plugin).

Update Docker or install the plugin, then re-run:
  pnpm setup:local
`);
    process.exit(1);
  }
  success("Docker Compose plugin found.");

  /* Step 2 — Docker daemon */
  logStep(2, "Check Docker daemon");
  if (!dockerDaemonRunning()) {
    error("Docker daemon is not running.");
    if (PLATFORM === "darwin") {
      console.log(`
Start Docker Desktop:
   open -a Docker

Wait for the whale icon in the menu bar to stop animating, then re-run:
   pnpm setup:local
`);
    } else if (PLATFORM === "linux") {
      console.log(`
Start Docker:
   sudo systemctl start docker

Then re-run:
   pnpm setup:local
`);
    } else {
      console.log(`
Start Docker Desktop, then re-run:
   pnpm setup:local
`);
    }
    process.exit(1);
  }
  success("Docker daemon is running.");

  /* Step 3 — Start Postgres */
  logStep(3, "Start Postgres container");
  try {
    info("Starting postgres with docker compose...");
    await run("docker", ["compose", "up", "-d", "postgres"]);
  } catch (err) {
    error("Failed to start Postgres container.");
    console.log(`\nDocker Compose error: ${err.message}\n`);
    console.log(`Common fixes:
  - Port conflict: make sure port ${process.env.POSTGRES_HOST_PORT || "5434/5435"} is not in use by another Postgres instance.
  - Permission denied: ensure your user is in the 'docker' group or use sudo.
  - Corrupt volume: reset with 'pnpm db:local:reset' then try again.
`);
    process.exit(1);
  }

  /* Step 4 — Wait for health */
  logStep(4, "Wait for Postgres to be healthy");
  try {
    await waitForPostgres(60000);
    success("Postgres is healthy.");
  } catch (err) {
    error(err.message);
    console.log(`
The Postgres container started but did not pass its health check.

Check the logs:
   docker compose logs postgres

Common fixes:
  - If the container keeps restarting, reset the volume:
      pnpm db:local:reset
  - If the port is already in use, change POSTGRES_HOST_PORT in .env.local
`);
    process.exit(1);
  }

  /* Step 5 — Verify baseline migrations exist */
  logStep(5, "Check baseline migrations");
  const migrationFiles = await listMigrationFiles();
  if (migrationFiles.length === 0) {
    warn("No baseline migration files found in src/payload/migrations/");
    console.log(`
This boilerplate requires a baseline migration. If this is a fresh clone,
the migrations may be missing from the repo.

If you are a maintainer, generate one with:
   1. pnpm db:local:reset
   2. pnpm exec payload migrate:create
   3. pnpm db:migrate

Then commit the generated files in src/payload/migrations/.
`);
    process.exit(1);
  }
  info(`Found ${migrationFiles.length} migration file(s): ${migrationFiles.join(", ")}`);

  /* Step 6 — Run migrations */
  logStep(6, "Run Payload migrations");
  info("Running: pnpm db:migrate");
  try {
    await run("pnpm", ["db:migrate"], { ...process.env, NODE_OPTIONS: "--no-deprecation" });
  } catch (err) {
    error("Migration failed.");
    console.log(`\nError: ${err.message}\n`);

    const msg = err.message.toLowerCase();
    if (msg.includes("connect econnrefused") || msg.includes("cannot connect to postgres")) {
      console.log(`The database was reachable earlier but is now refusing connections.

Fixes:
  - Check if the container crashed: docker compose ps
  - Restart: pnpm db:local:reset && pnpm setup:local
`);
    } else if (msg.includes("column") && msg.includes("does not exist")) {
      console.log(`Schema mismatch detected. The migration files do not match the current code schema.

This usually happens when:
  - The baseline migration was generated before a schema change (e.g. blocksAsJSON: true)
  - You switched branches with different schemas

Fix:
  1. Reset the database:
       pnpm db:local:reset
  2. Delete old migration files (keep index.ts):
       rm src/payload/migrations/YYYY*.ts src/payload/migrations/YYYY*.json
  3. Generate a fresh baseline:
       pnpm exec payload migrate:create
  4. Apply it:
       pnpm db:migrate
  5. Commit the new migration files.
`);
    } else if (msg.includes("already exists") || msg.includes("duplicate")) {
      console.log(`Some tables already exist. The database may have been partially migrated.

Fix:
  - Reset and start fresh:
       pnpm db:local:reset && pnpm setup:local
`);
    } else if (msg.includes("permission") || msg.includes("access denied")) {
      console.log(`Permission denied when connecting to Postgres.

Fixes:
  - Check DATABASE_URI / DATABASE_URI_DIRECT in .env.local
  - Ensure the username/password match docker-compose.yml (default: payload/payload)
`);
    } else {
      console.log(`Generic migration error. Common fixes:
  - Check .env.local DATABASE_URI points at the right host/port
  - Ensure DATABASE_URI_DIRECT is set (required for migrate scripts)
  - Try: pnpm db:local:reset && pnpm setup:local
`);
    }
    process.exit(1);
  }

  /* Step 7 — Verify */
  logStep(7, "Verify migration status");
  const status = await migrationStatus();
  if (status.error) {
    warn("Could not verify migration status, but migrations reported success.");
  } else if (status.pending) {
    warn("Some migrations are still pending.");
    console.log(`Run manually: pnpm db:migrate\n`);
    process.exit(1);
  } else {
    success("All migrations applied successfully.");
  }

  /* Done */
  console.log(`\n${C.green}${C.bold}Setup complete!${C.reset}\n`);
  console.log(`Next steps:
  - Start dev server:  ${C.bold}pnpm dev${C.reset}
  - Open admin:        ${C.bold}http://localhost:3000/admin${C.reset}
  - The first user can be created at the admin login screen.
`);
}

main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
