import { unstable_cache, unstable_noStore } from "next/cache";
import type { TypedLocale } from "payload";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { getMediaImageURL } from "@/payload/utilities/media";
import type { ConfiguratorSetting, Document, Image, TruckFamily, TruckSpec } from "@/payload-types";
import type {
  ConfiguratorCatalog,
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

type FamilyChoice = NonNullable<TruckFamily["choices"]>[number];
type SpecRows = NonNullable<TruckFamily["specs"]>;

/** Values by specification key; a value whose type is not populated is left out. */
function mapSpecs(rows: SpecRows | null | undefined): SpecValue[] {
  return (rows ?? []).flatMap(({ spec, value }) =>
    spec && typeof spec === "object" ? [{ spec: spec.key, value }] : [],
  );
}

function imageData(value: string | Image | null | undefined, alt: string) {
  const image = value && typeof value === "object" ? value : null;
  const url = getMediaImageURL(value);
  return image && url ? { alt: image.alt || alt, url } : undefined;
}

function mapOption(option: FamilyChoice["options"][number]): ConfiguratorOption {
  return {
    key: option.key,
    label: option.label,
    description: option.description || undefined,
    image: imageData(option.image, option.label),
    price: option.price,
    default: option.defaultSelected === true,
    sku: option.sku || undefined,
    models: option.models ?? [],
    requires: option.requires ?? [],
    excludes: option.excludes ?? [],
    specs: mapSpecs(option.specs),
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
  const configurable = family.configurable !== false;
  const contactLink = configurable ? null : resolveLinkField(family.contactLink);
  return {
    id: family.id,
    key: family.key,
    name: family.name,
    singularName: family.singularName,
    description: family.description || undefined,
    configurable,
    contactLink: contactLink
      ? { href: contactLink.href, rel: contactLink.rel, target: contactLink.target }
      : undefined,
    deliveryTime: family.deliveryTime ?? "",
    warranty: family.warranty ?? "",
    image: imageData(family.image, family.name),
    brochure: brochureData(family.brochure),
    specs: mapSpecs(family.specs),
    modelChoice: { label: family.modelChoice.label, heading: family.modelChoice.heading },
    models: configurable
      ? (family.models ?? []).map((model) => ({
          key: model.key,
          label: model.label,
          description: model.description || undefined,
          sku: model.sku || undefined,
          price: model.price,
          capacityKg: model.capacityKg ?? undefined,
          default: model.defaultSelected === true,
          specs: mapSpecs(model.specs),
        }))
      : [],
    choices: configurable
      ? (family.choices ?? []).map((choice) => ({
          key: choice.key,
          label: choice.label,
          heading: choice.heading,
          help: choice.help || undefined,
          selectionMode: choice.selectionMode,
          required: choice.required === true,
          display: choice.display ?? undefined,
          options: choice.options.map(mapOption),
        }))
      : [],
  };
}

function mapSpec(spec: TruckSpec): ConfiguratorSpec {
  return {
    key: spec.key,
    label: spec.label,
    unit: spec.unit || undefined,
    sortOrder: spec.sortOrder,
    onCard: spec.onCard === true,
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
    return { families: [], specs: [], ...mapSettings(null) };
  }

  const payload = await getPayloadClient();
  const [families, specs, settings] = await Promise.all([
    payload.find({
      collection: "truck-families",
      locale,
      depth: 2,
      draft,
      overrideAccess: draft,
      pagination: false,
      sort: "sortOrder",
    }),
    payload.find({
      collection: "truck-specs",
      locale,
      depth: 0,
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
    specs: specs.docs.map(mapSpec),
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
