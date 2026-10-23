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
 * The truck catalogue as Figma's examples: the specification types, six families with their
 * models and choices, and the configurator settings. Placeholder data until Baoli's own; each
 * family is updated in place by its key, so pages that point at a family keep pointing at it.
 */

type FamilyInput = RequiredDataFromCollectionSlug<"truck-families">;
type ModelInput = NonNullable<FamilyInput["models"]>[number];
type ChoiceInput = NonNullable<FamilyInput["choices"]>[number];
type OptionInput = ChoiceInput["options"][number];
type Specs = Record<string, string>;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brochurePath = path.join(root, "src/payload/seed/assets/produktbroschyr-placeholder.pdf");
const brochureFilename = "produktbroschyr-placeholder.pdf";

/** The specification types, in the quote's order; the battery also shows on the product card. */
const specTypes = [
  { key: "battery", label: "Batteri", sortOrder: 10, onCard: true, inQuote: false },
  { key: "turning-radius", label: "Vändradie", unit: "mm", sortOrder: 20 },
  { key: "travel-speed", label: "Körhastighet (lastad/olastad)", unit: "km/h", sortOrder: 30 },
  { key: "battery-capacity", label: "Batterikapacitet", sortOrder: 40 },
  { key: "weight", label: "Vikt", unit: "kg", sortOrder: 50 },
  { key: "build-height", label: "Truckens bygghöjd", unit: "mm", sortOrder: 60 },
];

type FamilySeed = Omit<FamilyInput, "specs" | "models" | "choices" | "image" | "brochure"> & {
  /** `scripts/figma-homepage-assets/hero-<image>.png`, the family's main image. */
  image: string;
  specs?: Specs;
  models?: Array<Omit<ModelInput, "specs"> & { specs?: Specs }>;
  choices?: Array<Omit<ChoiceInput, "options"> & { options: OptionSeed[] }>;
};
type OptionSeed = Omit<OptionInput, "specs"> & { specs?: Specs };

const model = (
  key: string,
  label: string,
  price: number,
  capacityKg: number,
  extra: Partial<Omit<ModelInput, "specs">> & { specs?: Specs } = {},
) => ({ key, label, price, capacityKg, ...extra });

const option = (
  key: string,
  label: string,
  price = 0,
  extra: Partial<OptionSeed> = {},
): OptionSeed => ({ key, label, price, ...extra });

const standardDelivery = "4–6 veckor";

const families: FamilySeed[] = [
  {
    name: "Elektriska motviktstruckar",
    singularName: "Elektrisk motviktstruck",
    key: "electric-counterbalance",
    sortOrder: 10,
    description: "Elektrisk motviktstruck för lager, terminal och industri.",
    image: "counterbalance",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    specs: {
      battery: "80 V 228 Ah",
      "travel-speed": "15 / 15",
      "battery-capacity": "76,8 V · 150 / 228 Ah",
      "turning-radius": "1870 / 1850",
      "build-height": "2130",
    },
    modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
    models: [
      model("kbet-15", "1,5 ton", 169000, 1500, {
        sku: "KBET 15 Li G1",
        defaultSelected: true,
        description: "Kompakt för trånga lager.",
        specs: { weight: "2 980" },
      }),
      model("kbet-18", "1,8 ton", 179900, 1800, {
        sku: "KBET 18 Li G1",
        description: "Det vanligaste valet.",
        specs: { weight: "3 293" },
      }),
      model("kbet-20", "2,0 ton", 196000, 2000, {
        sku: "KBET 20 Li G1",
        description: "För tyngre pallar.",
        specs: { weight: "3 450" },
      }),
      model("kbe-25", "2,5 ton", 211000, 2500, {
        sku: "KBE 25 Li G1",
        description: "Fyrhjulig, för ute och inne.",
        specs: { weight: "4 020", "turning-radius": "2 190" },
      }),
      model("kbe-30", "3,0 ton", 246000, 3000, {
        sku: "KBE 30 Li G1",
        description: "För terminal och industri.",
        specs: { weight: "4 510", "turning-radius": "2 240" },
      }),
      model("kbe-35", "3,5 ton", 276000, 3500, {
        sku: "KBE 35 Li G1",
        description: "Den största i serien.",
        specs: { weight: "4 980", "turning-radius": "2 290" },
      }),
    ],
    choices: [
      {
        key: "battery",
        label: "Batteri",
        heading: "Välj batteri",
        selectionMode: "single",
        required: true,
        options: [
          option("standard-li-ion", "Standardbatteri (Li-Ion)", 0, {
            defaultSelected: true,
            description: "150 Ah för normal drift, upp till ett skift per dag.",
          }),
          option("large-li-ion", "Stort batteri (Li-Ion)", 18000, {
            description: "228 Ah för längre räckvidd och drift i flera skift.",
          }),
        ],
      },
      {
        key: "wheels",
        label: "Hjulantal",
        heading: "Välj hjulantal",
        selectionMode: "single",
        required: true,
        options: [
          option("three-wheel", "3-hjulig (KBET)", 0, {
            defaultSelected: true,
            description: "Smidig i trånga utrymmen med mindre vändradie.",
            models: ["kbet-15", "kbet-18", "kbet-20"],
          }),
          option("four-wheel", "4-hjulig (KBE)", 4000, {
            defaultSelected: true,
            description: "Stabilt fyrhjuligt utförande.",
          }),
        ],
      },
      {
        key: "lift-height",
        label: "Lyfthöjd",
        heading: "Välj lyfthöjd",
        help: "Behöver du hjälp med andra mastalternativ?",
        selectionMode: "single",
        required: true,
        options: [
          option("4700-mm", "Lyfthöjd 4700 mm", 0, {
            defaultSelected: true,
            specs: { "build-height": "2130" },
          }),
          option("6000-mm", "Lyfthöjd 6000 mm", 3500, { specs: { "build-height": "2765" } }),
        ],
      },
      {
        key: "side-shift",
        label: "Sidoförskjutning",
        heading: "Gafflar och aggregat",
        selectionMode: "single",
        required: true,
        options: [
          option("side-shift", "Sidoförskjutning", 0, {
            defaultSelected: true,
            description: "Exakt positionering av lasten i sidled.",
          }),
          option("side-shift-fork-spread", "Sidoförskjutning och gaffelspridning", 9500, {
            description: "Ändra gaffelavståndet från förarplatsen.",
          }),
        ],
      },
      {
        key: "extras",
        label: "Tillval",
        heading: "Välj tillval",
        selectionMode: "multiple",
        required: false,
        options: [
          option("reverse-alarm", "Backsummer", 1200),
          option("rear-camera", "Trådlöst kamerasystem (bak)", 6900),
          option("restraint-system", "Fasthållningssystem", 14500),
        ],
      },
    ],
  },
  {
    name: "Skjutstativtruckar",
    singularName: "Skjutstativtruck",
    key: "reach-truck",
    sortOrder: 20,
    description: "Skjutstativtruck för effektiv pallhantering på hög höjd.",
    image: "reach-truck",
    deliveryTime: standardDelivery,
    warranty: "4 år",
    specs: {
      battery: "48 V 465 Ah",
      "travel-speed": "11 / 11",
      "battery-capacity": "48 V · 465 Ah",
      "turning-radius": "1 680",
      weight: "2 950",
    },
    modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
    models: [
      model("kbr-16", "1,6 ton", 516000, 1600, { sku: "KBR 16", defaultSelected: true }),
      model("kbr-20", "2,0 ton", 546000, 2000, { sku: "KBR 20", specs: { weight: "3 210" } }),
    ],
    choices: [
      {
        key: "lift-height",
        label: "Lyfthöjd",
        heading: "Välj lyfthöjd",
        help: "Behöver du hjälp med andra mastalternativ?",
        selectionMode: "single",
        required: true,
        options: [
          option("6955-mm", "Lyfthöjd 6955 mm", 0, {
            defaultSelected: true,
            specs: { "build-height": "3 050" },
          }),
          option("7255-mm", "Lyfthöjd 7255 mm", 22000, { specs: { "build-height": "3 200" } }),
          option("8255-mm", "Lyfthöjd 8255 mm", 44000, { specs: { "build-height": "3 550" } }),
        ],
      },
      {
        key: "extras",
        label: "Tillval",
        heading: "Välj tillval",
        selectionMode: "multiple",
        required: false,
        options: [
          option("reverse-alarm", "Backsummer", 1200),
          option("rear-camera", "Trådlöst kamerasystem (bak)", 6900),
        ],
      },
    ],
  },
  {
    name: "Låglyftare",
    singularName: "Låglyftare",
    key: "low-lift-pallet-truck",
    sortOrder: 30,
    image: "low-lift",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    specs: { battery: "24 V 105 Ah", "travel-speed": "6 / 6" },
    modelChoice: { label: "Utförande", heading: "Välj utförande" },
    models: [
      model("ep-16", "Utan åkplatta", 38000, 1600, { sku: "EP 16-25", defaultSelected: true }),
      model("ep-20", "Med åkplatta", 76000, 2000, {
        sku: "EP20-111",
        specs: { "travel-speed": "10 / 12" },
      }),
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
      model("kbs-12", "KBS-serien", 40000, 1200, {
        sku: "KBS 12N",
        defaultSelected: true,
        description: "Kapacitet 1,2 ton och lyfthöjd upp till 5,5 meter.",
      }),
      model("es-16", "ES-serien", 82000, 1600, {
        sku: "ES 16",
        description: "Kapacitet upp till 1,6 ton och lyfthöjd upp till 5,5 meter.",
      }),
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
      model("kbp-15e", "KBP 15E", 15900, 1500, {
        sku: "KBP 15E",
        defaultSelected: true,
        description: "Extremt kompakt utförande.",
      }),
      model("kbp-14h", "KBP 14H", 32900, 1400, { sku: "KBP 14H" }),
      model("kbp-15l", "KBP 15L", 39900, 1500, { sku: "KBP 15L" }),
      model("kbp-20", "KBP 20", 46900, 2000, { sku: "KBP 20" }),
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

async function upsertSpecs(payload: Payload) {
  const ids = new Map<string, string>();
  for (const spec of specTypes) {
    const existing = await payload.find({
      collection: "truck-specs",
      locale: "sv",
      limit: 1,
      overrideAccess: true,
      where: { key: { equals: spec.key } },
    });
    const data = { unit: undefined, onCard: false, inQuote: true, ...spec };
    const doc = existing.docs[0]
      ? await payload.update({
          collection: "truck-specs",
          id: existing.docs[0].id,
          locale: "sv",
          data,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
      : await payload.create({
          collection: "truck-specs",
          locale: "sv",
          data,
          overrideAccess: true,
          context: { disableRevalidate: true },
        });
    ids.set(spec.key, doc.id);
  }
  return ids;
}

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

const specRows = (specs: Specs | undefined, ids: Map<string, string>) =>
  Object.entries(specs ?? {}).map(([key, value]) => {
    const spec = ids.get(key);
    if (!spec) throw new Error(`Okänd specifikation i seeden: ${key}`);
    return { spec, value };
  });

async function upsertFamily(
  payload: Payload,
  seed: FamilySeed,
  specIDs: Map<string, string>,
  brochure: string,
) {
  const data: FamilyInput = {
    ...seed,
    image: await uploadImage(payload, seed.image, seed.singularName),
    brochure: seed.configurable === false ? undefined : brochure,
    specs: specRows(seed.specs, specIDs),
    models: (seed.models ?? []).map(({ specs, ...rest }) => ({
      ...rest,
      specs: specRows(specs, specIDs),
    })),
    choices: (seed.choices ?? []).map(({ options, ...rest }) => ({
      ...rest,
      options: options.map(({ specs, ...option }) => ({
        ...option,
        specs: specRows(specs, specIDs),
      })),
    })),
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
    const [specIDs, brochure] = await Promise.all([
      upsertSpecs(payload),
      placeholderBrochure(payload),
    ]);

    for (const family of families) {
      await upsertFamily(payload, family, specIDs, brochure);
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
