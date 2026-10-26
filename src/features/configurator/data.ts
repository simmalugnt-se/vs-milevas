import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { TRUCK_SPECS } from "@/payload/collections/TruckFamilies/specs";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { getMediaImageURL } from "@/payload/utilities/media";
import type { ConfiguratorSetting, Document, Image, TruckFamily } from "@/payload-types";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorOption,
  ConfiguratorSpec,
  SpecValue,
} from "./types";

const DEFAULT_FINANCING: ConfiguratorCatalog["financingMethods"] = [
  { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
  {
    key: "leasing",
    label: "Leasing",
    kind: "monthly",
    months: 48,
    monthlyFactor: 0.01875,
    serviceAgreementEligible: true,
  },
  {
    key: "long-term-rental",
    label: "Långtidshyra",
    kind: "monthly",
    months: 48,
    monthlyFactor: 0.0191667,
    serviceAgreementEligible: false,
  },
];

const DEFAULT_SERVICE_AGREEMENT: NonNullable<ConfiguratorCatalog["serviceAgreement"]> = {
  label: "Serviceavtal",
  description: "Årlig kostnad. Faktureras separat.",
  annualPrice: 2856,
};

/** `|` in a name is where it may break, shown as a hyphen only then (a soft hyphen). */
const hyphenate = (text: string) => text.replaceAll("|", "\u00AD");
/** The name without its break marks, for alt texts. */
const plain = (text: string) => text.replaceAll("|", "");

type SpecFields = Partial<Record<(typeof TRUCK_SPECS)[number]["name"], string | null>>;

/** The specifications as the configurator names and orders them, from `TRUCK_SPECS`. */
const SPECS: ConfiguratorSpec[] = TRUCK_SPECS.map((spec, index) => ({
  key: spec.name,
  label: spec.label,
  unit: "unit" in spec ? spec.unit : undefined,
  sortOrder: index,
  onCard: "onCard" in spec && spec.onCard,
  inQuote: !("inQuote" in spec) || spec.inQuote,
}));

/** The filled-in specifications; an empty field is left out. */
function mapSpecs(fields: SpecFields | null | undefined): SpecValue[] {
  return TRUCK_SPECS.flatMap(({ name }) => {
    const value = fields?.[name]?.trim();
    return value ? [{ spec: name, value }] : [];
  });
}

function imageData(value: string | Image | null | undefined, alt: string) {
  const image = value && typeof value === "object" ? value : null;
  const url = getMediaImageURL(value);
  return image && url ? { alt: image.alt || alt, url } : undefined;
}

type StepOption = {
  id?: string | null;
  label: string;
  description?: string | null;
  image?: string | Image | null;
  price: number;
  defaultSelected?: boolean | null;
  buildHeight?: string | null;
};

/** An option keeps its row id as its key, so the URL and the quote point at it. */
function mapOption(option: StepOption): ConfiguratorOption {
  const buildHeight = option.buildHeight?.trim();
  return {
    key: option.id ?? option.label,
    label: hyphenate(option.label),
    description:
      option.description ||
      (buildHeight ? `Truckens höjd med denna mast: ${buildHeight} mm` : undefined),
    image: imageData(option.image, plain(option.label)),
    price: option.price,
    default: option.defaultSelected === true,
    specs: buildHeight ? [{ spec: "buildHeight", value: buildHeight }] : [],
  };
}

/**
 * The steps after the model, in Figma's order; a step without options is left out. Their texts
 * and types are the configurator's, the same for every family.
 */
function familyChoices(family: TruckFamily): ConfiguratorChoice[] {
  const steps: ConfiguratorChoice[] = [
    {
      key: "battery",
      label: "Batteri",
      heading: "Välj batteri",
      selectionMode: "single",
      required: true,
      display: "stack",
      options: (family.battery?.options ?? []).map(mapOption),
    },
    {
      key: "lift-height",
      label: "Lyfthöjd",
      heading: "Välj lyfthöjd",
      help: family.liftHeight?.help || undefined,
      selectionMode: "single",
      required: true,
      display: "stack",
      options: (family.liftHeight?.options ?? []).map(mapOption),
    },
    {
      key: "extras",
      label: "Tillval",
      heading: "Välj tillval",
      selectionMode: "multiple",
      required: false,
      options: (family.extras?.options ?? []).map(mapOption),
    },
  ];
  return steps.filter((step) => step.options.length > 0);
}

function brochureData(document: TruckFamily["brochure"]): ConfiguratorFamily["brochure"] {
  if (!document || typeof document !== "object") {
    return undefined;
  }
  const resolved = document as Document;
  return resolved.url ? { title: resolved.title, url: resolved.url } : undefined;
}

function mapFamily(family: TruckFamily): ConfiguratorFamily {
  const configurable = family.configurable !== false;
  const contactLink = configurable ? null : resolveLinkField(family.contactLink);
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
    specs: mapSpecs(family.specs),
    modelChoice: { label: family.modelChoice.label, heading: family.modelChoice.heading },
    models: configurable
      ? (family.models ?? []).map((model) => ({
          key: model.id ?? model.label,
          label: model.label,
          sku: model.sku || undefined,
          price: model.price,
          capacityKg: model.capacityKg ?? undefined,
          default: model.defaultSelected === true,
          specs: mapSpecs(model.specs),
        }))
      : [],
    choices: configurable ? familyChoices(family) : [],
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
      monthlyFactor: method.monthlyFactor ?? undefined,
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
      sort: "sortOrder",
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
    families: families.docs.map(mapFamily),
    specs: SPECS,
    ...mapSettings(settings),
  };
}

/** Bumped when the catalogue's shape changes, so a cache from before is not read as the new one. */
const CATALOG_VERSION = "2026-10-26";

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
