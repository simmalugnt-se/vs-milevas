import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import type { Field } from "payload";

// No database or provider requests: build configuration in isolated processes with fake credentials.
function schemaFields(fields: Field[]): unknown[] {
  return fields
    .map((field) => {
      const { admin: _admin, hooks: _hooks, access: _access, ...rest } = field;
      const result: Record<string, unknown> = { ...rest };
      if ("fields" in field) result.fields = schemaFields(field.fields);
      if ("tabs" in field)
        result.tabs = field.tabs.map((tab) => ({ ...tab, fields: schemaFields(tab.fields) }));
      return result;
    })
    .sort((a, b) => String(a.name ?? a.type).localeCompare(String(b.name ?? b.type)));
}

if (process.argv.includes("--snapshot")) {
  process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:5434/unused";
  process.env.PAYLOAD_SECRET = "configuration-only-test-secret";
  process.env.AI_PROVIDER = "off";
  process.argv.push("migrate");
  const config = await (await import("../src/payload.config.ts")).default;
  console.log(
    JSON.stringify({
      collections: createHash("sha256")
        .update(
          JSON.stringify(
            config.collections.map(({ slug, fields }) => ({
              slug,
              fields: schemaFields(fields),
            })),
          ),
        )
        .digest("hex"),
      mcp: config.endpoints.filter((endpoint) => endpoint.path === "/mcp").length,
    }),
  );
  process.exit(0);
} else {
  const snapshot = (services: string, endpoint: string, enabled: boolean) => {
    const output = execFileSync(
      process.execPath,
      [
        "--import",
        "./scripts/register-style-imports-loader.mjs",
        "--import",
        "tsx",
        fileURLToPath(import.meta.url),
        "--snapshot",
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          SERVICES: services,
          PAYLOAD_MUX_ENABLED: String(enabled),
          PAYLOAD_MCP_ENABLED: String(enabled),
          S3_BUCKET: "test",
          AWS_ENDPOINT_URL_S3: endpoint,
          AWS_REGION: "us-east-2",
          AWS_ACCESS_KEY_ID: "test",
          AWS_SECRET_ACCESS_KEY: "test",
          S3_PUBLIC_URL: "https://files.example.invalid",
        },
      },
    );
    return JSON.parse(output.trim().split("\n").at(-1) || "{}");
  };
  const local = snapshot("local", "https://unused.example.invalid", false);
  for (const [provider, endpoint] of [
    ["r2", "https://account.r2.cloudflarestorage.com"],
    ["neon", "https://br-1.storage.c-2.us-east-2.aws.neon.tech"],
  ]) {
    const cloud = snapshot("cloud", endpoint, true);
    assert.deepEqual(
      cloud.collections,
      local.collections,
      `${provider} must retain the local schema`,
    );
    assert.equal(cloud.mcp, 2);
  }
  assert.equal(local.mcp, 0);
  console.log(
    "PASS: local/R2/Neon have identical collection schemas; disabled MCP has no endpoints.",
  );
}
