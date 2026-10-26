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
 * The truck catalogue as Figma's examples: six families described as products (variants,
 * batteries, lift heights, extras), and the configurator settings. Placeholder data until Baoli's
 * own; each family is updated in place by its key, so pages that point at a family keep pointing
 * at it.
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
  capacityKg: number,
  sku: string,
  price: number,
  extra: Partial<ModelInput> = {},
): ModelInput => ({ capacityKg, sku, price, ...extra });

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
    travelSpeed: "15 / 15",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    models: [
      model(1500, "KBE 15 Li G1", 169000, {
        defaultSelected: true,
        weight: "2 980",
        turningRadius: "1870 / 1850",
      }),
      model(1800, "KBE 18 Li G1", 179900, { weight: "3 293", turningRadius: "1870 / 1850" }),
      model(2000, "KBE 20 Li G1", 196000, { weight: "3 450", turningRadius: "1870 / 1850" }),
      model(2500, "KBE 25 Li G1", 211000, { weight: "4 020", turningRadius: "2 190" }),
      model(3000, "KBE 30 Li G1", 246000, { weight: "4 510", turningRadius: "2 240" }),
      model(3500, "KBE 35 Li G1", 276000, { weight: "4 980", turningRadius: "2 290" }),
    ],
    batteries: [
      {
        label: "Standard",
        capacity: "76,8 V · 150 Ah",
        description: "För normal drift, upp till ett skift per dag.",
        price: 0,
        defaultSelected: true,
      },
      {
        label: "Stort batteri",
        capacity: "80 V 228 Ah",
        description: "För längre räckvidd och drift i flera skift.",
        price: 18000,
      },
    ],
    liftHeights: [
      { liftHeight: 4700, buildHeight: 2130, price: 0, defaultSelected: true },
      { liftHeight: 6000, buildHeight: 2765, price: 3500 },
    ],
    liftHeightHelp,
    extras: [
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
  {
    name: "Skjutstativ|truckar",
    singularName: "Skjutstativ|truck",
    key: "reach-truck",
    sortOrder: 20,
    description: "Skjutstativtruck för effektiv pallhantering på hög höjd.",
    image: "reach-truck",
    travelSpeed: "11 / 11",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    models: [
      model(1600, "KBR 16", 516000, {
        defaultSelected: true,
        weight: "2 950",
        turningRadius: "1 680",
      }),
      model(2000, "KBR 20", 546000, { weight: "3 210", turningRadius: "1 680" }),
    ],
    batteries: [{ label: "Standard", capacity: "48 V 465 Ah", price: 0, defaultSelected: true }],
    liftHeights: [
      { liftHeight: 6955, buildHeight: 3050, price: 0, defaultSelected: true },
      { liftHeight: 7255, buildHeight: 3200, price: 22000 },
      { liftHeight: 8255, buildHeight: 3550, price: 44000 },
    ],
    liftHeightHelp,
    extras: [
      { label: "Backsummer", price: 1200 },
      { label: "Trådlöst kamera|system (bak)", price: 6900 },
    ],
  },
  {
    name: "Låglyftare",
    singularName: "Låglyftare",
    key: "low-lift-pallet-truck",
    sortOrder: 30,
    image: "low-lift",
    travelSpeed: "6 / 6",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [
      model(1600, "EP 16-25", 38000, { defaultSelected: true }),
      model(2000, "EP20-111", 76000),
    ],
    batteries: [{ label: "Standard", capacity: "24 V 105 Ah", price: 0, defaultSelected: true }],
  },
  {
    name: "Ledstaplare",
    singularName: "Ledstaplare",
    key: "pedestrian-stacker",
    sortOrder: 40,
    image: "stacker",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [model(1200, "KBS 12N", 40000, { defaultSelected: true }), model(1600, "ES 16", 82000)],
    batteries: [{ label: "Standard", capacity: "24 V 150 Ah", price: 0, defaultSelected: true }],
  },
  {
    name: "Elektriska pallyftare",
    singularName: "Elektrisk pallyftare",
    key: "electric-pallet-truck",
    sortOrder: 50,
    image: "pallet-truck",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [
      model(1400, "KBP 14H", 32900),
      model(1500, "KBP 15E", 15900, { defaultSelected: true }),
      model(2000, "KBP 20", 46900),
    ],
    batteries: [{ label: "Standard", capacity: "24 V 20 Ah", price: 0, defaultSelected: true }],
  },
  {
    name: "Plocktruckar",
    singularName: "Plocktruck",
    key: "order-picker",
    sortOrder: 60,
    image: "order-picker",
    contactLink: { type: "external", url: "/#kontakt", label: "Kontakta oss" },
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
    // A list the family does not have is emptied, so a re-seed removes it.
    models: [],
    batteries: [],
    liftHeights: [],
    extras: [],
    ...seed,
    image: await uploadImage(payload, seed.image, seed.singularName),
    brochure: seed.models?.length ? brochure : undefined,
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
            monthlyPercent: 1.875,
            serviceAgreementEligible: true,
          },
          {
            key: "long-term-rental",
            label: "Långtidshyra",
            description: "Beräknad månadskostnad inklusive service enligt separat avtal.",
            kind: "monthly",
            months: 48,
            monthlyPercent: 1.91667,
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
