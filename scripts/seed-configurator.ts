import dotenv from "dotenv";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (process.env.APP_ENV === "production") {
  throw new Error("Configurator development seed is disabled when APP_ENV=production.");
}

type FamilyInput = RequiredDataFromCollectionSlug<"truck-families">;
type StepInput = NonNullable<FamilyInput["steps"]>[number];
type GroupInput = StepInput["groups"][number];
type OptionInput = GroupInput["options"][number];

const option = (
  key: string,
  label: string,
  priceMode: OptionInput["priceMode"] = "included",
  price = 0,
  extra: Partial<OptionInput> = {},
): OptionInput => ({
  key,
  label,
  priceMode,
  price,
  defaultSelected: false,
  ...extra,
});

const group = (
  key: string,
  label: string,
  options: OptionInput[],
  extra: Partial<GroupInput> = {},
): GroupInput => ({
  key,
  label,
  selectionMode: "single",
  required: true,
  options,
  ...extra,
});

const step = (key: string, label: string, heading: string, groups: GroupInput[]): StepInput => ({
  key,
  label,
  heading,
  groups,
});

const standardDelivery = "4–6 veckor";

const families: FamilyInput[] = [
  {
    name: "Elektriska motviktstruckar",
    key: "electric-counterbalance",
    sortOrder: 10,
    description: "Elektrisk motviktstruck för lager, terminal och industri.",
    basePrice: 169900,
    sku: "KBET 15 Li G1",
    deliveryTime: standardDelivery,
    warranty: "4 års garanti",
    _status: "published",
    steps: [
      step("capacity", "Kapacitet", "Välj lyftkapacitet", [
        group("capacity", "Lyftkapacitet", [
          option("1-5-ton", "1,5 ton", "replaceBase", 169000, {
            defaultSelected: true,
            sku: "KBET 15 Li G1",
          }),
          option("1-8-ton", "1,8 ton", "replaceBase", 184000),
          option("2-0-ton", "2,0 ton", "replaceBase", 196000),
          option("2-5-ton", "2,5 ton", "replaceBase", 211000),
          option("3-0-ton", "3,0 ton", "replaceBase", 246000),
          option("3-5-ton", "3,5 ton", "replaceBase", 276000),
        ]),
      ]),
      step("battery", "Batteri", "Välj batteri", [
        group("battery", "Batteri", [
          option("standard-li-ion", "Standardbatteri (Li-Ion)", "included", 0, {
            defaultSelected: true,
            description: "150 Ah för normal drift, upp till ett skift per dag.",
          }),
          option("large-li-ion", "Stort batteri (Li-Ion)", "add", 18000, {
            description: "228 Ah för längre räckvidd och drift i flera skift.",
          }),
        ]),
      ]),
      step("wheels", "Hjulantal", "Välj hjulantal", [
        group("wheels", "Hjulantal", [
          option("three-wheel", "3-hjulig (KBET)", "included", 0, {
            defaultSelected: true,
            sku: "KBET 15 Li G1",
            description: "Smidig i trånga utrymmen med mindre vändradie.",
          }),
          option("four-wheel", "4-hjulig (KBE)", "add", 4000, {
            sku: "KBE 15 Li G1",
            description: "Stabilt fyrhjuligt utförande.",
          }),
        ]),
      ]),
      step("lift-height", "Lyfthöjd", "Välj lyfthöjd", [
        group("lift-height", "Lyfthöjd", [
          option("4700-mm", "4700 mm", "included", 0, {
            defaultSelected: true,
            specifications: [{ label: "Truckens bygghöjd", value: "2130 mm" }],
          }),
          option("6000-mm", "6000 mm", "add", 3500, {
            specifications: [{ label: "Truckens bygghöjd", value: "2765 mm" }],
          }),
        ]),
      ]),
      step("attachments", "Aggregat", "Gafflar och aggregat", [
        group("fork-length", "Gaffellängd", [
          option("1200-mm", "Standard (1200 mm)", "included", 0, {
            defaultSelected: true,
            description: "Standardlängd för EU-pall.",
          }),
          option("1600-mm", "Förlängningsgafflar (1600 mm)", "add", 6500),
        ]),
        group("side-shift", "Sidoförskjutning", [
          option("side-shift", "Sidoförskjutning", "included", 0, {
            defaultSelected: true,
            description: "Exakt positionering av lasten i sidled.",
          }),
          option("side-shift-fork-spread", "Sidoförskjutning och gaffelspridning", "add", 9500),
        ]),
      ]),
      step("cabin", "Hytt", "Välj hytt eller förarskydd", [
        group("cabin", "Hytt", [
          option("overhead-guard", "Med förarskydd", "included", 0, {
            defaultSelected: true,
          }),
          option("heated-cabin", "Med hytt", "add", 22000, {
            description: "Ståldörrar och uppvärmning.",
          }),
        ]),
      ]),
      step("extras", "Tillval", "Välj tillval", [
        group(
          "bluespot",
          "Bluespot",
          [
            option("none", "Ingen", "included", 0, { defaultSelected: true }),
            option("front", "Fram", "add", 2400),
            option("rear", "Bak", "add", 2400),
            option("front-rear", "Fram och bak", "add", 4200),
          ],
          { required: false },
        ),
        group(
          "other-extras",
          "Övriga tillval",
          [
            option("reverse-alarm", "Backsummer", "add", 1200),
            option("restraint-system", "Fasthållningssystem", "add", 14500),
            option("rear-camera", "Trådlöst kamerasystem (bak)", "add", 6900),
          ],
          { selectionMode: "multiple", required: false },
        ),
      ]),
    ],
  },
  {
    name: "Skjutstativtruck",
    key: "reach-truck",
    sortOrder: 20,
    description: "Skjutstativtruck för effektiv pallhantering på hög höjd.",
    basePrice: 516000,
    sku: "KBR 16",
    deliveryTime: standardDelivery,
    warranty: "4 års garanti",
    _status: "published",
    steps: [
      step("capacity", "Kapacitet", "Välj lyftkapacitet", [
        group("capacity", "Lyftkapacitet", [
          option("1-6-ton", "1,6 ton", "replaceBase", 516000, {
            defaultSelected: true,
            sku: "KBR 16",
          }),
          option("2-0-ton", "2,0 ton", "replaceBase", 546000, { sku: "KBR 20" }),
        ]),
      ]),
      step("lift-height", "Lyfthöjd", "Välj lyfthöjd", [
        group("lift-height", "Lyfthöjd", [
          option("6955-mm", "6955 mm", "included", 0, { defaultSelected: true }),
          option("7255-mm", "7255 mm", "add", 22000),
          option("8255-mm", "8255 mm", "add", 44000),
        ]),
      ]),
      step("extras", "Tillval", "Välj tillval", [
        group(
          "reach-extras",
          "Tillval",
          [
            option("reverse-alarm", "Backsummer", "add", 1200),
            option("rear-camera", "Trådlöst kamerasystem (bak)", "add", 6900),
          ],
          { selectionMode: "multiple", required: false },
        ),
      ]),
    ],
  },
  {
    name: "Ledstaplare",
    key: "pedestrian-stacker",
    sortOrder: 30,
    basePrice: 40000,
    sku: "KBS 12N",
    deliveryTime: standardDelivery,
    warranty: "12 månaders garanti",
    _status: "published",
    steps: [
      step("series", "Serie", "Välj serie", [
        group("series", "Serie", [
          option("kbs", "KBS-serien", "replaceBase", 40000, {
            defaultSelected: true,
            sku: "KBS 12N",
            description: "Kapacitet 1,2 ton och lyfthöjd upp till 5,5 meter.",
          }),
          option("es", "ES-serien", "replaceBase", 82000, {
            sku: "ES 16",
            description: "Kapacitet upp till 1,6 ton och lyfthöjd upp till 5,5 meter.",
          }),
        ]),
      ]),
    ],
  },
  {
    name: "Låglyftare",
    key: "low-lift-pallet-truck",
    sortOrder: 40,
    basePrice: 29900,
    deliveryTime: standardDelivery,
    warranty: "12 månaders garanti",
    _status: "published",
    steps: [
      step("execution", "Utförande", "Välj utförande", [
        group("execution", "Utförande", [
          option("walk-behind", "Utan åkplatta", "replaceBase", 38000, {
            defaultSelected: true,
            sku: "EP 16-25",
          }),
          option("ride-on", "Med åkplatta", "replaceBase", 76000, { sku: "EP20-111" }),
        ]),
      ]),
    ],
  },
  {
    name: "Elektriska pallyftare",
    key: "electric-pallet-truck",
    sortOrder: 50,
    basePrice: 15900,
    sku: "KBP 15E",
    deliveryTime: standardDelivery,
    warranty: "12 månaders garanti",
    _status: "published",
    steps: [
      step("model", "Modell", "Välj modell", [
        group("model", "Modell", [
          option("kbp-15e", "KBP 15E", "replaceBase", 15900, {
            defaultSelected: true,
            sku: "KBP 15E",
            description: "Kapacitet 1,5 ton. Extremt kompakt utförande.",
          }),
          option("kbp-15l", "KBP 15L", "replaceBase", 39900, { sku: "KBP 15L" }),
          option("kbp-14h", "KBP 14H", "replaceBase", 32900, { sku: "KBP 14H" }),
          option("kbp-20", "KBP 20", "replaceBase", 46900, { sku: "KBP 20" }),
        ]),
      ]),
    ],
  },
];

async function upsertFamily(payload: Payload, data: FamilyInput) {
  const existing = await payload.find({
    collection: "truck-families",
    locale: "sv",
    draft: true,
    overrideAccess: true,
    limit: 1,
    where: { key: { equals: data.key } },
  });

  if (existing.docs[0]) {
    await payload.update({
      collection: "truck-families",
      id: existing.docs[0].id,
      locale: "sv",
      data,
      draft: false,
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    return;
  }

  await payload.create({
    collection: "truck-families",
    locale: "sv",
    data,
    draft: false,
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
}

async function seed() {
  const { default: config } = await import("../src/payload.config.ts");
  const { getPayload } = await import("payload");
  const payload = await getPayload({ config });

  for (const family of families) {
    await upsertFamily(payload, family);
  }

  await payload.updateGlobal({
    slug: "configurator-settings",
    locale: "sv",
    draft: false,
    overrideAccess: true,
    context: { disableRevalidate: true },
    data: {
      quoteValidityDays: 14,
      financingMethods: [
        {
          key: "purchase",
          label: "Köp",
          description: "Betala hela beloppet och äg trucken.",
          kind: "purchase",
        },
        {
          key: "leasing",
          label: "Leasing",
          description: "Fast beräknad månadskostnad.",
          kind: "monthly",
          months: 48,
          monthlyFactor: 0.01875,
        },
        {
          key: "long-term-rental",
          label: "Långtidshyra",
          description: "Beräknad månadskostnad inklusive service enligt separat avtal.",
          kind: "monthly",
          months: 48,
          monthlyFactor: 0.0191667,
        },
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
        layout: [
          {
            blockType: "configurator",
            heading: "Bygg din truck",
            intro: "Välj trucktyp och konfigurera ett utförande som passar verksamheten.",
          },
        ],
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
        layout: [
          ...(existingPage.layout ?? []),
          {
            blockType: "configurator",
            heading: "Bygg din truck",
            intro: "Välj trucktyp och konfigurera ett utförande som passar verksamheten.",
          },
        ],
      },
    });
  }

  payload.logger.info("Seeded configurator development catalog and page.");
}

await seed();
