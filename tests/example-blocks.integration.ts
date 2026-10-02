import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { NextIntlClientProvider } from "next-intl";
import { getPayload } from "payload";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { composeEnvArgs } from "../scripts/lib/local-env.mjs";
import { CallToActionBlockComponent } from "../src/payload/blocks/CallToAction/Component.tsx";
import { CardsBlockComponent } from "../src/payload/blocks/Cards/Component.tsx";
import { ColumnsBlockComponent } from "../src/payload/blocks/Columns/Component.tsx";
import { FAQBlockComponent } from "../src/payload/blocks/FAQ/Component.tsx";
import type {
  CallToActionBlock,
  CardsBlock,
  ColumnsBlock,
  FAQBlock,
} from "../src/payload/blocks/types.ts";
import { seedDefaultSiteIfEmpty } from "../src/payload/seed/defaultSite.ts";

// Run with the boilerplate's local Docker container running:
// node --import ./scripts/register-style-imports-loader.mjs --import tsx tests/example-blocks.integration.ts
// Creates its own database, runs the existing migrations and removes only that database afterward.
async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const database = `example_blocks_test_${Date.now()}`;
  // This project's Compose container, whatever the project folder is called.
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
  process.env.PAYLOAD_SECRET = "isolated-example-blocks-test-secret";
  // Skip resolving the Admin import map in this CLI test.
  process.argv.push("migrate");

  docker("createdb", "-U", "payload", database);
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
  try {
    const { default: config } = await import("../src/payload.config.ts");
    payload = await getPayload({ config, disableOnInit: true, disableDBConnect: true });
    // Own the test pool so it can be closed before dropping the isolated database.
    payload.db.pool = new payload.db.pg.Pool(payload.db.poolOptions);
    await payload.db.connect();
    await payload.db.migrate();
    // The storage metadata columns must be queryable even with object storage disabled.
    await payload.find({ collection: "images", limit: 1 });
    await payload.find({ collection: "videos", limit: 1 });
    await payload.find({ collection: "documents", limit: 1 });
    if (process.env.EXAMPLE_BLOCKS_BUILD === "true") {
      // Build against this migrated disposable DB, never the developer's current database.
      execFileSync("pnpm", ["build"], { stdio: "inherit", env: process.env });
    }
    await seedDefaultSiteIfEmpty(payload);

    const home = await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      locale: "sv",
      depth: 2,
    });
    assert.equal(home.totalDocs, 1);
    const page = home.docs[0];
    assert.deepEqual(
      page.layout?.map((block) => block.blockType),
      ["hero", "cards", "faq", "columns", "callToAction"],
    );
    const cards = page.layout?.find((block): block is CardsBlock => block.blockType === "cards");
    const faq = page.layout?.find((block): block is FAQBlock => block.blockType === "faq");
    assert.ok(cards && faq);
    assert.equal(cards.items.length, 3);
    assert.equal(faq.items.length, 3);
    for (const block of [cards, faq]) {
      assert.ok(block.id);
      assert.ok(block.items.every((item) => item.id));
      assert.equal(new Set(block.items.map((item) => item.id)).size, 3);
    }
    const reference = cards.items[0].link.reference?.value;
    assert.ok(reference && typeof reference === "object");
    assert.equal(reference.slug, "test");

    const cardsHTML = renderToStaticMarkup(
      createElement(
        NextIntlClientProvider,
        // Milevas defaults to Swedish, so English is the locale with a prefix.
        { locale: "en", messages: {} },
        createElement(CardsBlockComponent, { block: cards }),
      ),
    );
    assert.match(cardsHTML, /data-payload-field="link.label"/);
    assert.match(cardsHTML, /href="\/en\/test"/);
    assert.match(cardsHTML, /target="_blank"/);
    assert.match(cardsHTML, /rel="noopener noreferrer"/);
    const faqHTML = renderToStaticMarkup(createElement(FAQBlockComponent, { block: faq }));
    assert.equal((faqHTML.match(/<details /g) || []).length, 3);
    assert.equal((faqHTML.match(/<summary /g) || []).length, 3);
    assert.match(faqHTML, /data-payload-field="question"/);
    assert.match(faqHTML, /data-payload-field="answer"/);
    for (const item of faq.items) {
      assert.ok(faqHTML.includes(`data-payload-block="${item.id}"`));
    }
    for (const item of cards.items) {
      assert.ok(cardsHTML.includes(`data-payload-block="${item.id}"`));
    }

    const columns = page.layout?.find(
      (block): block is ColumnsBlock => block.blockType === "columns",
    );
    const callToAction = page.layout?.find(
      (block): block is CallToActionBlock => block.blockType === "callToAction",
    );
    assert.ok(columns && callToAction);
    assert.equal(columns.columns.length, 2);
    const columnsHTML = renderToStaticMarkup(
      createElement(ColumnsBlockComponent, { block: columns }),
    );
    assert.match(columnsHTML, /md:grid-cols-2/);
    assert.match(columnsHTML, /Use columns to place text and images side by side\./);
    for (const column of columns.columns) {
      assert.ok(columnsHTML.includes(`data-payload-block="${column.id}"`));
      for (const nested of column.content ?? []) {
        assert.ok(columnsHTML.includes(`data-payload-block="${nested.id}"`));
      }
    }
    const callToActionHTML = renderToStaticMarkup(
      createElement(
        NextIntlClientProvider,
        // Milevas defaults to Swedish, so English is the locale with a prefix.
        { locale: "en", messages: {} },
        createElement(CallToActionBlockComponent, { block: callToAction }),
      ),
    );
    assert.match(callToActionHTML, /<h2 /);
    assert.match(callToActionHTML, /data-payload-field="button.link.label"/);
    assert.match(callToActionHTML, /href="\/en\/test"/);

    const english = await payload.findByID({ collection: "pages", id: page.id, locale: "en" });
    assert.deepEqual(
      english.layout?.map((block) => block.blockType),
      ["hero", "cards", "faq", "columns", "callToAction"],
    );
    assert.ok(english.layout?.find((block) => block.blockType === "faq")?.items[0].answer);

    await payload.update({
      collection: "pages",
      id: page.id,
      data: { title: "Existing content must survive" },
      context: { disableRevalidate: true },
    });
    await seedDefaultSiteIfEmpty(payload);
    assert.equal((await payload.count({ collection: "pages" })).totalDocs, 2);
    const after = await payload.findByID({
      collection: "pages",
      id: page.id,
      locale: "sv",
      depth: 2,
    });
    assert.equal(after.title, "Existing content must survive");
    assert.deepEqual(after.layout, page.layout);
    console.log(
      "PASS: existing migrations, empty DB seed, populated links, localized fallback, row markers, native FAQ markup and existing-content preservation.",
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
