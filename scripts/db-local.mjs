#!/usr/bin/env node
/**
 * `pnpm db:local:up|down|reset`: Docker Compose with `.env.local`, so POSTGRES_HOST_PORT and
 * COMPOSE_PROJECT_NAME set there apply. Plain `docker compose` would only read `.env`.
 */
import { spawnSync } from "node:child_process";
import { composeEnvArgs } from "./lib/local-env.mjs";

const commands = {
  up: [["up", "-d", "postgres"]],
  down: [["down"]],
  reset: [
    ["down", "-v"],
    ["up", "-d", "postgres"],
  ],
};

const steps = commands[process.argv[2]];
if (!steps) {
  console.error("Usage: node scripts/db-local.mjs up|down|reset");
  process.exit(1);
}

for (const args of steps) {
  const result = spawnSync("docker", ["compose", ...composeEnvArgs(), ...args], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
