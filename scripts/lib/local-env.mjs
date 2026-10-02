/**
 * `.env.local` helpers shared by the local setup scripts.
 *
 * Docker Compose only reads `.env` and the shell for `${VAR}` substitution, while Next and Payload
 * read `.env.local`. The scripts pass `--env-file .env.local` to Compose so one file drives both.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";

export const ENV_LOCAL = path.resolve(process.cwd(), ".env.local");
export const ENV_EXAMPLE = path.resolve(process.cwd(), ".env.example");
export const DEFAULT_POSTGRES_PORT = 5434;

/** Creates `.env.local` from `.env.example` when it does not exist. Returns true if created. */
export function ensureEnvLocal() {
  if (existsSync(ENV_LOCAL)) {
    return false;
  }
  copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
  return true;
}

/** Active `KEY=value` lines of an env file; commented lines are ignored. */
export function readEnv(file = ENV_LOCAL) {
  if (!existsSync(file)) {
    return {};
  }
  const values = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match) {
      values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return values;
}

/**
 * Sets keys in an env file: replaces an existing `KEY=` line (or a commented `# KEY=` line) in
 * place, and appends keys that are not there. Other lines and comments stay as they are.
 */
export function writeEnv(values, file = ENV_LOCAL) {
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n") : [];
  const pending = new Map(Object.entries(values));
  for (let i = 0; i < lines.length; i++) {
    const match = /^\s*#?\s*([A-Z0-9_]+)\s*=/.exec(lines[i]);
    if (match && pending.has(match[1])) {
      lines[i] = `${match[1]}=${pending.get(match[1])}`;
      pending.delete(match[1]);
    }
  }
  if (pending.size > 0) {
    if (lines.length > 0 && lines.at(-1) !== "") {
      lines.push("");
    }
    for (const [key, value] of pending) {
      lines.push(`${key}=${value}`);
    }
    lines.push("");
  }
  writeFileSync(file, lines.join("\n"));
}

/** Arguments that make Docker Compose read `.env.local` when it exists. */
export function composeEnvArgs() {
  return existsSync(ENV_LOCAL) ? ["--env-file", ENV_LOCAL] : [];
}

/**
 * Whether something on this machine already uses the port. Two checks, because on macOS a port
 * Docker publishes on 0.0.0.0 can still be bound on 127.0.0.1: something answers on it, or it
 * cannot be bound on every address.
 */
export async function portInUse(port) {
  return (await answers(port)) || !(await canBind(port));
}

function answers(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

/** The first free port from `start`, trying up to 50. */
export async function findFreePort(start = DEFAULT_POSTGRES_PORT) {
  for (let port = start; port < start + 50; port++) {
    if (!(await portInUse(port))) {
      return port;
    }
  }
  throw new Error(`No free port between ${start} and ${start + 49}.`);
}

/** Replaces the port of a connection string that points at this machine; others are untouched. */
export function withLocalPort(url, port) {
  if (!url) {
    return url;
  }
  return url.replace(/@(127\.0\.0\.1|localhost):\d+\//, `@$1:${port}/`);
}
