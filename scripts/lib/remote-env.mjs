/**
 * Production's and staging's services, for the scripts that copy between environments.
 *
 * Each environment has its own file with Neon's block for that branch, pasted as it is (the same
 * names Vercel gets): `.env.remote.prod` and `.env.remote.staging`. The app never reads them, and
 * Next does not load them either, unlike `.env.production`. Projects from before these files keep
 * `DATABASE_URI_DIRECT_PROD` and `DATABASE_URI_DIRECT_STAGING` in `.env.local`.
 */
import path from "node:path";
import { readEnv } from "./local-env.mjs";

export const REMOTE_ENVS = ["prod", "staging"];

const legacySuffix = { prod: "PROD", staging: "STAGING" };

/** @param {string} name */
const fileName = (name) => `.env.remote.${name}`;

/** @param {string} name */
const remoteValues = (name) => readEnv(path.resolve(process.cwd(), fileName(name)));

/**
 * The direct database address of `name` (for pg_dump and pg_restore), and where it came from.
 * @param {string} name
 * @returns {{ key: string, value: string }}
 */
export function remoteDatabase(name) {
  const direct = remoteValues(name).DATABASE_URL;
  if (direct) {
    return { key: `DATABASE_URL in ${fileName(name)}`, value: direct };
  }
  const legacyKey = `DATABASE_URI_DIRECT_${legacySuffix[name]}`;
  if (process.env[legacyKey]) {
    return { key: legacyKey, value: process.env[legacyKey] };
  }
  throw new Error(
    `No database for ${name}: add Neon's DATABASE_URL (the direct connection) to ${fileName(name)}.`,
  );
}

/**
 * The bucket of `name`.
 * @param {string} name
 * @returns {{ bucket: string, endpoint: string, region: string, accessKeyId: string,
 *   secretAccessKey: string }}
 */
export function remoteStorage(name) {
  const values = remoteValues(name);
  const storage = {
    bucket: values.S3_BUCKET,
    endpoint: values.AWS_ENDPOINT_URL_S3,
    region: values.AWS_REGION || "auto",
    accessKeyId: values.AWS_ACCESS_KEY_ID,
    secretAccessKey: values.AWS_SECRET_ACCESS_KEY,
  };
  const missing = Object.entries({
    S3_BUCKET: storage.bucket,
    AWS_ENDPOINT_URL_S3: storage.endpoint,
    AWS_ACCESS_KEY_ID: storage.accessKeyId,
    AWS_SECRET_ACCESS_KEY: storage.secretAccessKey,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`No bucket for ${name}: add ${missing.join(", ")} to ${fileName(name)}.`);
  }
  return storage;
}
