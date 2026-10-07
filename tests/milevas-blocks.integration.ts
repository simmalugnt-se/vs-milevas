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
    await payload.create({
      collection: "truck-families",
      locale: "sv",
      context: { disableRevalidate: true },
      data: {
        name: "Testtruck",
        key: "electric-counterbalance",
        sortOrder: 0,
        basePrice: 169900,
        deliveryTime: "1 vecka",
        warranty: "Test",
        _status: "published",
        steps: [
          {
            key: "capacity",
            label: "Kapacitet",
            heading: "Välj kapacitet",
            groups: [
              {
                key: "capacity",
                label: "Kapacitet",
                selectionMode: "single",
                required: true,
                options: [{ key: "small", label: "1.5 ton", priceMode: "included", price: 0 }],
              },
            ],
          },
        ],
      },
    });
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
      ["milevasHero", "productGrid", "textGrid", "textBoxinfo"],
    );
    const grid = saved.layout?.find((block) => block.blockType === "productGrid");
    assert.ok(grid);
    assert.equal(grid.products.length, 6);
    assert.ok(grid.products[0].family && typeof grid.products[0].family === "object");
    assert.equal(grid.products[0].family.key, "electric-counterbalance");
    assert.ok(
      grid.products.every((item) => item.image && typeof item.image === "object" && item.image.url),
    );
    assert.equal(grid.products[5].family, undefined);
    assert.equal(grid.products[5].link?.url, "/#kontakt");
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
    // Editing the English copy must preserve Swedish content and the shared page structure.
    const englishLayout = saved.layout?.map((block) =>
      block.blockType === "textGrid" ? { ...block, heading: "How it works" } : block,
    );
    await payload.update({
      collection: "pages",
      id: saved.id,
      locale: "en",
      context: { disableRevalidate: true },
      data: { layout: englishLayout },
    });
    const english = await payload.findByID({ collection: "pages", id: saved.id, locale: "en" });
    const swedish = await payload.findByID({ collection: "pages", id: saved.id, locale: "sv" });
    assert.equal(
      english.layout?.find((block) => block.blockType === "textGrid")?.heading,
      "How it works",
    );
    assert.equal(
      swedish.layout?.find((block) => block.blockType === "textGrid")?.heading,
      "Så enkelt\nfungerar det",
    );
    const repeated = await seedMilevasHomepage(payload, true);
    assert.equal(repeated.seeded, false);
    assert.equal(
      (await payload.findByID({ collection: "pages", id: saved.id, locale: "en" })).layout?.find(
        (block) => block.blockType === "textGrid",
      )?.heading,
      "How it works",
    );
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
      "PASS: four CMS blocks, populated truck and image relationships, six products, three distinct photos, localized copy and repeat-safe seed.",
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
