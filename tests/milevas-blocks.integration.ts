import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { getPayload } from "payload";
import { composeEnvArgs } from "../scripts/lib/local-env.mjs";
import { seedMilevasHomepage } from "../src/payload/seed/milevasHomepage";

/** CMS round trip, relationships, localization and seed preservation on a disposable database. */
async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const database = `milevas_blocks_test_${Date.now()}`;
  const container = execFileSync(
    "docker",
    ["compose", ...composeEnvArgs(), "ps", "-q", "postgres"],
    { encoding: "utf8" },
  ).trim();
  assert.ok(container, "Start the local database first");
  const docker = (...args: string[]) =>
    execFileSync("docker", ["exec", container, ...args], { stdio: "pipe" });
  delete process.env.SERVICES;
  process.env.DATABASE_URI = `postgres://payload:payload@127.0.0.1:${process.env.POSTGRES_HOST_PORT || "5434"}/${database}`;
  process.env.DATABASE_URI_DIRECT = process.env.DATABASE_URI;
  process.env.DATABASE_SSL = "false";
  process.env.PAYLOAD_LOCAL_PUSH = "false";
  process.env.PAYLOAD_SECRET = "isolated-milevas-blocks-test-secret";
  process.argv.push("migrate");
  docker("createdb", "-U", "payload", database);
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
  const uploadedFiles: string[] = [];
  try {
    const { default: config } = await import("../src/payload.config");
    payload = await getPayload({ config, disableOnInit: true, disableDBConnect: true });
    payload.db.pool = new payload.db.pg.Pool(payload.db.poolOptions);
    await payload.db.connect();
    await payload.db.migrate();
    for (const [key, configurable] of [
      ["electric-counterbalance", true],
      ["order-picker", false],
    ] as const) {
      await payload.create({
        collection: "truck-families",
        locale: "sv",
        context: { disableRevalidate: true },
        data: {
          name: `Test ${key}`,
          singularName: `Test ${key}`,
          key,
          sortOrder: 0,
          deliveryTime: "1 vecka",
          warranty: "Test",
          models: configurable ? [{ capacityKg: 1500, price: 169900 }] : [],
          _status: "published",
        },
      });
    }
    const { page, seeded } = await seedMilevasHomepage(payload, true);
    assert.equal(seeded, true);
    const saved = await payload.findByID({
      collection: "pages",
      id: page.id,
      locale: "sv",
      depth: 2,
    });
    assert.deepEqual(
      saved.layout?.map((block) => block.blockType),
      ["milevasHero", "textColumns", "productGrid", "textGrid", "textBoxinfo"],
    );
    // Om oss as Figma's page template, with the blocks the start page does not have.
    const about = await payload.find({
      collection: "pages",
      locale: "sv",
      where: { slug: { equals: "om-oss" } },
      limit: 1,
    });
    assert.deepEqual(
      about.docs[0]?.layout?.map((block) => block.blockType),
      ["textColumns", "textBlock", "cardSlider", "imageText", "contact"],
    );
    const grid = saved.layout?.find((block) => block.blockType === "productGrid");
    assert.ok(grid);
    // One card per family the seed knows that exists, each pointing at its family.
    assert.deepEqual(
      grid.products.map((item) => (typeof item.family === "object" ? item.family.key : null)),
      ["electric-counterbalance", "order-picker"],
    );
    const processBlock = saved.layout?.find((block) => block.blockType === "textGrid");
    assert.ok(processBlock);
    assert.equal(processBlock.cards.length, 3);
    assert.equal(
      new Set(
        processBlock.cards.map((card) =>
          typeof card.image === "object" ? card.image.id : card.image,
        ),
      ).size,
      3,
    );
    const repeated = await seedMilevasHomepage(payload, true);
    assert.equal(repeated.seeded, false);
    const images = await payload.find({ collection: "images", pagination: false });
    for (const image of images.docs) {
      for (const filename of [
        image.filename,
        image.sizes?.card?.filename,
        image.sizes?.thumbnail?.filename,
      ]) {
        if (filename) uploadedFiles.push(filename);
      }
    }
    console.log(
      "PASS: nine CMS blocks on the start page and Om oss, cards and columns pointing at their truck families, three distinct photos and repeat-safe seed.",
    );
  } finally {
    try {
      await payload?.db.pool?.end();
      await payload?.destroy();
    } finally {
      docker("dropdb", "-U", "payload", "--force", database);
      // Remove only the uploads belonging to this test's own documents.
      const { unlink } = await import("node:fs/promises");
      for (const filename of uploadedFiles) await unlink(`images/${filename}`).catch(() => {});
    }
  }
}
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
