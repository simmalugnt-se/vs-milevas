import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { getPayload } from "payload";
import { composeEnvArgs } from "../scripts/lib/local-env.mjs";
import {
  type RedirectDoc,
  resolveRedirectDestination,
} from "../src/payload/data/redirects-core.ts";

// Run with the boilerplate's local Docker container running:
// node --import ./scripts/register-style-imports-loader.mjs --import tsx tests/slug-redirects.integration.ts
// Creates its own database, runs the existing migrations and removes only that database afterward.
async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const database = `slug_redirects_test_${Date.now()}`;
  const container =
    process.env.EXAMPLE_BLOCKS_TEST_CONTAINER ||
    execFileSync("docker", ["compose", ...composeEnvArgs(), "ps", "-q", "postgres"], {
      encoding: "utf8",
    }).trim();
  assert.ok(container, "Start the local database first: pnpm db:local:up");
  const port = process.env.POSTGRES_HOST_PORT || "5434";
  const docker = (...args: string[]) =>
    execFileSync("docker", ["exec", container, ...args], { stdio: "pipe" });

  // Without SERVICES, Payload reads DATABASE_URI: this test's own database, never the project's.
  delete process.env.SERVICES;
  process.env.DATABASE_URI = `postgres://payload:payload@127.0.0.1:${port}/${database}`;
  process.env.DATABASE_URI_DIRECT = process.env.DATABASE_URI;
  process.env.DATABASE_SSL = "false";
  process.env.PAYLOAD_LOCAL_PUSH = "false";
  process.env.PAYLOAD_SECRET = "isolated-slug-redirects-test-secret";
  // Skip resolving the Admin import map in this CLI test.
  process.argv.push("migrate");

  docker("createdb", "-U", "payload", database);
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
  try {
    const { default: config } = await import("../src/payload.config.ts");
    const client = await getPayload({ config, disableOnInit: true, disableDBConnect: true });
    payload = client;
    // Own the test pool so it can be closed before dropping the isolated database.
    client.db.pool = new client.db.pg.Pool(client.db.poolOptions);
    await client.db.connect();
    await client.db.migrate();

    // Next's cache functions do not run outside a request; the redirect hook does not need them.
    const context = { disableRevalidate: true };
    const redirects = async () =>
      (await client.find({ collection: "redirects", depth: 0, limit: 0, pagination: false }))
        .docs as RedirectDoc[];
    const froms = async () => (await redirects()).map((redirect) => redirect.from).sort();
    const create = (slug: string, status: "draft" | "published") =>
      client.create({
        collection: "pages",
        context,
        data: { title: slug, slug, _status: status },
      });
    // As in Admin: the editor's change autosaves as a draft, then a publish.
    const rename = async (id: string, slug: string) => {
      await client.update({
        collection: "pages",
        id,
        context,
        draft: true,
        data: { slug, _status: "draft" },
      });
      assert.deepEqual(await froms(), before, "a draft does not add a redirect");
      await client.update({ collection: "pages", id, context, data: { _status: "published" } });
    };
    let before: (string | null | undefined)[] = [];

    const page = await create("first", "published");
    before = await froms();
    await rename(page.id, "second");
    assert.deepEqual(await froms(), ["/first"]);

    before = await froms();
    await rename(page.id, "third");
    assert.deepEqual(await froms(), ["/first", "/second"]);
    // Every old address leads to the current one, in each language.
    const destination = (url: string, locale: string) =>
      redirects().then((list) =>
        resolveRedirectDestination({
          defaultLocale: "en",
          locales: ["en", "sv"],
          locale,
          redirects: list,
          url,
          loadReference: (relationTo, id) =>
            client.findByID({ collection: relationTo as "pages", id, depth: 0 }),
        }),
      );
    assert.equal(await destination("/first", "en"), "/third");
    assert.equal(await destination("/sv/second", "sv"), "/sv/third");

    // Back to an earlier slug: its redirect goes, so it cannot loop.
    before = await froms();
    await rename(page.id, "first");
    assert.deepEqual(await froms(), ["/second", "/third"]);

    // An address someone already redirected elsewhere is left alone.
    await client.create({
      collection: "redirects",
      context,
      data: { from: "/first", to: { type: "custom", url: "/elsewhere" } },
    });
    before = await froms();
    await rename(page.id, "fourth");
    assert.deepEqual(await froms(), ["/first", "/second", "/third"]);
    assert.equal(await destination("/first", "en"), "/elsewhere");

    // Never from the start page.
    const home = await create("home", "published");
    before = await froms();
    await rename(home.id, "start");
    assert.deepEqual(await froms(), before);

    // A page never published had no public address to keep.
    const draft = await create("unpublished", "draft");
    before = await froms();
    await rename(draft.id, "published-later");
    assert.deepEqual(await froms(), before);

    // Publishing without a new slug changes nothing.
    await client.update({
      collection: "pages",
      id: page.id,
      context,
      data: { title: "Same slug", _status: "published" },
    });
    assert.deepEqual(await froms(), before);

    console.log(
      "PASS: redirect on a published rename, none for drafts, the start page or unpublished pages, no loop on renaming back, existing redirects kept.",
    );
  } finally {
    try {
      await payload?.db.pool?.end();
      await payload?.destroy();
    } finally {
      docker("dropdb", "-U", "payload", "--force", database);
    }
  }
}

// Payload's CLI dependencies can retain background handles after its pool has closed.
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
