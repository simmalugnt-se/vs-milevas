import {
  calculateFinancingPrice,
  estimateTotal,
  familySteps,
  MODEL_CHOICE,
  resolveSpecifications,
  sanitizeSelections,
} from "@/features/configurator/engine";
import type { ConfiguratorCatalog, ConfiguratorFamily } from "@/features/configurator/types";
import type { TruckFamily } from "@/payload-types";

export function familyFromCatalog(
  reference: string | TruckFamily | null | undefined,
  catalog: ConfiguratorCatalog,
) {
  // Use only families the catalog exposes (published outside preview), even if the relationship is populated.
  if (!reference) return undefined;
  const id = typeof reference === "string" ? reference : reference.id;
  return catalog.families.find((family) => family.id === id);
}

export const formatTruckPrice = (value: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);

/** Where a family's cards and columns lead: its configurator, or its contact link. */
export function familyLink(family: ConfiguratorFamily) {
  if (familySteps(family).length > 0) {
    return { href: `/configurator?family=${encodeURIComponent(family.key)}&step=1` };
  }
  return family.contactLink;
}

/** The price of the configuration a card opens (the defaults), and its leasing per month. */
export function familyPrices(family: ConfiguratorFamily, catalog: ConfiguratorCatalog) {
  if (familySteps(family).length === 0) return { price: undefined, leasing: undefined };
  const leasing = catalog.financingMethods.find(
    (method) => method.key === "leasing" && method.kind === "monthly",
  );
  const total = estimateTotal(family, sanitizeSelections(family, {}));
  return {
    price: formatTruckPrice(total),
    leasing: leasing ? formatTruckPrice(calculateFinancingPrice(total, leasing)) : undefined,
  };
}

const formatTons = (kg: number) =>
  new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    kg / 1000,
  );

/**
 * The product card's specs: the models' lift capacity as a range ("1,5 – 3,5 ton"), then the
 * specifications marked for the card, as the default model has them.
 */
export function familyCardSpecs(family: ConfiguratorFamily, catalog: ConfiguratorCatalog) {
  const capacities = family.models.flatMap((model) => model.capacityKg ?? []);
  const low = Math.min(...capacities);
  const high = Math.max(...capacities);
  const capacity = capacities.length
    ? low === high
      ? `${formatTons(low)} ton`
      : `${formatTons(low)} – ${formatTons(high)} ton`
    : undefined;
  const modelKey = sanitizeSelections(family, {})[MODEL_CHOICE]?.[0];
  const model = family.models.find((candidate) => candidate.key === modelKey);
  const onCard = resolveSpecifications({ specs: catalog.specs.filter((spec) => spec.onCard) }, [
    family.specs,
    model?.specs ?? [],
  ]).map(({ value }) => value);
  return [...(capacity ? [capacity] : []), ...onCard];
}
