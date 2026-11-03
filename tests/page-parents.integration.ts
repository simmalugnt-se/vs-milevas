import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { getPayload } from "payload";
import { composeEnvArgs } from "../scripts/lib/local-env.mjs";
import {
  type RedirectDoc,
  resolveRedirectDestination,
} from "../src/payload/data/redirects-core.ts";

// Run with the local Docker database running: pnpm test:page-parents
// Creates its own database, runs the migrations and removes only that database afterward.
async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const database = `page_parents_test_${Date.now()}`;
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
  process.env.PAYLOAD_SECRET = "isolated-page-parents-test-secret";
  // A moved page's old address redirects to it.
  process.env.PAYLOAD_REDIRECTS_ENABLED = "true";
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

    // Next's cache functions do not run outside a request.
    const context = { disableRevalidate: true };
    const create = (slug: string, parent?: string) =>
      client.create({
        collection: "pages",
        context,
        data: { title: slug, slug, parent, _status: "published" },
      });
    const published = async (id: string) =>
      (await client.findByID({ collection: "pages", id, depth: 0, draft: false })).path;
    const latest = (id: string) =>
      client.findByID({ collection: "pages", id, depth: 0, draft: true });
    const publish = (id: string, data: Record<string, unknown>) =>
      client.update({ collection: "pages", id, context, data: { ...data, _status: "published" } });

    const trucks = await create("motviktstruckar");
    const three = await create("trehjuliga", trucks.id);
    const guide = await create("guide", three.id);
    assert.equal(three.path, "motviktstruckar/trehjuliga");
    assert.equal(guide.path, "motviktstruckar/trehjuliga/guide");

    // A child's unpublished edit stays the latest version when its parent moves it.
    await client.update({
      collection: "pages",
      id: three.id,
      context,
      draft: true,
      data: { title: "Trehjuliga (utkast)", _status: "draft" },
    });

    // A parent's draft rename moves nothing; publishing it moves every page under it.
    await client.update({
      collection: "pages",
      id: trucks.id,
      context,
      draft: true,
      data: { slug: "motvikt", _status: "draft" },
    });
    assert.equal(await published(three.id), "motviktstruckar/trehjuliga");
    await publish(trucks.id, {});
    assert.equal(await published(trucks.id), "motvikt");
    assert.equal(await published(three.id), "motvikt/trehjuliga");
    assert.equal(await published(guide.id), "motvikt/trehjuliga/guide");
    const draft = await latest(three.id);
    assert.equal(draft._status, "draft");
    assert.equal(draft.title, "Trehjuliga (utkast)");
    assert.equal(draft.path, "motvikt/trehjuliga");

    // Every old address leads to the page's new one.
    const redirects = (
      await client.find({ collection: "redirects", depth: 0, limit: 0, pagination: false })
    ).docs as RedirectDoc[];
    const destination = (url: string) =>
      resolveRedirectDestination({
        defaultLocale: "sv",
        locales: ["sv"],
        locale: "sv",
        redirects,
        url,
        loadReference: (relationTo, id) =>
          client.findByID({ collection: relationTo as "pages", id, depth: 0 }),
      });
    assert.equal(await destination("/motviktstruckar/trehjuliga"), "/motvikt/trehjuliga");
    assert.equal(
      await destination("/motviktstruckar/trehjuliga/guide"),
      "/motvikt/trehjuliga/guide",
    );

    // Never under itself or one of its own pages.
    const loop = (error: { data?: { errors?: Array<{ message?: string }> } }) =>
      Boolean(error.data?.errors?.some((item) => item.message?.includes("under sig själv")));
    await assert.rejects(publish(trucks.id, { parent: guide.id }), loop);
    await assert.rejects(publish(trucks.id, { parent: trucks.id }), loop);

    // A page moved to the top level, and back under another.
    await publish(three.id, { parent: null });
    assert.equal(await published(three.id), "trehjuliga");
    assert.equal(await published(guide.id), "trehjuliga/guide");

    // A deleted page's children move to the top level.
    await client.delete({ collection: "pages", id: three.id, context });
    assert.equal(await published(guide.id), "guide");
    assert.equal((await latest(guide.id)).parent ?? null, null);

    console.log(
      "PASS: addresses under parents, moved with a published rename (not a draft), drafts kept, redirects from old addresses, no loops, children of a deleted page at the top level.",
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
