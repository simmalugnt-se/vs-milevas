import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { checkCloudValues, migrationEnvironment, unsafeEnvValue } from "../scripts/setup-env.mjs";
import {
  databaseUrls,
  describeServices,
  objectStorage,
  servicesMode,
} from "../src/utilities/services.mjs";

// Shaped like the block Neon shows for a new project with Postgres and Storage (fake values).
const neon = {
  SERVICES: "cloud",
  DATABASE_URL:
    "postgresql://app:secret@ep-cool-bird-123.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  DATABASE_URL_POOLED:
    "postgresql://app:secret@ep-cool-bird-123-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  AWS_ENDPOINT_URL_S3: "https://br-1.storage.c-2.eu-central-1.aws.neon.tech",
  AWS_ACCESS_KEY_ID: "key",
  AWS_SECRET_ACCESS_KEY: "secret",
  AWS_REGION: "eu-central-1",
  S3_BUCKET: "uploads",
};
const r2 = {
  ...neon,
  AWS_ENDPOINT_URL_S3: "https://account.r2.cloudflarestorage.com",
  AWS_REGION: "auto",
  S3_BUCKET: "site-files",
  S3_PUBLIC_URL: "https://pub-abc.r2.dev",
};

test("setup helper generates missing secrets and backs up without rotating real ones", async () => {
  const dir = await mkdtemp(join(tmpdir(), "payload-setup-test-"));
  const helper = fileURLToPath(new URL("../scripts/setup-env.mjs", import.meta.url));
  try {
    await writeFile(
      join(dir, ".env.example"),
      "PAYLOAD_SECRET=your-secret-here\nPREVIEW_SECRET=your-preview-secret\nDATABASE_URI=unchanged\n",
    );
    const run = () => spawnSync(process.execPath, [helper, "init"], { cwd: dir, encoding: "utf8" });
    assert.equal(run().status, 0);
    const first = parse(await readFile(join(dir, ".env.local")));
    assert.match(first.PAYLOAD_SECRET, /^[a-f0-9]{64}$/);
    assert.match(first.PREVIEW_SECRET, /^[a-f0-9]{64}$/);
    assert.equal(first.DATABASE_URI, "unchanged");
    assert.equal(run().status, 0);
    assert.deepEqual(parse(await readFile(join(dir, ".env.local"))), first);
    const backups = (await readdir(dir)).filter((name) =>
      name.startsWith(".env.local.setup-backup"),
    );
    assert.deepEqual(backups, [".env.local.setup-backup"]);
    const backup = backups[0];
    assert.deepEqual(parse(await readFile(join(dir, backup))), first);
    assert.equal((await stat(join(dir, backup))).mode & 0o777, 0o600);
    assert.equal((await stat(join(dir, ".env.local"))).mode & 0o777, 0o600);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("optional integrations retain schema and gate their entry points", async () => {
  const plugins = await readFile(
    new URL("../src/payload/plugins/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    plugins,
    /mcpPlugin\(\{\s*\/\/[^\n]*\n\s*disabled: process.env.PAYLOAD_MCP_ENABLED === "false"/,
  );
  // The videos collection stays without Mux, so the schema does not depend on it.
  assert.match(plugins, /muxPlugin\(\{\s*enabled: process.env.PAYLOAD_MUX_ENABLED !== "false"/);
});

test("SERVICES=local needs only the Docker port and keeps files in the project", () => {
  const env = {
    SERVICES: "local",
    POSTGRES_HOST_PORT: "5435",
    ...{ DATABASE_URL: neon.DATABASE_URL },
  };
  assert.equal(servicesMode(env), "local");
  assert.deepEqual(databaseUrls(env), {
    runtime: "postgresql://payload:payload@127.0.0.1:5435/payload_dev",
    direct: "postgresql://payload:payload@127.0.0.1:5435/payload_dev",
    ssl: false,
  });
  assert.equal(objectStorage({ ...neon, SERVICES: "local" }), null);
  assert.equal(databaseUrls({ SERVICES: "local" }).direct.includes(":5434/"), true);
});

test("SERVICES=cloud reads Neon's block as it is", () => {
  // Neon's sslmode=require is spelled out as verify-full, which the driver already applies.
  const verified = (url) => url.replace("sslmode=require", "sslmode=verify-full");
  assert.deepEqual(databaseUrls(neon), {
    runtime: verified(neon.DATABASE_URL_POOLED),
    direct: verified(neon.DATABASE_URL),
    ssl: false,
  });
  assert.match(
    databaseUrls({ ...neon, DATABASE_URL: "postgresql://a:b@db.example.com/db" }).direct,
    /\?sslmode=verify-full$/,
  );
  assert.equal(databaseUrls({ ...neon, DATABASE_SSL: "false" }).direct, neon.DATABASE_URL);
  assert.deepEqual(objectStorage(neon), {
    kind: "neon",
    bucket: "uploads",
    endpoint: neon.AWS_ENDPOINT_URL_S3,
    region: "eu-central-1",
    accessKeyId: "key",
    secretAccessKey: "secret",
    publicUrl: "https://br-1.storage.c-2.eu-central-1.aws.neon.tech/uploads",
  });
  assert.equal(objectStorage(r2)?.kind, "r2");
  assert.equal(objectStorage(r2)?.publicUrl, "https://pub-abc.r2.dev");
  // R2 has no public address to derive: without S3_PUBLIC_URL files stay local.
  assert.equal(objectStorage({ ...r2, S3_PUBLIC_URL: "" }), null);
  assert.match(
    describeServices(neon),
    /SERVICES=cloud: database ep-cool-bird-123-pooler.*Neon \(uploads\)/,
  );
});

test("projects without SERVICES keep reading the older names", () => {
  const legacy = {
    DATABASE_URI: "postgresql://payload:payload@127.0.0.1:5434/payload_dev",
    DATABASE_URI_DIRECT_PROD: "postgresql://a:b@prod.example.com/db",
    R2_BUCKET: "b",
    R2_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    R2_ACCESS_KEY_ID: "k",
    R2_SECRET_ACCESS_KEY: "s",
    R2_PUBLIC_URL: "https://pub.r2.dev",
  };
  assert.equal(servicesMode(legacy), null);
  assert.equal(databaseUrls(legacy).runtime, legacy.DATABASE_URI);
  assert.equal(
    databaseUrls({
      APP_ENV: "production",
      DATABASE_URI_DIRECT_PROD: legacy.DATABASE_URI_DIRECT_PROD,
    }).direct,
    legacy.DATABASE_URI_DIRECT_PROD,
  );
  assert.equal(objectStorage(legacy)?.bucket, "b");
  assert.equal(objectStorage({ ...legacy, STORAGE_PROVIDER: "local" }), null);
});

test("the guide accepts Neon's and R2's values and explains what is wrong", () => {
  assert.deepEqual(checkCloudValues(neon, "neon").problems, []);
  assert.deepEqual(checkCloudValues(r2, "r2").problems, []);
  assert.deepEqual(
    checkCloudValues({ ...neon, DATABASE_URL_POOLED: undefined }, "neon").problems,
    [],
  );
  assert.match(
    checkCloudValues({}, "neon").problems.join(" "),
    /DATABASE_URL is missing.*S3_BUCKET is missing/,
  );
  assert.match(
    checkCloudValues({ ...neon, DATABASE_URL: neon.DATABASE_URL_POOLED }, "neon").problems.join(),
    /direct connection/,
  );
  assert.match(
    checkCloudValues(
      { ...neon, DATABASE_URL_POOLED: neon.DATABASE_URL_POOLED.replace("ep-cool", "ep-other") },
      "neon",
    ).problems.join(),
    /different databases/,
  );
  assert.match(checkCloudValues(neon, "r2").problems.join(), /not an R2 address.*S3_PUBLIC_URL/s);
  assert.match(checkCloudValues(r2, "neon").problems.join(), /not a Neon storage address/);
  assert.deepEqual(checkCloudValues(neon, "neon").found, [
    "Database: ep-cool-bird-123.eu-central-1.aws.neon.tech/neondb",
    "Files: bucket uploads on br-1.storage.c-2.eu-central-1.aws.neon.tech",
  ]);
});

test("the migration uses the saved values over the shell's", () => {
  const env = migrationEnvironment(neon, { DATABASE_URL: "wrong", PATH: "/bin" });
  assert.equal(env.DATABASE_URL, neon.DATABASE_URL);
  assert.equal(env.PATH, "/bin");
  assert.equal(env.PAYLOAD_USE_DIRECT_DB, "true");
  assert.equal(env.PAYLOAD_LOCAL_PUSH, "false");
});

test("values that would change meaning in .env.local are refused", () => {
  assert.equal(unsafeEnvValue("sk-abc123"), false);
  for (const value of ["with space", "a#b", "a$b", 'a"b', "a'b", "a\\b"]) {
    assert.equal(unsafeEnvValue(value), true, value);
  }
});
