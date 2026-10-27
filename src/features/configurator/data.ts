import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { TRUCK_SPECS, type TruckSpecName } from "@/payload/collections/TruckFamilies/specs";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { getMediaImageURL } from "@/payload/utilities/media";
import type { ConfiguratorSetting, Document, Image, TruckFamily } from "@/payload-types";
import { type ChoiceStepKey, MODEL_STEP, orderedSteps, type StepSetting, stepRole } from "./steps";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorOption,
  ConfiguratorSpec,
  SpecValue,
} from "./types";

/** Figma's slider: 24 to 84 months, a year at a time. */
const DEFAULT_TERMS = [24, 36, 48, 60, 72, 84];

const DEFAULT_FINANCING: ConfiguratorCatalog["financingMethods"] = [
  { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
  {
    key: "leasing",
    label: "Leasing",
    kind: "monthly",
    months: 48,
    terms: DEFAULT_TERMS,
    residualPercent: 10,
    serviceAgreementEligible: true,
  },
  {
    key: "long-term-rental",
    label: "Långtidshyra",
    kind: "monthly",
    months: 48,
    terms: DEFAULT_TERMS,
    serviceAgreementEligible: false,
  },
];

/** The terms from the shortest to the longest a step apart, or the default term alone. */
function termsBetween(
  min: number | null | undefined,
  max: number | null | undefined,
  step: number | null | undefined,
  fallback: number | undefined,
): number[] {
  if (!min || !max || !step || step <= 0 || max < min) return fallback ? [fallback] : [];
  const terms: number[] = [];
  for (let months = min; months <= max && terms.length < 60; months += step) terms.push(months);
  return terms;
}

const DEFAULT_SERVICE_AGREEMENT: NonNullable<ConfiguratorCatalog["serviceAgreement"]> = {
  label: "Serviceavtal",
  description: "Årlig kostnad. Faktureras separat.",
  annualPrice: 2856,
};

/** `|` in a name is where it may break, shown as a hyphen only then (a soft hyphen). */
const hyphenate = (text: string) => text.replaceAll("|", "\u00AD");
/** The name without its break marks, for alt texts. */
const plain = (text: string) => text.replaceAll("|", "");

/** The specifications as the configurator names and orders them, from `TRUCK_SPECS`. */
const SPECS: ConfiguratorSpec[] = TRUCK_SPECS.map((spec, index) => ({
  key: spec.name,
  label: spec.label,
  unit: "unit" in spec ? spec.unit : undefined,
  sortOrder: index,
  onCard: "onCard" in spec && spec.onCard,
  inQuote: !("inQuote" in spec) || spec.inQuote,
}));

/** A specification's value, left out when it is empty. */
const spec = (key: TruckSpecName, value: string | number | null | undefined): SpecValue[] => {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text ? [{ spec: key, value: text }] : [];
};

const tons = (kg: number) =>
  `${new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kg / 1000)} ton`;

function imageData(value: string | Image | null | undefined, alt: string) {
  const image = value && typeof value === "object" ? value : null;
  const url = getMediaImageURL(value);
  return image && url ? { alt: image.alt || alt, url } : undefined;
}

type Battery = NonNullable<TruckFamily["batteries"]>[number];
type LiftHeight = NonNullable<TruckFamily["liftHeights"]>[number];
type Extra = NonNullable<TruckFamily["extras"]>[number];

/** An option keeps its row id as its key, so the URL and the quote point at it. */
const batteryOption = (battery: Battery): ConfiguratorOption => ({
  key: battery.id ?? battery.label,
  label: hyphenate(battery.label),
  description: battery.description || undefined,
  price: battery.price,
  default: battery.defaultSelected === true,
  specs: spec("batteryCapacity", battery.capacity),
});

const liftHeightOption = (mast: LiftHeight): ConfiguratorOption => ({
  key: mast.id ?? String(mast.liftHeight),
  label: `${mast.liftHeight} mm`,
  description: mast.buildHeight
    ? `Truckens höjd med denna mast: ${mast.buildHeight} mm`
    : undefined,
  price: mast.price,
  default: mast.defaultSelected === true,
  specs: spec("buildHeight", mast.buildHeight),
});

const extraOption = (extra: Extra): ConfiguratorOption => ({
  key: extra.id ?? extra.label,
  label: hyphenate(extra.label),
  description: extra.description || undefined,
  image: imageData(extra.image, plain(extra.label)),
  price: extra.price,
  default: false,
  specs: [],
});

function brochureData(document: TruckFamily["brochure"]): ConfiguratorFamily["brochure"] {
  if (!document || typeof document !== "object") {
    return undefined;
  }
  const resolved = document as Document;
  return resolved.url ? { title: resolved.title, url: resolved.url } : undefined;
}

/** The configurator's steps as the settings name and order them. */
type StepTexts = { modelStepLabel: string; steps: StepSetting[] };

/**
 * The configurator's view of a family, built from its product data: the variants are the first
 * step (named by the settings, built by the engine), then the batteries, the lift heights and the
 * extras in the settings' order, each as `stepRole` has it. A battery or mast alone is part of the
 * truck: its specifications are the family's and its cost is in the base price.
 */
function mapFamily(family: TruckFamily, { modelStepLabel, steps }: StepTexts): ConfiguratorFamily {
  // Variants are what is configured; without them the truck type links to its contact link.
  const configurable = (family.models?.length ?? 0) > 0;
  const contactLink = configurable ? null : resolveLinkField(family.contactLink);
  const options: Record<ChoiceStepKey, ConfiguratorOption[]> = {
    battery: (family.batteries ?? []).map(batteryOption),
    "lift-height": (family.liftHeights ?? []).map(liftHeightOption),
    extras: (family.extras ?? []).map(extraOption),
  };
  const fixed = steps.flatMap(({ step }) =>
    stepRole(step, options[step].length) === "included" ? options[step] : [],
  );
  const fixedPrice = fixed.reduce((sum, option) => sum + option.price, 0);
  const cardBattery =
    (family.batteries ?? []).find((battery) => battery.defaultSelected) ?? family.batteries?.[0];

  const choices: ConfiguratorChoice[] = steps.flatMap(({ step, label }) => {
    if (stepRole(step, options[step].length) !== "choice") return [];
    const multiple = step === "extras";
    return [
      {
        key: step,
        label,
        help: step === "lift-height" ? family.liftHeightHelp || undefined : undefined,
        selectionMode: multiple ? ("multiple" as const) : ("single" as const),
        required: !multiple,
        display: multiple ? undefined : ("stack" as const),
        options: options[step],
      },
    ];
  });
  const onlyModel = family.models?.length === 1;

  return {
    id: family.id,
    key: family.key,
    name: hyphenate(family.name),
    singularName: hyphenate(family.singularName),
    description: family.description || undefined,
    configurable,
    contactLink: contactLink
      ? { href: contactLink.href, rel: contactLink.rel, target: contactLink.target }
      : undefined,
    deliveryTime: family.deliveryTime ?? "",
    warranty: family.warranty ?? "",
    image: imageData(family.image, plain(family.name)),
    brochure: brochureData(family.brochure),
    specs: [
      ...spec("travelSpeed", family.travelSpeed),
      ...spec("battery", cardBattery?.capacity),
      ...fixed.flatMap((option) => option.specs),
    ],
    modelChoice: { label: modelStepLabel },
    models: configurable
      ? (family.models ?? []).map((model) => ({
          key: model.id ?? String(model.capacityKg),
          label: tons(model.capacityKg),
          sku: model.sku || undefined,
          price: model.price + fixedPrice,
          capacityKg: model.capacityKg,
          default: model.defaultSelected === true || onlyModel,
          specs: [...spec("weight", model.weight), ...spec("turningRadius", model.turningRadius)],
        }))
      : [],
    choices: configurable ? choices : [],
  };
}

function mapSettings(
  settings: ConfiguratorSetting | null,
): Omit<ConfiguratorCatalog, "families" | "specs"> {
  const extras = {
    warrantyNote: settings?.warrantyNote || undefined,
    nextSteps: (settings?.nextSteps ?? []).map((step) => ({
      heading: step.heading,
      text: step.text || undefined,
    })),
  };
  if (!settings?.financingMethods?.length) {
    return {
      ...extras,
      financingMethods: DEFAULT_FINANCING,
      quoteValidityDays: 14,
      serviceAgreement: DEFAULT_SERVICE_AGREEMENT,
    };
  }

  return {
    ...extras,
    quoteValidityDays: settings.quoteValidityDays || 14,
    serviceAgreement: settings.serviceAgreement
      ? {
          label: settings.serviceAgreement.label,
          description: settings.serviceAgreement.description || undefined,
          annualPrice: settings.serviceAgreement.annualPrice,
        }
      : DEFAULT_SERVICE_AGREEMENT,
    financingMethods: settings.financingMethods.map((method) => ({
      key: method.key,
      label: method.label,
      description: method.description || undefined,
      kind: method.kind,
      months: method.months ?? undefined,
      terms:
        method.kind === "monthly"
          ? termsBetween(
              method.minMonths,
              method.maxMonths,
              method.monthsStep,
              method.months ?? undefined,
            )
          : undefined,
      residualPercent:
        method.kind === "monthly" ? (method.residualPercent ?? undefined) : undefined,
      serviceAgreementEligible: method.serviceAgreementEligible === true,
    })),
  };
}

async function fetchConfiguratorCatalog(
  locale: TypedLocale,
  draft: boolean,
): Promise<ConfiguratorCatalog> {
  // Loaded here, not at the top: the configurator block imports this file, and a static import of the
  // Payload config would close the cycle config → Pages → blocks → this file.
  const [{ getPayloadDbReady }, { getPayloadClient }] = await Promise.all([
    import("@/payload/data/db-ready"),
    import("@/payload/get-payload"),
  ]);
  if (!(await getPayloadDbReady()).ready) {
    return { families: [], specs: SPECS, ...mapSettings(null) };
  }

  const payload = await getPayloadClient();
  const [families, settings] = await Promise.all([
    payload.find({
      collection: "truck-families",
      locale,
      depth: 2,
      draft,
      overrideAccess: draft,
      pagination: false,
      sort: "_order",
    }),
    payload.findGlobal({
      slug: "configurator-settings",
      locale,
      depth: 0,
      draft,
      overrideAccess: draft,
    }),
  ]);

  return {
    families: families.docs.map((family) =>
      mapFamily(family, {
        modelStepLabel: settings?.modelStepLabel || MODEL_STEP.label,
        steps: orderedSteps(settings?.steps),
      }),
    ),
    specs: SPECS,
    ...mapSettings(settings),
  };
}

/** Bumped when the catalogue's shape changes, so a cache from before is not read as the new one. */
const CATALOG_VERSION = "2026-10-27c";

const getCachedCatalog = (locale: TypedLocale) =>
  unstable_cache(
    () => fetchConfiguratorCatalog(locale, false),
    ["configurator-catalog", CATALOG_VERSION, locale],
    { tags: ["truck-families", "configurator-settings"] },
  )();

export async function getConfiguratorCatalog(
  locale: string,
  draft = false,
): Promise<ConfiguratorCatalog> {
  const typedLocale = (locale === "sv" ? "sv" : "en") as TypedLocale;
  if (draft) {
    unstable_noStore();
    return fetchConfiguratorCatalog(typedLocale, true);
  }
  return getCachedCatalog(typedLocale);
}
