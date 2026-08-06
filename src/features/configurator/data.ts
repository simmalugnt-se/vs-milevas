import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { getPayloadClient } from "@/payload/get-payload";
import { getMediaImageURL, getMediaObject } from "@/payload/utilities/media";
import type { ConfiguratorSetting, Document, TruckFamily } from "@/payload-types";
import type {
  ConfiguratorCatalog,
  ConfiguratorCondition,
  ConfiguratorFamily,
  ConfiguratorOption,
} from "./types";

const DEFAULT_FINANCING: ConfiguratorCatalog["financingMethods"] = [
  { key: "purchase", label: "Köp", kind: "purchase" },
  { key: "leasing", label: "Leasing", kind: "monthly", months: 48, monthlyFactor: 0.01875 },
  {
    key: "long-term-rental",
    label: "Långtidshyra",
    kind: "monthly",
    months: 48,
    monthlyFactor: 0.0191667,
  },
];

function references(
  values: Array<{ reference: string; id?: string | null }> | null | undefined,
): string[] {
  return values?.map(({ reference }) => reference).filter(Boolean) ?? [];
}

function mapConditions(
  option: TruckFamily["steps"][number]["groups"][number]["options"][number],
): ConfiguratorCondition {
  return {
    allOf: references(option.conditions?.allOf),
    anyOf: references(option.conditions?.anyOf),
    noneOf: references(option.conditions?.noneOf),
  };
}

function mapOption(
  option: TruckFamily["steps"][number]["groups"][number]["options"][number],
): ConfiguratorOption {
  return {
    key: option.key,
    label: option.label,
    description: option.description || undefined,
    priceMode: option.priceMode,
    price: option.price,
    defaultSelected: option.defaultSelected === true,
    sku: option.sku || undefined,
    conditions: mapConditions(option),
    specifications: option.specifications?.map(({ label, value }) => ({ label, value })) ?? [],
  };
}

function brochureData(document: TruckFamily["brochure"]): ConfiguratorFamily["brochure"] {
  if (!document || typeof document !== "object") {
    return undefined;
  }
  const resolved = document as Document;
  return resolved.url ? { title: resolved.title, url: resolved.url } : undefined;
}

function mapFamily(family: TruckFamily): ConfiguratorFamily {
  const media = getMediaObject(family.image);
  const imageUrl = getMediaImageURL(family.image);

  return {
    key: family.key,
    name: family.name,
    description: family.description || undefined,
    basePrice: family.basePrice,
    sku: family.sku || undefined,
    deliveryTime: family.deliveryTime,
    warranty: family.warranty,
    image: media && imageUrl ? { alt: media.alt || family.name, url: imageUrl } : undefined,
    brochure: brochureData(family.brochure),
    steps: family.steps.map((step) => ({
      key: step.key,
      label: step.label,
      heading: step.heading,
      description: step.description || undefined,
      groups: step.groups.map((group) => ({
        key: group.key,
        label: group.label,
        description: group.description || undefined,
        selectionMode: group.selectionMode,
        required: group.required === true,
        options: group.options.map(mapOption),
      })),
    })),
  };
}

function mapSettings(
  settings: ConfiguratorSetting | null,
): Pick<ConfiguratorCatalog, "financingMethods" | "quoteValidityDays"> {
  if (!settings?.financingMethods?.length) {
    return { financingMethods: DEFAULT_FINANCING, quoteValidityDays: 14 };
  }

  return {
    quoteValidityDays: settings.quoteValidityDays || 14,
    financingMethods: settings.financingMethods.map((method) => ({
      key: method.key,
      label: method.label,
      description: method.description || undefined,
      kind: method.kind,
      months: method.months ?? undefined,
      monthlyFactor: method.monthlyFactor ?? undefined,
    })),
  };
}

async function fetchConfiguratorCatalog(
  locale: TypedLocale,
  draft: boolean,
): Promise<ConfiguratorCatalog> {
  if (!(await getPayloadDbReady()).ready) {
    return { families: [], ...mapSettings(null) };
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
    ...mapSettings(settings),
  };
}

const getCachedCatalog = (locale: TypedLocale) =>
  unstable_cache(() => fetchConfiguratorCatalog(locale, false), ["configurator-catalog", locale], {
    tags: ["truck-families", "configurator-settings"],
  })();

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
