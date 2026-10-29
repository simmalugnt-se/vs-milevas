import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";
import type { ModelStep } from "../src/features/configurator/steps.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (process.env.APP_ENV === "production") {
  throw new Error("Configurator development seed is disabled when APP_ENV=production.");
}

/**
 * The truck catalogue as the Lovable prototype has it (liftanero.lovable.app/configurator, read
 * 2026-10-29): five families with their models (`truck-models`), their equipment and extras with
 * the prototype's options, prices, texts and photos, and the steps' order
 * (`scripts/configurator-assets`); order pickers, which the prototype lacks, as Figma's example.
 * Placeholder data until Baoli's own. Each family is updated in place by its key and each model by
 * its name within it, so pages that point at them keep pointing at them; a model the seed no longer
 * has is deleted.
 */

type FamilyInput = RequiredDataFromCollectionSlug<"truck-families">;

type Spec = { label: string; value: string };

type ModelSeed = {
  name: string;
  /** The name the model had before, so a re-seed renames it in place. */
  rename?: string;
  capacityKg: number;
  price: number;
  series?: string;
  wheels?: "3" | "4";
  description?: string;
  specs?: Spec[];
  photo?: PhotoKey;
};

type OptionSeed = {
  label: string;
  price?: number;
  description?: string;
  defaultSelected?: boolean;
  specs?: Spec[];
  /** The models it is shown for, by name; without, all. */
  models?: string[];
  photo?: PhotoKey;
  /** The truck with this option, for every model. */
  truckPhoto?: PhotoKey;
};

type QuestionSeed = {
  label: string;
  multiple?: boolean;
  help?: string;
  /** "Kolumner"; automatic when left out. */
  columns?: "auto" | "one" | "two";
  options: OptionSeed[];
};

/** A step from the models' fields: their lift capacity, wheels or series, or the models. */
type ModelStepSeed = { property: ModelStep; label?: string };

type FamilySeed = Omit<
  FamilyInput,
  "image" | "brochure" | "models" | "defaultModel" | "series" | "equipment" | "extras" | "stepOrder"
> & {
  /** `scripts/figma-homepage-assets/hero-<image>.png`, the family's main image. */
  image: string;
  models: ModelSeed[];
  /** The model the configurator starts at, by name. */
  defaultModel: string;
  /** "Serier": a series' text, by its name; the series come from the models. */
  seriesTexts?: Record<string, string>;
  /**
   * The steps in the prototype's order: the models' fields, and the groups, which go under
   * Utrustning (one option) or Tillval (`multiple`).
   */
  steps: Array<QuestionSeed | ModelStepSeed>;
};

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brochurePath = path.join(root, "src/payload/seed/assets/produktbroschyr-placeholder.pdf");
const brochureFilename = "produktbroschyr-placeholder.pdf";

/** The prototype's photos in `scripts/configurator-assets`. */
const PHOTOS = {
  kbet: { file: "baoli-kbet-3wheel.webp", alt: "Baoli KBET, trehjulig motviktstruck" },
  kbe: { file: "baoli-kbe-20li.webp", alt: "Baoli KBE 20, fyrhjulig motviktstruck" },
  kbe2535: { file: "baoli-electric-kbe-25-35.webp", alt: "Baoli KBE 25–35, motviktstruck" },
  cabin: { file: "baoli-kbe-cabin.png", alt: "Baoli KBE med hytt" },
  kbs: { file: "baoli-stacker-standard.png", alt: "Baoli KBS 12N, ledstaplare" },
  es: { file: "baoli-stacker-tung.webp", alt: "Baoli ES, ledstaplare" },
  kbp15e: { file: "baoli-kbp-15e.webp", alt: "Baoli KBP 15E, elektrisk pallyftare" },
  kbp15l: { file: "baoli-kbp-15l.webp", alt: "Baoli KBP 15L, elektrisk pallyftare" },
  kbp14h: { file: "baoli-kbp-14h.webp", alt: "Baoli KBP 14H, elektrisk pallyftare" },
  ep16: { file: "baoli-ep16-n01.webp", alt: "Baoli EP 16-N01, låglyftare" },
  ep20: { file: "baoli-ep20-111.webp", alt: "Baoli EP20-111, låglyftare med åkplatta" },
  buzzer: { file: "safety-buzzer.png", alt: "Backsummer" },
  pilot: { file: "safety-pilotprotector.png", alt: "Fasthållningssystem" },
  camera: { file: "safety-camera.png", alt: "Trådlöst kamerasystem med monitor" },
} as const;

type PhotoKey = keyof typeof PHOTOS;

const spec = (label: string, value: string | undefined): Spec[] =>
  value ? [{ label, value }] : [];

const weightAndRadius = (weight: string, turningRadius: string) => [
  ...spec("Vikt", `${weight} kg`),
  ...spec("Vändradie", `${turningRadius} mm`),
];

const speed = (value: string) => spec("Körhastighet (lastad/olastad)", `${value} km/h`);

const triplex = "Triplexstativ med frilyft — höjer gafflarna utan att masten sticker upp.";

const mast = (mm: number, build: number, price: number, models?: string[]): OptionSeed => ({
  label: `${mm} mm`,
  price,
  description: `Truckens höjd med denna mast: ${build} mm. ${triplex}`,
  specs: spec("Truckens bygghöjd", `${build} mm`),
  models,
});

const bluespot: QuestionSeed = {
  label: "Bluespot",
  options: [
    { label: "Ingen", defaultSelected: true },
    { label: "Fram", price: 2400 },
    { label: "Bak", price: 2400 },
    { label: "Fram + bak", price: 4200 },
  ],
};

const battery = (ah: number, models: string[], defaultSelected = false): OptionSeed => ({
  label: `Standard batteri ${ah} Ah (Li-Ion)`,
  description: "Räcker gott för normal drift, upp till ett skift per dag.",
  defaultSelected,
  specs: spec("Batterikapacitet", `${ah} Ah`),
  models,
});

const bigBattery = (ah: number, models: string[]): OptionSeed => ({
  label: `Stort batteri ${ah} Ah (Li-Ion)`,
  price: 18000,
  description:
    "Längre räckvidd utan laddning. Perfekt om ni kör flera skift eller vill undvika mellanladdning.",
  specs: spec("Batterikapacitet", `${ah} Ah`),
  models,
});

const KBET = "Smidig i trånga utrymmen. Mindre vändradie.";
const KBE = "Riktigt stabil känsla.";
const SMALL = [
  "KBET 15 G1",
  "KBE 15 Li G1",
  "KBET 18 G1",
  "KBE 18 Li G1",
  "KBET 20 G1",
  "KBE 20 Li G1",
];
const LARGE = ["KBE 25 Li G1", "KBE 30 Li G1", "KBE 35 Li G1"];
const KBS =
  "Li-Ion-batteri, inget underhåll. Lätt och smidig (under 700 kg). Pålitlig för daglig användning i de flesta lager- och butiksmiljöer.";
const ES =
  "Kraftfullt bly-syra-batteri för långa arbetspass. Robust chassi för intensiv drift. Klarar högre lyft, upp till 5,5 meter.";

const standardDelivery = "4–6 veckor";

/**
 * Long-term rental's service per drive hour by lift capacity, from VS Truck's electric trucks of
 * the type (2026-10), until Milevas has its own; the pallet trucks take the low lifters'.
 */
const serviceRate = (minKg: number, maxKg: number | null, [a, b, c, d, e]: number[]) => ({
  minKg,
  maxKg,
  upTo600: a,
  upTo1200: b,
  upTo2000: c,
  upTo3000: d,
  over3000: e,
});
const SERVICE_RATES = {
  counterbalance: [
    serviceRate(0, 2000, [18, 15, 14, 12, 10]),
    serviceRate(2001, 3000, [20, 17, 16, 14, 12]),
    serviceRate(3001, 4000, [26, 23, 22, 20, 18]),
    serviceRate(4001, null, [32, 27, 26, 24, 20]),
  ],
  reach: [serviceRate(0, null, [15, 14.5, 12.5, 12.5, 12.5])],
  lowLift: [serviceRate(0, null, [8.5, 8, 7, 7, 7])],
  stacker: [serviceRate(0, null, [9.5, 9, 8, 8, 8])],
  picker: [serviceRate(0, null, [14.5, 14, 12, 12, 12])],
};

const families: FamilySeed[] = [
  {
    name: "Elektriska motvikts|truckar",
    singularName: "Elektrisk motvikts|truck",
    key: "electric-counterbalance",
    serviceRates: SERVICE_RATES.counterbalance,
    description: "Elektrisk motviktstruck för lager, terminal och industri.",
    image: "counterbalance",
    cardSpec: "76,8 V · 150 Ah",
    specs: speed("15 / 15"),
    deliveryTime: standardDelivery,
    warranty: "4 år",
    models: [
      {
        name: "KBET 15 G1",
        capacityKg: 1500,
        price: 169900,
        series: "KBET G1",
        wheels: "3",
        description: KBET,
        photo: "kbet",
      },
      {
        name: "KBE 15 Li G1",
        capacityKg: 1500,
        price: 173900,
        series: "KBE G1",
        wheels: "4",
        description: KBE,
        photo: "kbe",
        specs: weightAndRadius("2 980", "1870 / 1850"),
      },
      {
        name: "KBET 18 G1",
        capacityKg: 1800,
        price: 179900,
        series: "KBET G1",
        wheels: "3",
        description: KBET,
        photo: "kbet",
      },
      {
        name: "KBE 18 Li G1",
        capacityKg: 1800,
        price: 183900,
        series: "KBE G1",
        wheels: "4",
        description: KBE,
        photo: "kbe",
        specs: weightAndRadius("3 293", "1870 / 1850"),
      },
      {
        name: "KBET 20 G1",
        capacityKg: 2000,
        price: 184900,
        series: "KBET G1",
        wheels: "3",
        description: KBET,
        photo: "kbet",
      },
      {
        name: "KBE 20 Li G1",
        capacityKg: 2000,
        price: 188900,
        series: "KBE G1",
        wheels: "4",
        description: KBE,
        photo: "kbe",
        specs: weightAndRadius("3 450", "1870 / 1850"),
      },
      {
        name: "KBE 25 Li G1",
        capacityKg: 2500,
        price: 199900,
        series: "KBE G1",
        wheels: "4",
        photo: "kbe2535",
        specs: weightAndRadius("4 020", "2 190"),
      },
      {
        name: "KBE 30 Li G1",
        capacityKg: 3000,
        price: 219900,
        series: "KBE G1",
        wheels: "4",
        photo: "kbe2535",
        specs: weightAndRadius("4 510", "2 240"),
      },
      {
        name: "KBE 35 Li G1",
        capacityKg: 3500,
        price: 239900,
        series: "KBE G1",
        wheels: "4",
        photo: "kbe2535",
        specs: weightAndRadius("4 980", "2 290"),
      },
    ],
    defaultModel: "KBE 15 Li G1",
    steps: [
      { property: "capacity", label: "Kapacitet" },
      {
        label: "Batteri",
        options: [
          battery(150, SMALL, true),
          battery(206, ["KBE 25 Li G1"], true),
          battery(277, ["KBE 30 Li G1", "KBE 35 Li G1"], true),
          bigBattery(228, SMALL),
          bigBattery(277, ["KBE 25 Li G1"]),
          bigBattery(412, ["KBE 30 Li G1", "KBE 35 Li G1"]),
        ],
      },
      { property: "wheels" },
      {
        label: "Lyfthöjd",
        help: "Behöver du hjälp med andra mastalternativ?",
        options: [
          mast(4700, 2130, 0, SMALL),
          mast(6000, 2765, 3500, SMALL),
          mast(4650, 2230, 0, LARGE),
        ],
      },
      {
        label: "Gaffellängd",
        options: [
          { label: "Standard (1200 mm)", description: "Standardlängd. Passar EU-pall." },
          {
            label: "Förlängnings|gafflar (1600 mm)",
            price: 6500,
            description: "Förlängningsgafflar.",
          },
        ],
      },
      {
        label: "Sidoförskjutning",
        options: [
          {
            label: "Sidoförskjutning",
            description: "Möjliggör exakt positionering av lasten i sidled.",
          },
          {
            label: "Sidoförskjutning och gaffel|spridning",
            price: 9500,
            description: "Justera gaffelavstånd hydrauliskt – perfekt för olika pallstorlekar.",
          },
        ],
      },
      {
        label: "Hytt",
        options: [
          { label: "Med förarskydd", description: "Skyddsbåge som håller föraren säker." },
          {
            label: "Med hytt",
            price: 22000,
            description: "Hytt med ståldörrar och uppvärmning som håller ute väder, damm och kyla.",
            truckPhoto: "cabin",
          },
        ],
      },
      bluespot,
      {
        label: "Övriga tillval",
        multiple: true,
        options: [
          {
            label: "Backsummer",
            price: 1200,
            description: "Ljudsignal som aktiveras automatiskt vid backning.",
            photo: "buzzer",
          },
          {
            label: "Fasthållnings|system",
            price: 14500,
            description: "Fasthållning som ökar förarens säkerhet markant.",
            photo: "pilot",
          },
          {
            label: "Trådlöst kamera|system (bak)",
            price: 6900,
            description: "Trådlös backkamera med monitor.",
            photo: "camera",
          },
        ],
      },
    ],
  },
  {
    name: "Skjutstativ|truckar",
    singularName: "Skjutstativ|truck",
    key: "reach-truck",
    serviceRates: SERVICE_RATES.reach,
    description: "Skjutstativtruck för effektiv pallhantering på hög höjd.",
    image: "reach-truck",
    cardSpec: "48 V 465 Ah",
    specs: speed("11 / 11"),
    deliveryTime: standardDelivery,
    warranty: "4 år",
    models: [
      { name: "KBR 16", capacityKg: 1600, price: 516000, specs: weightAndRadius("2 950", "1 680") },
      { name: "KBR 20", capacityKg: 2000, price: 546000, specs: weightAndRadius("3 210", "1 680") },
    ],
    defaultModel: "KBR 16",
    steps: [
      { property: "capacity", label: "Kapacitet" },
      {
        label: "Batteri",
        options: [{ label: "Standard", specs: spec("Batterikapacitet", "48 V 465 Ah") }],
      },
      {
        label: "Lyfthöjd",
        help: "Behöver du lyfta ännu högre? Denna truck finns med lyfthöjder över 10 meter.",
        options: [
          mast(6955, 3050, 0),
          mast(7255, 3200, 22000, ["KBR 16"]),
          mast(8255, 3550, 44000, ["KBR 16"]),
        ],
      },
      bluespot,
      {
        label: "Övriga tillval",
        columns: "one",
        multiple: true,
        options: [
          {
            label: "Mast|kamera",
            price: 12500,
            description: "Kamera monterad på masten för full sikt när du hanterar last på höjd.",
            photo: "camera",
          },
          {
            label: "Höjd|indikator",
            price: 6800,
            description: "Digital indikator som visar exakt lyfthöjd — perfekt vid höglagring.",
          },
          {
            label: "Laser|pekare (gaffel|spetsar)",
            price: 3200,
            description: "Laserstrålar på gaffelspetsarna för exakt positionering.",
          },
          {
            label: "Roterande varnings|ljus",
            price: 1800,
            description: "Klassisk gul rotorlampa monterad på taket.",
          },
          {
            label: "Förar|behörighet (PIN/RFID-lås)",
            price: 4800,
            description: "Endast behöriga förare kan starta trucken — via PIN-kod eller RFID-tag.",
          },
        ],
      },
    ],
  },
  {
    name: "Låglyftare",
    singularName: "Låglyftare",
    key: "low-lift-pallet-truck",
    serviceRates: SERVICE_RATES.lowLift,
    image: "low-lift",
    cardSpec: "24 V 105 Ah",
    specs: speed("6 / 6"),
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [
      {
        name: "EP 16-N01",
        rename: "EP 16-25",
        capacityKg: 1600,
        price: 38000,
        series: "Utan åkplatta",
        photo: "ep16",
        description: "Batteri Li-Ion 24 V / 20 Ah",
        specs: spec("Batteri", "Li-Ion 24 V / 20 Ah"),
      },
      {
        name: "EP 20-N04",
        capacityKg: 2000,
        price: 45000,
        series: "Utan åkplatta",
        photo: "ep16",
        description: "Batteri Li-Ion 24 V / 50 Ah",
        specs: spec("Batteri", "Li-Ion 24 V / 50 Ah"),
      },
      {
        name: "EP 25-N02",
        capacityKg: 2500,
        price: 52000,
        series: "Utan åkplatta",
        photo: "ep16",
        description: "Batteri Li-Ion 24 V / 80 Ah",
        specs: spec("Batteri", "Li-Ion 24 V / 80 Ah"),
      },
      { name: "EP20-111", capacityKg: 2000, price: 76000, series: "Med åkplatta", photo: "ep20" },
    ],
    defaultModel: "EP 16-N01",
    steps: [
      { property: "series", label: "Utförande" },
      { property: "capacity", label: "Kapacitet" },
      {
        label: "Batteri",
        options: [
          {
            label: "Blysyra (345 Ah)",
            description:
              "Lägsta investering, lång drifttid per laddning. Kräver laddrum och underhåll.",
            specs: spec("Batteri", "Blysyra 345 Ah"),
            models: ["EP20-111"],
          },
          {
            label: "Li-Ion (205 Ah)",
            price: 19000,
            description:
              "Snabbladdning, underhållsfritt och inga farliga gaser — bäst för flerskift.",
            specs: spec("Batteri", "Li-Ion 205 Ah"),
            models: ["EP20-111"],
          },
        ],
      },
      {
        label: "Gaffellängd",
        options: [
          { label: "1150 mm", defaultSelected: true },
          { label: "2400 mm", price: 9500 },
        ],
      },
    ],
  },
  {
    name: "Ledstaplare",
    singularName: "Ledstaplare",
    key: "pedestrian-stacker",
    serviceRates: SERVICE_RATES.stacker,
    image: "stacker",
    cardSpec: "24 V 150 Ah",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [
      {
        name: "KBS 12N",
        capacityKg: 1200,
        price: 40000,
        series: "KBS-serien",
        photo: "kbs",
        description: KBS,
      },
      {
        name: "ES 12N",
        capacityKg: 1200,
        price: 82000,
        series: "ES-serien",
        photo: "es",
        description: ES,
      },
      {
        name: "ES 16N",
        rename: "ES 16",
        capacityKg: 1600,
        price: 89200,
        series: "ES-serien",
        photo: "es",
        description: ES,
      },
    ],
    defaultModel: "KBS 12N",
    seriesTexts: { "KBS-serien": KBS, "ES-serien": ES },
    steps: [
      { property: "series" },
      { property: "capacity", label: "Kapacitet" },
      {
        label: "Lyfthöjd",
        options: [
          { label: "2600 mm", description: "Duplex med frilyft.", models: ["KBS 12N"] },
          { label: "2900 mm", description: triplex, models: ["ES 12N", "ES 16N"] },
          { label: "3600 mm", price: 1600 },
          { label: "4600 mm", price: 3750, models: ["KBS 12N", "ES 16N"] },
          { label: "5500 mm", price: 5600, models: ["KBS 12N", "ES 16N"] },
        ],
      },
      {
        label: "Initiallyft",
        // "Nej" first, so it is the default: Lovable starts at the series' price and calls it
        // "Standard", though it lists "Ja" first.
        options: [
          { label: "Nej", description: "Trucken körs på plant, jämnt underlag." },
          {
            label: "Ja, med initiallyft",
            price: 3800,
            description:
              "Initiallyft höjer stödbenen så att trucken klarar att köra över ojämna golv, ramper och trösklar med last. Bra i miljöer med ramper, trösklar eller ojämna golv.",
          },
        ],
      },
    ],
  },
  {
    name: "Elektriska pallyftare",
    singularName: "Elektrisk pallyftare",
    key: "electric-pallet-truck",
    serviceRates: SERVICE_RATES.lowLift,
    image: "pallet-truck",
    cardSpec: "24 V 20 Ah",
    deliveryTime: standardDelivery,
    warranty: "1 år",
    models: [
      {
        name: "KBP 15E",
        capacityKg: 1500,
        price: 15900,
        photo: "kbp15e",
        description:
          "Extremt kompakt (107 kg). Perfekt i väldigt trånga utrymmen. Lätt nog för att enkelt lastas på en lastbil eller bakgavellyft.",
      },
      {
        name: "KBP 15L",
        capacityKg: 1500,
        price: 39900,
        photo: "kbp15l",
        description:
          "4 timmars drifttid. Upphängda stödhjul för bättre stabilitet vid transport av högt gods. Ergonomiskt handtag.",
      },
      {
        name: "KBP 14H",
        capacityKg: 1400,
        price: 32900,
        photo: "kbp14h",
        description:
          "30 Ah batteri — tre gånger så lång drifttid som KBP 15E. Lång tillerarm minskar kraften som krävs för att styra. Fjädrande stödhjul gör att den klarar ojämna ytor.",
      },
      {
        name: "KBP 20",
        capacityKg: 2000,
        price: 46900,
        photo: "kbp14h",
        description:
          "Lång räckvidd och högst lyftkapacitet i sortimentet (2,0 ton). Bäst lämpad om ni ofta hanterar tyngre pallar.",
      },
    ],
    defaultModel: "KBP 15E",
    steps: [
      { property: "model", label: "Modell" },
      {
        label: "Gaffellängd",
        options: [
          {
            label: "1150 mm",
            defaultSelected: true,
            description: "Standardlängd — passar EUR-pall och de flesta lagermiljöer.",
            models: ["KBP 15L"],
          },
          {
            label: "1500 mm",
            price: 2400,
            description: "Längre gafflar för längre gods och dubbla pallar.",
            models: ["KBP 15L"],
          },
        ],
      },
    ],
  },
  {
    name: "Plocktruckar",
    singularName: "Plocktruck",
    key: "order-picker",
    serviceRates: SERVICE_RATES.picker,
    description: "Plocktruck för orderplock från golv och upp till mellanhöga hyllplan.",
    image: "order-picker",
    cardSpec: "48 V 375 Ah",
    specs: speed("9 / 9"),
    deliveryTime: standardDelivery,
    warranty: "2 år",
    // Placeholders: neither Figma nor the prototype has order picker data.
    models: [
      { name: "KOP 10", capacityKg: 1000, price: 189000, specs: weightAndRadius("2 100", "1 650") },
      { name: "KOP 12", capacityKg: 1200, price: 209000, specs: weightAndRadius("2 250", "1 650") },
    ],
    defaultModel: "KOP 10",
    steps: [
      { property: "capacity", label: "Kapacitet" },
      {
        label: "Batteri",
        options: [
          {
            label: "Standard",
            defaultSelected: true,
            specs: spec("Batterikapacitet", "48 V 375 Ah"),
          },
        ],
      },
      {
        label: "Lyfthöjd",
        help: "Behöver du hjälp med andra mastalternativ?",
        options: [{ ...mast(3000, 2200, 0), defaultSelected: true }, mast(4500, 2700, 16000)],
      },
      {
        label: "Tillval",
        multiple: true,
        options: [
          { label: "Backsummer", price: 1200, photo: "buzzer" },
          { label: "Arbetsbelysning", price: 3400 },
        ],
      },
    ],
  },
];

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
};

/** An image uploaded once and found again by its filename. */
async function uploadFile(payload: Payload, filename: string, file: string, alt: string) {
  const existing = await payload.find({
    collection: "images",
    overrideAccess: true,
    limit: 1,
    where: { filename: { equals: filename } },
  });
  if (existing.docs[0]) return existing.docs[0].id;
  const { readFile } = await import("node:fs/promises");
  const data = await readFile(file);
  const uploaded = await payload.create({
    collection: "images",
    locale: "sv",
    data: { alt },
    file: {
      data,
      name: filename,
      size: data.length,
      mimetype: MIME[path.extname(file)] ?? "image/png",
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  return uploaded.id;
}

const uploadImage = (payload: Payload, name: string, alt: string) =>
  uploadFile(
    payload,
    `truck-family-${name}.png`,
    path.join(root, "scripts/figma-homepage-assets", `hero-${name}.png`),
    alt,
  );

/** Each photo uploaded once, also when the options ask for it at the same time. */
const photoIds = new Map<PhotoKey, Promise<string>>();

function photo(payload: Payload, key: PhotoKey | undefined) {
  if (!key) return Promise.resolve(undefined);
  const known = photoIds.get(key);
  if (known) return known;
  const { file, alt } = PHOTOS[key];
  const upload = uploadFile(
    payload,
    `lovable-${file}`,
    path.join(root, "scripts/configurator-assets", file),
    alt,
  );
  photoIds.set(key, upload);
  return upload;
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
  const { models, defaultModel, seriesTexts, steps, ...fields } = seed;
  const existing = await payload.find({
    collection: "truck-families",
    locale: "sv",
    draft: true,
    overrideAccess: true,
    limit: 1,
    joins: false,
    where: { key: { equals: seed.key } },
  });
  const options = {
    collection: "truck-families" as const,
    locale: "sv" as const,
    draft: false,
    overrideAccess: true,
    context: { disableRevalidate: true },
  };
  const data: FamilyInput = {
    // A list the family does not have is emptied, so a re-seed removes it.
    specs: [],
    ...fields,
    image: await uploadImage(payload, seed.image, seed.singularName),
    brochure: models.length ? brochure : undefined,
    series: [...new Set(models.flatMap((model) => model.series ?? []))].map((name) => ({
      name,
      description: seriesTexts?.[name],
    })),
    // The groups point at the models, which need the family first.
    equipment: [],
    extras: [],
    stepOrder: [],
    _status: "published",
  };
  const family = existing.docs[0]
    ? await payload.update({ ...options, id: existing.docs[0].id, data })
    : await payload.create({ ...options, data });

  // Each model by its name (or the one it had) within the family, so a re-seed updates it in place.
  const current = await payload.find({
    collection: "truck-models",
    draft: true,
    overrideAccess: true,
    pagination: false,
    where: { family: { equals: family.id } },
  });
  const ids = new Map<string, string>();
  for (const { rename, photo: key, ...input } of models) {
    const found = current.docs.find((doc) => doc.name === input.name || doc.name === rename);
    const modelOptions = {
      collection: "truck-models" as const,
      locale: "sv" as const,
      draft: false,
      overrideAccess: true,
      context: { disableRevalidate: true },
      data: {
        ...input,
        sku: input.name,
        specs: input.specs ?? [],
        image: await photo(payload, key),
        family: family.id,
        _status: "published" as const,
      },
    };
    const saved = found
      ? await payload.update({ ...modelOptions, id: found.id })
      : await payload.create(modelOptions);
    ids.set(input.name, saved.id);
  }
  for (const doc of current.docs) {
    if (![...ids.values()].includes(doc.id)) {
      await payload.delete({
        collection: "truck-models",
        id: doc.id,
        overrideAccess: true,
        context: { disableRevalidate: true },
      });
    }
  }

  // Groups under Utrustning (one option) and Tillval (any); an option lists the models that have
  // it, or none for every model. A model's photo with an option (a cab) goes on the model.
  const questions = steps.filter((step): step is QuestionSeed => !("property" in step));
  const optionData = async ({
    models: names,
    photo: key,
    truckPhoto: _truckPhoto,
    defaultSelected: _defaultSelected,
    price = 0,
    ...option
  }: OptionSeed) => ({
    ...option,
    price,
    image: await photo(payload, key),
    models: names ? names.flatMap((name) => ids.get(name) ?? []) : [],
  });
  const group = async ({ options: rows, multiple: _multiple, ...question }: QuestionSeed) => ({
    ...question,
    options: await Promise.all(rows.map(optionData)),
  });
  const saved = await payload.update({
    ...options,
    id: family.id,
    data: {
      defaultModel: ids.get(defaultModel),
      equipment: await Promise.all(questions.filter((q) => !q.multiple).map(group)),
      extras: await Promise.all(questions.filter((q) => q.multiple).map(group)),
      _status: "published",
    },
  });

  // The steps' order: the models' fields and the groups, as the seed lists them.
  const savedGroups = [...(saved.equipment ?? []), ...(saved.extras ?? [])];
  const groupId = (question: QuestionSeed) =>
    savedGroups.find((row) => row.label === question.label)?.id;
  await payload.update({
    ...options,
    id: family.id,
    data: {
      stepOrder: steps.flatMap((step) => {
        const key = "property" in step ? step.property : groupId(step);
        return key ? [{ step: key }] : [];
      }),
      _status: "published",
    },
  });

  // Each model's photos with an option (the cab).
  for (const question of questions) {
    for (const [index, row] of question.options.entries()) {
      const image = await photo(payload, row.truckPhoto);
      const option = savedGroups.find((saved) => saved.label === question.label)?.options?.[index]
        ?.id;
      if (!image || !option) continue;
      for (const { name } of models) {
        const id = ids.get(name);
        if (!id || (row.models && !row.models.includes(name))) continue;
        await payload.update({
          collection: "truck-models",
          id,
          locale: "sv",
          draft: false,
          overrideAccess: true,
          context: { disableRevalidate: true },
          data: { optionImages: [{ option, image }], _status: "published" },
        });
      }
    }
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
            description:
              "Klappat och klart – trucken är din! Betala hela beloppet direkt och äg din truck utan löpande kostnader.",
            kind: "purchase",
            serviceAgreementEligible: true,
          },
          {
            key: "leasing",
            label: "Leasing",
            description:
              "Finansbolaget äger trucken och du betalar en fast, förutsägbar månadskostnad. Perfekt om du vill ha kontroll på budgeten.",
            kind: "monthly",
            months: 48,
            minMonths: 24,
            maxMonths: 84,
            monthsStep: 12,
            // VS Truck's figures (2026-10), until Milevas has its own.
            interestRate: 5.95,
            residualValues: [
              { minMonths: 0, maxMonths: 60, percent: 20 },
              { minMonths: 61, maxMonths: 72, percent: 10 },
            ],
            residualPercent: 10,
            serviceAgreementEligible: true,
          },
          {
            key: "long-term-rental",
            label: "Långtidshyra",
            description:
              "Det smidigaste sättet att ha truck på. All service ingår, från första dagen till sista. Du kör – vi sköter resten.",
            kind: "monthly",
            months: 48,
            minMonths: 24,
            maxMonths: 84,
            monthsStep: 12,
            interestRate: 5.95,
            residualValues: [
              { minMonths: 1, maxMonths: 60, percent: 20 },
              { minMonths: 61, maxMonths: 84, percent: 10 },
            ],
            residualPercent: 20,
            rental: true,
            driveHoursPerYear: 500,
            insurancePercent: 1.2,
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
          layout: [{ blockType: "configurator", heading: "Bygg din truck" }],
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
            { blockType: "configurator", heading: "Bygg din truck" },
          ],
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
