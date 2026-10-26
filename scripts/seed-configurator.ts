import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (process.env.APP_ENV === "production") {
  throw new Error("Configurator development seed is disabled when APP_ENV=production.");
}

/**
 * The truck catalogue as Figma's examples: six families with their models, steps and
 * specifications, and the configurator settings. Placeholder data until Baoli's own; each family is
 * updated in place by its key, so pages that point at a family keep pointing at it.
 */

type FamilyInput = RequiredDataFromCollectionSlug<"truck-families">;
type ModelInput = NonNullable<FamilyInput["models"]>[number];

type FamilySeed = Omit<FamilyInput, "image" | "brochure"> & {
  /** `scripts/figma-homepage-assets/hero-<image>.png`, the family's main image. */
  image: string;
};

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brochurePath = path.join(root, "src/payload/seed/assets/produktbroschyr-placeholder.pdf");
const brochureFilename = "produktbroschyr-placeholder.pdf";

const model = (
  label: string,
  sku: string,
  price: number,
  capacityKg: number,
  extra: Partial<ModelInput> = {},
): ModelInput => ({ label, sku, price, capacityKg, ...extra });

const standardDelivery = "4–6 veckor";

const liftHeightHelp = "Behöver du hjälp med andra mastalternativ?";

const families: FamilySeed[] = [
  {
    name: "Elektriska motvikts|truckar",
    singularName: "Elektrisk motvikts|truck",
    key: "electric-counterbalance",
    sortOrder: 10,
    description: "Elektrisk motviktstruck för lager, terminal och industri.",
    image: "counterbalance",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    specs: {
      battery: "80 V 228 Ah",
      travelSpeed: "15 / 15",
      batteryCapacity: "76,8 V · 150 / 228 Ah",
      turningRadius: "1870 / 1850",
      buildHeight: "2130",
    },
    modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
    models: [
      model("1,5 ton", "KBE 15 Li G1", 169000, 1500, {
        defaultSelected: true,
        specs: { weight: "2 980" },
      }),
      model("1,8 ton", "KBE 18 Li G1", 179900, 1800, { specs: { weight: "3 293" } }),
      model("2,0 ton", "KBE 20 Li G1", 196000, 2000, { specs: { weight: "3 450" } }),
      model("2,5 ton", "KBE 25 Li G1", 211000, 2500, {
        specs: { weight: "4 020", turningRadius: "2 190" },
      }),
      model("3,0 ton", "KBE 30 Li G1", 246000, 3000, {
        specs: { weight: "4 510", turningRadius: "2 240" },
      }),
      model("3,5 ton", "KBE 35 Li G1", 276000, 3500, {
        specs: { weight: "4 980", turningRadius: "2 290" },
      }),
    ],
    battery: {
      options: [
        {
          label: "Standard",
          description: "150 Ah för normal drift, upp till ett skift per dag.",
          price: 0,
          defaultSelected: true,
        },
        {
          label: "Stort batteri",
          description: "228 Ah för längre räckvidd och drift i flera skift.",
          price: 18000,
        },
      ],
    },
    liftHeight: {
      help: liftHeightHelp,
      options: [
        { label: "4700 mm", buildHeight: "2130", price: 0, defaultSelected: true },
        { label: "6000 mm", buildHeight: "2765", price: 3500 },
      ],
    },
    extras: {
      options: [
        { label: "Backsummer", price: 1200 },
        { label: "Fasthållnings|system", price: 14500 },
        { label: "Trådlöst kamera|system (bak)", price: 6900 },
        {
          label: "Sidoförskjutning och gaffel|spridning",
          description: "Ändra gaffelavståndet från förarplatsen.",
          price: 9500,
        },
      ],
    },
  },
  {
    name: "Skjutstativ|truckar",
    singularName: "Skjutstativ|truck",
    key: "reach-truck",
    sortOrder: 20,
    description: "Skjutstativtruck för effektiv pallhantering på hög höjd.",
    image: "reach-truck",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    specs: {
      battery: "48 V 465 Ah",
      travelSpeed: "11 / 11",
      batteryCapacity: "48 V · 465 Ah",
      turningRadius: "1 680",
      weight: "2 950",
    },
    modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
    models: [
      model("1,6 ton", "KBR 16", 516000, 1600, { defaultSelected: true }),
      model("2,0 ton", "KBR 20", 546000, 2000, { specs: { weight: "3 210" } }),
    ],
    liftHeight: {
      help: liftHeightHelp,
      options: [
        { label: "6955 mm", buildHeight: "3 050", price: 0, defaultSelected: true },
        { label: "7255 mm", buildHeight: "3 200", price: 22000 },
        { label: "8255 mm", buildHeight: "3 550", price: 44000 },
      ],
    },
    extras: {
      options: [
        { label: "Backsummer", price: 1200 },
        { label: "Trådlöst kamera|system (bak)", price: 6900 },
      ],
    },
  },
  {
    name: "Låglyftare",
    singularName: "Låglyftare",
    key: "low-lift-pallet-truck",
    sortOrder: 30,
    image: "low-lift",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    specs: { battery: "24 V 105 Ah", travelSpeed: "6 / 6" },
    modelChoice: { label: "Utförande", heading: "Välj utförande" },
    models: [
      model("Utan åkplatta", "EP 16-25", 38000, 1600, { defaultSelected: true }),
      model("Med åkplatta", "EP20-111", 76000, 2000, { specs: { travelSpeed: "10 / 12" } }),
    ],
  },
  {
    name: "Ledstaplare",
    singularName: "Ledstaplare",
    key: "pedestrian-stacker",
    sortOrder: 40,
    image: "stacker",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    specs: { battery: "24 V 150 Ah" },
    modelChoice: { label: "Serie", heading: "Välj serie" },
    models: [
      model("KBS-serien", "KBS 12N", 40000, 1200, { defaultSelected: true }),
      model("ES-serien", "ES 16", 82000, 1600),
    ],
  },
  {
    name: "Elektriska pallyftare",
    singularName: "Elektrisk pallyftare",
    key: "electric-pallet-truck",
    sortOrder: 50,
    image: "pallet-truck",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    specs: { battery: "24 V 20 Ah" },
    modelChoice: { label: "Modell", heading: "Välj modell" },
    models: [
      model("KBP 15E", "KBP 15E", 15900, 1500, { defaultSelected: true }),
      model("KBP 14H", "KBP 14H", 32900, 1400),
      model("KBP 15L", "KBP 15L", 39900, 1500),
      model("KBP 20", "KBP 20", 46900, 2000),
    ],
  },
  {
    name: "Plocktruckar",
    singularName: "Plocktruck",
    key: "order-picker",
    sortOrder: 60,
    image: "order-picker",
    configurable: false,
    contactLink: { type: "external", url: "/#kontakt", label: "Kontakta oss" },
    modelChoice: { label: "Modell", heading: "Välj modell" },
  },
];

async function uploadImage(payload: Payload, name: string, alt: string) {
  const filename = `truck-family-${name}.png`;
  const existing = await payload.find({
    collection: "images",
    overrideAccess: true,
    limit: 1,
    where: { filename: { equals: filename } },
  });
  if (existing.docs[0]) return existing.docs[0].id;
  const { readFile } = await import("node:fs/promises");
  const data = await readFile(path.join(root, "scripts/figma-homepage-assets", `hero-${name}.png`));
  const uploaded = await payload.create({
    collection: "images",
    locale: "sv",
    data: { alt },
    file: { data, name: filename, size: data.length, mimetype: "image/png" },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  return uploaded.id;
}

async function placeholderBrochure(payload: Payload) {
  const existing = await payload.find({
    collection: "documents",
    overrideAccess: true,
    limit: 1,
    where: { filename: { equals: brochureFilename } },
  });
  if (existing.docs[0]) return existing.docs[0].id;

  const created = await payload.create({
    collection: "documents",
    locale: "sv",
    data: {
      title: "Produktbroschyr - placeholder",
      description: "Tillfällig broschyr som ersätts av produktens riktiga datablad.",
    },
    filePath: brochurePath,
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  return created.id;
}

async function upsertFamily(payload: Payload, seed: FamilySeed, brochure: string) {
  const data: FamilyInput = {
    // A step the family does not have is emptied, so a re-seed removes it.
    battery: { options: [] },
    liftHeight: { options: [] },
    extras: { options: [] },
    ...seed,
    image: await uploadImage(payload, seed.image, seed.singularName),
    brochure: seed.configurable === false ? undefined : brochure,
    _status: "published",
  };
  const existing = await payload.find({
    collection: "truck-families",
    locale: "sv",
    draft: true,
    overrideAccess: true,
    limit: 1,
    where: { key: { equals: seed.key } },
  });
  const options = {
    collection: "truck-families" as const,
    locale: "sv" as const,
    data,
    draft: false,
    overrideAccess: true,
    context: { disableRevalidate: true },
  };
  if (existing.docs[0]) {
    await payload.update({ ...options, id: existing.docs[0].id });
  } else {
    await payload.create(options);
  }
}

async function seed() {
  const { default: config } = await import("../src/payload.config.ts");
  const { getPayload } = await import("payload");
  const payload = await getPayload({ config });
  try {
    const brochure = await placeholderBrochure(payload);

    for (const family of families) {
      await upsertFamily(payload, family, brochure);
    }

    await payload.updateGlobal({
      slug: "configurator-settings",
      locale: "sv",
      draft: false,
      overrideAccess: true,
      context: { disableRevalidate: true },
      data: {
        quoteValidityDays: 14,
        serviceAgreement: {
          label: "Serviceavtal",
          description: "Årlig kostnad. Faktureras separat.",
          annualPrice: 2856,
        },
        financingMethods: [
          {
            key: "purchase",
            label: "Köp",
            description: "Betala hela beloppet och äg trucken.",
            kind: "purchase",
            serviceAgreementEligible: true,
          },
          {
            key: "leasing",
            label: "Leasing",
            description: "Fast beräknad månadskostnad.",
            kind: "monthly",
            months: 48,
            monthlyFactor: 0.01875,
            serviceAgreementEligible: true,
          },
          {
            key: "long-term-rental",
            label: "Långtidshyra",
            description: "Beräknad månadskostnad inklusive service enligt separat avtal.",
            kind: "monthly",
            months: 48,
            monthlyFactor: 0.0191667,
            serviceAgreementEligible: false,
          },
        ],
        warrantyNote:
          "Omfattar fabrikationsfel på drivlina, elsystem och chassi. Slitdelar och handhavandefel ingår inte.",
        nextSteps: [
          { heading: "Bekräftelse", text: "Du får en bekräftelse direkt via mejl." },
          { heading: "Personlig kontakt", text: "En säljare hör av sig inom kort." },
          { heading: "Plockning", text: "Din truck plockas ut från Baolis lager i Rolo, Italien." },
          { heading: "Avtal", text: "Du får ett digitalt avtal att signera (BankID)." },
          { heading: "Leverans", text: "Beräknad leverans 4–6 veckor." },
        ],
        _status: "published",
      },
    });

    const pages = await payload.find({
      collection: "pages",
      locale: "sv",
      draft: true,
      overrideAccess: true,
      limit: 1,
      where: { slug: { equals: "configurator" } },
    });
    const existingPage = pages.docs[0];

    if (!existingPage) {
      await payload.create({
        collection: "pages",
        locale: "sv",
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          title: "Configurator",
          slug: "configurator",
          // Light grey, as Figma's Konfigurator page.
          background: "light",
          _status: "published",
          layout: [{ blockType: "configurator" }],
        },
      });
    } else if (!existingPage.layout?.some((block) => block.blockType === "configurator")) {
      await payload.update({
        collection: "pages",
        id: existingPage.id,
        locale: "sv",
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          layout: [...(existingPage.layout ?? []), { blockType: "configurator" }],
        },
      });
    }

    payload.logger.info("Seeded the truck catalogue, the configurator settings and page.");
  } finally {
    await payload.destroy();
  }
}

await seed();
process.exit(0);
