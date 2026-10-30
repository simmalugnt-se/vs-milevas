import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { getMediaImageURL } from "@/payload/utilities/media";
import type {
  ConfiguratorSetting,
  Document,
  Image,
  TruckFamily,
  TruckModel,
} from "@/payload-types";
import { DRIVE_HOUR_BANDS, type ServiceHourlyRates } from "./service-rates";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorModel,
  ConfiguratorOption,
  SpecValue,
} from "./types";

/** Figma's slider: 24 to 84 months, a year at a time. */
const DEFAULT_TERMS = [24, 36, 48, 60, 72, 84];

/** VS Truck's leasing and long-term rental figures (2026-10), until Milevas has its own. */
const DEFAULT_INTEREST_RATE = 5.95;

const DEFAULT_FINANCING: ConfiguratorCatalog["financingMethods"] = [
  { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
  {
    key: "leasing",
    label: "Leasing",
    kind: "monthly",
    months: 48,
    terms: DEFAULT_TERMS,
    interestRate: DEFAULT_INTEREST_RATE,
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
    kind: "monthly",
    months: 48,
    terms: DEFAULT_TERMS,
    interestRate: DEFAULT_INTEREST_RATE,
    residualValues: [
      { minMonths: 1, maxMonths: 60, percent: 20 },
      { minMonths: 61, maxMonths: 84, percent: 10 },
    ],
    residualPercent: 20,
    rental: { driveHoursPerYear: 500, insurancePercent: 1.2 },
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

/*
 * Live Preview reads drafts as the editor types, where a required field can still be empty: a row
 * without its name (or a model without its price) is left out until it is filled in, and nothing
 * here may assume a required field is set.
 */

/** A text that is filled in, trimmed; otherwise undefined. */
const filled = (text: string | null | undefined) => text?.trim() || undefined;

/** `|` in a name is where it may break, shown as a hyphen only then (a soft hyphen). */
const hyphenate = (text: string | null | undefined) => (text ?? "").replaceAll("|", "\u00AD");
/** The name without its break marks, for alt texts. */
const plain = (text: string | null | undefined) => (text ?? "").replaceAll("|", "");

/** The rows of a specifications field, without empty ones. */
const specRows = (rows: Array<{ label: string; value: string }> | null | undefined): SpecValue[] =>
  (rows ?? []).flatMap(({ label, value }) =>
    label?.trim() && value?.trim() ? [{ label: label.trim(), value: value.trim() }] : [],
  );

function imageData(value: string | Image | null | undefined, alt: string) {
  const image = value && typeof value === "object" ? value : null;
  const url = getMediaImageURL(value);
  return image && url ? { alt: image.alt || alt, url } : undefined;
}

function brochureData(document: string | Document | null | undefined) {
  if (!document || typeof document !== "object") return undefined;
  return document.url ? { title: document.title, url: document.url } : undefined;
}

const idOf = (value: string | { id: string } | null | undefined) =>
  typeof value === "object" ? value?.id : value;

type Group = NonNullable<TruckFamily["equipment"]>[number];
type GroupOption = NonNullable<Group["options"]>[number];

/**
 * An option keeps its row id as its key, so the URL and the quote point at it; its models are the
 * ones that have it, none: every model.
 */
const groupOption = (option: GroupOption): ConfiguratorOption[] => {
  const label = filled(option.label);
  if (!label) return [];
  const models = (option.models ?? []).flatMap((model) => idOf(model) ?? []);
  return [
    {
      key: option.id ?? label,
      label: hyphenate(label),
      description: option.description || undefined,
      image: imageData(option.image, plain(label)),
      price: option.price ?? 0,
      default: false,
      specs: specRows(option.specs),
      models: models.length ? models : undefined,
    },
  ];
};

/** A group is a step with its row id as its key: one option under Utrustning, any under Tillval. */
const groupChoice = (group: Group, multiple: boolean): ConfiguratorChoice[] => {
  const label = filled(group.label);
  if (!label) return [];
  return [
    {
      key: group.id ?? label,
      label,
      help: group.help || undefined,
      selectionMode: multiple ? "multiple" : "single",
      required: !multiple,
      columns: group.columns ?? "auto",
      options: (group.options ?? []).flatMap(groupOption),
    },
  ];
};

type ServiceRate = NonNullable<TruckFamily["serviceRates"]>[number];

/** The first of the truck type's service rates whose lift capacity fits the model. */
function serviceHourlyRates(
  rates: ServiceRate[] | null | undefined,
  capacityKg: number | null | undefined,
): ServiceHourlyRates | undefined {
  if (typeof capacityKg !== "number") return undefined;
  const rate = (rates ?? []).find(
    ({ minKg, maxKg }) =>
      capacityKg >= (minKg ?? 0) && (typeof maxKg !== "number" || capacityKg <= maxKg),
  );
  if (!rate) return undefined;
  return Object.fromEntries(
    DRIVE_HOUR_BANDS.flatMap(({ key }) =>
      typeof rate[key] === "number" ? [[key, rate[key]]] : [],
    ),
  );
}

/** A model without its name or price yet is no model to configure. */
const isComplete = (model: TruckModel) =>
  Boolean(filled(model.name)) && typeof model.price === "number";

const mapModel = (model: TruckModel, rates?: ServiceRate[] | null): ConfiguratorModel => ({
  key: model.id,
  label: model.name.trim(),
  sku: model.sku || undefined,
  series: model.series || undefined,
  capacityKg: model.capacityKg ?? undefined,
  wheels: model.wheels || undefined,
  description: model.description || undefined,
  price: model.price,
  image: imageData(model.image, model.name),
  brochure: brochureData(model.brochure),
  specs: specRows(model.specs),
  optionImages: (model.optionImages ?? []).flatMap(({ option, image }) => {
    const data = imageData(image, model.name);
    return option && data ? [{ option, image: data }] : [];
  }),
  serviceHourlyRates: serviceHourlyRates(rates, model.capacityKg),
});

/**
 * The configurator's view of a family, built from its product data and its published models: the
 * models, the groups of equipment and extras, and the steps' order (the engine builds the steps).
 */
export function mapFamily(family: TruckFamily, allModels: TruckModel[]): ConfiguratorFamily {
  // Models are what is configured; without them the truck type is not shown.
  const models = allModels.filter(isComplete);
  const configurable = models.length > 0;
  return {
    id: family.id,
    key: family.key ?? "",
    name: hyphenate(family.name),
    singularName: hyphenate(family.singularName),
    description: family.description || undefined,
    configurable,
    deliveryTime: family.deliveryTime ?? "",
    warranty: family.warranty ?? "",
    image: imageData(family.image, plain(family.name)),
    brochure: brochureData(family.brochure),
    cardSpec: family.cardSpec || undefined,
    specs: specRows(family.specs),
    defaultModel: idOf(family.defaultModel) ?? undefined,
    seriesTexts: Object.fromEntries(
      (family.series ?? []).flatMap(({ name, description }) =>
        filled(name) && description ? [[name.trim(), description]] : [],
      ),
    ),
    models: configurable ? models.map((model) => mapModel(model, family.serviceRates)) : [],
    choices: configurable
      ? [
          ...(family.equipment ?? []).flatMap((group) => groupChoice(group, false)),
          ...(family.extras ?? []).flatMap((group) => groupChoice(group, true)),
        ]
      : [],
    order: (family.stepOrder ?? []).flatMap(({ step }) => step || []),
  };
}

type ResidualRow = { minMonths: number; maxMonths: number; percent: number };

/** "Restvärde" rows with all three numbers filled in, or none. */
function residualRows(rows: Array<Partial<ResidualRow>> | null | undefined) {
  const complete = (rows ?? []).filter(
    (row): row is ResidualRow =>
      typeof row.minMonths === "number" &&
      typeof row.maxMonths === "number" &&
      typeof row.percent === "number",
  );
  return complete.length
    ? complete.map(({ minMonths, maxMonths, percent }) => ({ minMonths, maxMonths, percent }))
    : undefined;
}

export function mapSettings(
  settings: ConfiguratorSetting | null,
): Omit<ConfiguratorCatalog, "families"> {
  const extras = {
    warrantyNote: settings?.warrantyNote || undefined,
    nextSteps: (settings?.nextSteps ?? []).flatMap((step) =>
      filled(step.heading) ? [{ heading: step.heading, text: step.text || undefined }] : [],
    ),
  };
  // A way to pay without its key, name or kind yet is left out.
  const methods = (settings?.financingMethods ?? []).filter(
    (method) => filled(method.key) && filled(method.label) && method.kind,
  );
  if (!settings || !methods.length) {
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
    serviceAgreement:
      filled(settings.serviceAgreement?.label) &&
      typeof settings.serviceAgreement?.annualPrice === "number"
        ? {
            label: settings.serviceAgreement.label,
            description: settings.serviceAgreement.description || undefined,
            annualPrice: settings.serviceAgreement.annualPrice,
          }
        : DEFAULT_SERVICE_AGREEMENT,
    financingMethods: methods.map((method) => ({
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
      ...(method.kind === "monthly"
        ? {
            interestRate: method.interestRate ?? undefined,
            residualValues: residualRows(method.residualValues),
            residualPercent: method.residualPercent ?? undefined,
            rental: method.rental
              ? {
                  driveHoursPerYear: method.driveHoursPerYear ?? 0,
                  insurancePercent: method.insurancePercent ?? 0,
                }
              : undefined,
          }
        : {}),
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
    return { families: [], ...mapSettings(null) };
  }

  const payload = await getPayloadClient();
  const [families, models, settings] = await Promise.all([
    payload.find({
      collection: "truck-families",
      locale,
      depth: 2,
      draft,
      overrideAccess: draft,
      pagination: false,
      sort: "_order",
      // The models are read below, published ones only outside preview.
      joins: false,
    }),
    payload.find({
      collection: "truck-models",
      locale,
      depth: 1,
      draft,
      overrideAccess: draft,
      pagination: false,
      sort: ["capacityKg", "name"],
      ...(draft ? {} : { where: { _status: { equals: "published" } } }),
    }),
    payload.findGlobal({
      slug: "configurator-settings",
      locale,
      depth: 0,
      draft,
      overrideAccess: draft,
    }),
  ]);

  const modelsOf = (familyId: string) =>
    models.docs.filter((model) => idOf(model.family) === familyId);

  return {
    families: families.docs.map((family) => mapFamily(family, modelsOf(family.id))),
    ...mapSettings(settings),
  };
}

/** Bumped when the catalogue's shape changes, so a cache from before is not read as the new one. */
const CATALOG_VERSION = "2026-10-29g";

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
