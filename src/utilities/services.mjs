/**
 * Which database and file storage the project uses, decided by `SERVICES` in `.env.local`:
 *
 * - `SERVICES=local`: Postgres in this project's Docker container (on `POSTGRES_HOST_PORT`) and
 *   uploads in the project folder. Nothing else needs to be set.
 * - `SERVICES=cloud`: the variables Neon gives you when you create a project, pasted as they are:
 *   `DATABASE_URL` (direct), `DATABASE_URL_POOLED`, and for files `S3_BUCKET`,
 *   `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. Cloudflare R2
 *   uses the same names plus `S3_PUBLIC_URL`, the bucket's public address.
 *
 * Without `SERVICES` (projects from before it) the older `DATABASE_URI*` and `R2_*` names are read.
 *
 * Plain JavaScript, so the setup scripts can use it as well as the app.
 */

export const DEFAULT_POSTGRES_PORT = 5434;

/** @typedef {Record<string, string | undefined>} Env */

/** @param {Env} env @returns {"local" | "cloud" | null} */
export function servicesMode(env = process.env) {
  const mode = env.SERVICES?.trim().toLowerCase();
  return mode === "local" || mode === "cloud" ? mode : null;
}

/** This project's Docker Compose database. @param {Env} env */
export function localDatabaseUrl(env = process.env) {
  const port = Number(env.POSTGRES_HOST_PORT) || DEFAULT_POSTGRES_PORT;
  return `postgresql://payload:payload@127.0.0.1:${port}/payload_dev`;
}

/** @param {string | undefined} value */
const nonEmpty = (value) => value?.trim() || undefined;

/**
 * The older names, optionally per APP_ENV (`DATABASE_URI_PROD` and so on).
 * @param {Env} env @param {string} key
 */
function legacy(env, key) {
  const suffix =
    { production: "PROD", prod: "PROD", preview: "STAGING", staging: "STAGING", stage: "STAGING" }[
      (env.APP_ENV ?? "").trim().toLowerCase()
    ] ?? "LOCAL";
  return nonEmpty(env[key]) ?? nonEmpty(env[`${key}_${suffix}`]);
}

/**
 * Spells out `sslmode=verify-full` for hosted databases. The driver already treats `require` (what
 * Neon's addresses say) as `verify-full`, but warns on every start that its next major version
 * will verify less; `verify-full` keeps today's certificate check either way. A missing mode gets
 * it too. With DATABASE_SSL=false the address is left as it is.
 * @param {string | undefined} url @param {Env} env
 */
function verifiedSsl(url, env) {
  if (!url || env.DATABASE_SSL === "false") return url;
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (!mode || ["prefer", "require", "verify-ca"].includes(mode)) {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * The database to connect to: `runtime` for the site (pooled where there is one) and `direct`
 * for migrations.
 * @param {Env} env
 * @returns {{ runtime?: string, direct?: string, ssl: boolean }}
 */
export function databaseUrls(env = process.env) {
  const mode = servicesMode(env);
  if (mode === "local") {
    const url = localDatabaseUrl(env);
    return { runtime: url, direct: url, ssl: false };
  }
  if (mode === "cloud") {
    const direct = verifiedSsl(nonEmpty(env.DATABASE_URL), env);
    // SSL is set in the address itself (see verifiedSsl), which the driver prefers anyway.
    return {
      runtime: verifiedSsl(nonEmpty(env.DATABASE_URL_POOLED), env) ?? direct,
      direct,
      ssl: false,
    };
  }
  const runtime = legacy(env, "DATABASE_URI") ?? nonEmpty(env.DATABASE_URL);
  return {
    runtime,
    direct: legacy(env, "DATABASE_URI_DIRECT") ?? runtime,
    ssl: env.DATABASE_SSL === "true",
  };
}

/**
 * The S3-compatible bucket for uploads, or null to keep them in the project folder.
 * @param {Env} env
 * @returns {null | { kind: "neon" | "r2" | "s3", bucket: string, endpoint: string, region: string,
 *   accessKeyId: string, secretAccessKey: string, publicUrl: string }}
 */
export function objectStorage(env = process.env) {
  const mode = servicesMode(env);
  if (mode === "local") return null;
  const values =
    mode === "cloud"
      ? {
          bucket: nonEmpty(env.S3_BUCKET),
          endpoint: nonEmpty(env.AWS_ENDPOINT_URL_S3),
          region: nonEmpty(env.AWS_REGION) ?? "auto",
          accessKeyId: nonEmpty(env.AWS_ACCESS_KEY_ID),
          secretAccessKey: nonEmpty(env.AWS_SECRET_ACCESS_KEY),
          publicUrl: nonEmpty(env.S3_PUBLIC_URL),
        }
      : env.STORAGE_PROVIDER === "local"
        ? {}
        : {
            bucket: nonEmpty(env.R2_BUCKET),
            endpoint: nonEmpty(env.R2_ENDPOINT),
            region: nonEmpty(env.R2_REGION) ?? "auto",
            accessKeyId: nonEmpty(env.R2_ACCESS_KEY_ID),
            secretAccessKey: nonEmpty(env.R2_SECRET_ACCESS_KEY),
            publicUrl: nonEmpty(env.R2_PUBLIC_URL),
          };
  const kind = storageKind(values.endpoint);
  // A public Neon bucket serves its files at the endpoint followed by the bucket name.
  if (!values.publicUrl && kind === "neon" && values.endpoint && values.bucket) {
    values.publicUrl = `${values.endpoint.replace(/\/+$/, "")}/${values.bucket}`;
  }
  const { bucket, endpoint, region, accessKeyId, secretAccessKey, publicUrl } = values;
  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey || !publicUrl) {
    return null;
  }
  return { kind, bucket, endpoint, region, accessKeyId, secretAccessKey, publicUrl };
}

/** @param {string | undefined} endpoint @returns {"neon" | "r2" | "s3"} */
export function storageKind(endpoint) {
  try {
    const host = new URL(endpoint ?? "").hostname;
    if (host.endsWith(".neon.tech")) return "neon";
    if (host.endsWith(".r2.cloudflarestorage.com")) return "r2";
  } catch {}
  return "s3";
}

/** One line for the log on start: which database and storage this run uses. @param {Env} env */
export function describeServices(env = process.env) {
  const mode = servicesMode(env);
  const { runtime } = databaseUrls(env);
  let database = "no database configured";
  try {
    const url = new URL(runtime ?? "");
    database = `database ${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}`;
  } catch {}
  const storage = objectStorage(env);
  const files = storage
    ? `files in ${storage.kind === "s3" ? "S3" : storage.kind === "r2" ? "Cloudflare R2" : "Neon"} (${storage.bucket})`
    : "files in the project folder";
  return `${mode ? `SERVICES=${mode}: ` : ""}${database}, ${files}`;
}
