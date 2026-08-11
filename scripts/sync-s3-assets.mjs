#!/usr/bin/env node

import { spawn, spawnSync } from "child_process";
import dotenv from "dotenv";
import { mkdir, rm } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const validEnvs = new Set(["local", "staging", "prod"]);
const suffixByEnv = {
  local: "LOCAL",
  staging: "STAGING",
  prod: "PROD",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  let from = "";
  let to = "";
  let deleteTarget = false;

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
    if (arg === "--delete") {
      deleteTarget = true;
      continue;
    }
  }

  return { from, to, deleteTarget };
};

const run = (command, args, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "unknown"}`));
    });
    child.on("error", reject);
  });

/**
 * Resolve S3-compatible credentials (Cloudflare R2, AWS S3, etc.).
 * Supports `S3_*_{SUFFIX}` (xo-foundation style) or `R2_*` / `R2_*_{SUFFIX}` for this repo.
 */
const getProfile = (name) => {
  const suffix = suffixByEnv[name];

  if (name === "local") {
    return {
      endpoint: process.env.S3_ENDPOINT_LOCAL || process.env.R2_ENDPOINT || process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET_LOCAL || process.env.R2_BUCKET || process.env.S3_BUCKET,
      accessKeyId:
        process.env.S3_ACCESS_KEY_ID_LOCAL ||
        process.env.R2_ACCESS_KEY_ID ||
        process.env.S3_ACCESS_KEY_ID,
      secretAccessKey:
        process.env.S3_SECRET_ACCESS_KEY_LOCAL ||
        process.env.R2_SECRET_ACCESS_KEY ||
        process.env.S3_SECRET_ACCESS_KEY,
      region:
        process.env.S3_REGION_LOCAL || process.env.R2_REGION || process.env.S3_REGION || "auto",
    };
  }

  return {
    endpoint: process.env[`S3_ENDPOINT_${suffix}`] || process.env[`R2_ENDPOINT_${suffix}`],
    bucket: process.env[`S3_BUCKET_${suffix}`] || process.env[`R2_BUCKET_${suffix}`],
    accessKeyId:
      process.env[`S3_ACCESS_KEY_ID_${suffix}`] || process.env[`R2_ACCESS_KEY_ID_${suffix}`],
    secretAccessKey:
      process.env[`S3_SECRET_ACCESS_KEY_${suffix}`] ||
      process.env[`R2_SECRET_ACCESS_KEY_${suffix}`],
    region: process.env[`S3_REGION_${suffix}`] || process.env[`R2_REGION_${suffix}`] || "auto",
  };
};

const validateProfile = (name, profile) => {
  const missing = [];
  if (!profile.endpoint) missing.push(`endpoint (${name})`);
  if (!profile.bucket) missing.push(`bucket (${name})`);
  if (!profile.accessKeyId) missing.push(`access key (${name})`);
  if (!profile.secretAccessKey) missing.push(`secret key (${name})`);

  if (missing.length > 0) {
    throw new Error(
      `Missing required storage config for "${name}": ${missing.join(", ")}. Set S3_*_${suffixByEnv[name].toUpperCase()} or R2_*_${suffixByEnv[name].toUpperCase()} (local also accepts unsuffixed R2_*).`,
    );
  }
};

const ensureAwsCli = () => {
  const check = spawnSync("aws", ["--version"], { stdio: "ignore" });
  if (check.status !== 0) {
    throw new Error("AWS CLI is required. Install it and run again.");
  }
};

const main = async () => {
  const { from, to, deleteTarget } = parseArgs();

  if (!validEnvs.has(from) || !validEnvs.has(to)) {
    throw new Error(
      "Usage: node scripts/sync-s3-assets.mjs --from <local|staging|prod> --to <local|staging|prod> [--delete]",
    );
  }

  if (from === to) {
    throw new Error("Source and destination must be different.");
  }

  ensureAwsCli();

  const source = getProfile(from);
  const destination = getProfile(to);
  validateProfile(from, source);
  validateProfile(to, destination);

  const prefix = process.env.SYNC_S3_PREFIX || "media";
  const tempDir = path.resolve(
    process.cwd(),
    process.env.SYNC_S3_TMP_DIR || `tmp/s3-sync-${Date.now()}`,
  );

  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const sourceEnv = {
    ...process.env,
    AWS_ACCESS_KEY_ID: source.accessKeyId,
    AWS_SECRET_ACCESS_KEY: source.secretAccessKey,
    AWS_DEFAULT_REGION: source.region,
  };

  const destinationEnv = {
    ...process.env,
    AWS_ACCESS_KEY_ID: destination.accessKeyId,
    AWS_SECRET_ACCESS_KEY: destination.secretAccessKey,
    AWS_DEFAULT_REGION: destination.region,
  };

  console.log(`[sync] Downloading s3://${source.bucket}/${prefix}/ from ${from}...`);
  await run(
    "aws",
    [
      "--endpoint-url",
      source.endpoint,
      "s3",
      "sync",
      `s3://${source.bucket}/${prefix}/`,
      `${tempDir}/`,
      "--only-show-errors",
    ],
    sourceEnv,
  );

  const uploadArgs = [
    "--endpoint-url",
    destination.endpoint,
    "s3",
    "sync",
    `${tempDir}/`,
    `s3://${destination.bucket}/${prefix}/`,
    "--only-show-errors",
  ];

  if (deleteTarget) {
    uploadArgs.push("--delete");
  }

  console.log(`[sync] Uploading to s3://${destination.bucket}/${prefix}/ in ${to}...`);
  await run("aws", uploadArgs, destinationEnv);

  console.log("[sync] Completed successfully.");
};

main().catch((error) => {
  console.error(`[sync] ${error.message}`);
  process.exit(1);
});
