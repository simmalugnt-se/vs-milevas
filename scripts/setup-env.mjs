/**
 * Helpers for `pnpm setup` (scripts/setup.mjs): preparing `.env.local`, checking the cloud values
 * pasted from Neon (or R2) and the environment for the migration. Kept free of prompts so the
 * tests can call them directly.
 */
import { randomBytes } from "node:crypto";
import { chmodSync, copyFileSync, existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parse } from "dotenv";
import { storageKind } from "../src/utilities/services.mjs";
import { ENV_LOCAL, ensureEnvLocal, writeEnv } from "./lib/local-env.mjs";

export const BACKUP = `${ENV_LOCAL}.setup-backup`;

/** `.env.local` as the app reads it (quotes removed; for a repeated key the last one counts). */
export function readEnvFile() {
  return existsSync(ENV_LOCAL) ? parse(readFileSync(ENV_LOCAL)) : {};
}

/** Creates `.env.local` from `.env.example` if missing and replaces placeholder secrets. */
export function ensureEnvFile() {
  ensureEnvLocal();
  chmodSync(ENV_LOCAL, 0o600);
  const values = readEnvFile();
  for (const [key, placeholder] of [
    ["PAYLOAD_SECRET", "your-secret-here"],
    ["PREVIEW_SECRET", "your-preview-secret"],
  ]) {
    if (!values[key] || values[key] === placeholder) {
      writeEnv({ [key]: randomBytes(32).toString("hex") });
    }
  }
}

/**
 * Keeps one backup of `.env.local` before the guide changes it, replaced on each run so copies
 * of the secrets do not pile up. Returns whether there was a file to back up.
 */
export function backupEnvFile() {
  if (!existsSync(ENV_LOCAL)) return false;
  copyFileSync(ENV_LOCAL, BACKUP);
  chmodSync(BACKUP, 0o600);
  return true;
}

/** Characters that change meaning in `.env.local` (comments, `$` expansion, quoting). */
export function unsafeEnvValue(value) {
  return /[\s#$"'\\]/.test(value);
}

/** @param {string | undefined} value */
function parseUrl(value) {
  try {
    return value ? new URL(value) : null;
  } catch {
    return null;
  }
}

/**
 * Checks the cloud values in `.env.local` for `SERVICES=cloud`: the Neon database, and files in
 * Neon or in Cloudflare R2. Returns what is missing or wrong, in plain words, and a short
 * description of what was found.
 * @param {Record<string, string>} env
 * @param {"neon" | "r2"} files
 */
export function checkCloudValues(env, files) {
  const problems = [];
  const direct = parseUrl(env.DATABASE_URL);
  const pooled = parseUrl(env.DATABASE_URL_POOLED);
  if (!env.DATABASE_URL) {
    problems.push("DATABASE_URL is missing.");
  } else if (!direct || !["postgres:", "postgresql:"].includes(direct.protocol)) {
    problems.push("DATABASE_URL is not a database connection string (postgresql://…).");
  } else if (direct.hostname.includes("-pooler.")) {
    problems.push("DATABASE_URL should be the direct connection, without -pooler in the address.");
  }
  if (env.DATABASE_URL_POOLED && direct) {
    if (!pooled || !pooled.hostname.includes("-pooler.")) {
      problems.push("DATABASE_URL_POOLED should be the pooled connection (with -pooler).");
    } else if (
      pooled.hostname.replace("-pooler.", ".") !== direct.hostname ||
      pooled.pathname !== direct.pathname
    ) {
      problems.push("DATABASE_URL and DATABASE_URL_POOLED point at different databases.");
    }
  }

  for (const key of [
    "AWS_ENDPOINT_URL_S3",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET",
  ]) {
    if (!env[key]) problems.push(`${key} is missing.`);
  }
  const endpoint = parseUrl(env.AWS_ENDPOINT_URL_S3);
  if (env.AWS_ENDPOINT_URL_S3 && endpoint?.protocol !== "https:") {
    problems.push("AWS_ENDPOINT_URL_S3 should be an https:// address.");
  } else if (endpoint && storageKind(env.AWS_ENDPOINT_URL_S3) !== files) {
    problems.push(
      files === "neon"
        ? "AWS_ENDPOINT_URL_S3 is not a Neon storage address (…neon.tech)."
        : "AWS_ENDPOINT_URL_S3 is not an R2 address (https://<account-id>.r2.cloudflarestorage.com).",
    );
  }
  if (files === "r2") {
    const publicUrl = parseUrl(env.S3_PUBLIC_URL);
    if (!env.S3_PUBLIC_URL) {
      problems.push(
        "S3_PUBLIC_URL is missing: the bucket's public address (r2.dev or your domain).",
      );
    } else if (publicUrl?.protocol !== "https:") {
      problems.push("S3_PUBLIC_URL should be an https:// address.");
    }
  }

  const found = [];
  if (direct) found.push(`Database: ${direct.hostname}${direct.pathname}`);
  if (env.S3_BUCKET && endpoint)
    found.push(`Files: bucket ${env.S3_BUCKET} on ${endpoint.hostname}`);
  return { problems, found };
}

/**
 * Environment for the migration subprocess. The values saved in `.env.local` win over the shell's,
 * since Payload does not replace variables that are already set.
 */
export function migrationEnvironment(values, inherited = process.env) {
  return {
    ...inherited,
    ...values,
    PAYLOAD_LOCAL_PUSH: "false",
    PAYLOAD_USE_DIRECT_DB: "true",
  };
}

// `node scripts/setup-env.mjs init` prepares .env.local on its own (used by the tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === "init") {
    backupEnvFile();
    ensureEnvFile();
  } else {
    console.error("Usage: node scripts/setup-env.mjs init");
    process.exitCode = 1;
  }
}
