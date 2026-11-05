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
    // The article modules, with Text's rich text body and List's localized rows.
    const articleImage = images.docs[0]?.id;
    assert.ok(articleImage);
    const body = {
      root: {
        type: "root",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [
          {
            type: "paragraph",
            version: 1,
            direction: null,
            format: "",
            indent: 0,
            textFormat: 0,
            children: [
              {
                type: "text",
                version: 1,
                text: "Brödtext",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
        ],
      },
    };
    const article = await payload.create({
      collection: "pages",
      locale: "sv",
      context: { disableRevalidate: true },
      data: {
        title: "Artikel",
        slug: "artikel",
        _status: "published",
        layout: [
          { blockType: "articleHeading", heading: "Rubrik", image: articleImage },
          {
            blockType: "articleText",
            placement: "right",
            heading: "Text XL",
            body,
            image: articleImage,
          },
          { blockType: "articleList", placement: "left", items: [{ text: "Rad" }] },
          { blockType: "articleImage", image: articleImage },
        ],
      },
    });
    const savedArticle = await payload.findByID({
      collection: "pages",
      id: article.id,
      locale: "sv",
      depth: 1,
    });
    assert.deepEqual(
      savedArticle.layout?.map((block) => block.blockType),
      ["articleHeading", "articleText", "articleList", "articleImage"],
    );
    const articleText = savedArticle.layout?.find((block) => block.blockType === "articleText");
    assert.equal(articleText?.placement, "right");
    assert.deepEqual(articleText?.body, body);
    const articleList = savedArticle.layout?.find((block) => block.blockType === "articleList");
    assert.equal(articleList?.items[0]?.text, "Rad");
    await assert.rejects(
      payload.create({
        collection: "pages",
        locale: "sv",
        context: { disableRevalidate: true },
        data: {
          title: "Artikel utan bild",
          slug: "artikel-utan-bild",
          layout: [{ blockType: "articleImage" } as never],
        },
      }),
    );
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
      "PASS: nine CMS blocks on the start page and Om oss, the article modules, cards and columns pointing at their truck families, three distinct photos and repeat-safe seed.",
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
