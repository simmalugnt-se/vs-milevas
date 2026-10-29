import {
  calculateFinancingPrice,
  chosenModel,
  estimateTotal,
  isConfigurable,
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

/**
 * Where a family's cards, columns and menu links lead: its configurator. A family without
 * published models has none, and is left out of them.
 */
export function familyLink(
  family: ConfiguratorFamily,
): { href: string; rel?: string; target?: "_blank" } | undefined {
  if (!isConfigurable(family)) return undefined;
  return { href: `/configurator?family=${encodeURIComponent(family.key)}&step=1` };
}

/** The price of the configuration a card opens (the defaults), and its leasing per month. */
export function familyPrices(family: ConfiguratorFamily, catalog: ConfiguratorCatalog) {
  if (!isConfigurable(family)) {
    return { price: undefined, leasing: undefined, amount: undefined, model: undefined };
  }
  const leasing = catalog.financingMethods.find(
    (method) => method.key === "leasing" && method.kind === "monthly",
  );
  const selections = sanitizeSelections(family, {});
  const total = estimateTotal(family, selections);
  const model = chosenModel(family, selections);
  return {
    price: formatTruckPrice(total),
    /** The start price in kronor, for the dealer price beside it, and the model it is. */
    amount: total,
    model: model?.key,
    leasing: leasing ? formatTruckPrice(calculateFinancingPrice(total, leasing, model)) : undefined,
  };
}

const formatTons = (kg: number) =>
  new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    kg / 1000,
  );

/**
 * The product card's specs: the models' lift capacity as a range ("1,5 – 3,5 ton"), then the
 * truck type's text for the card ("80 V 228 Ah").
 */
export function familyCardSpecs(family: ConfiguratorFamily) {
  const capacities = family.models.flatMap((model) => model.capacityKg ?? []);
  const low = Math.min(...capacities);
  const high = Math.max(...capacities);
  const capacity = capacities.length
    ? low === high
      ? `${formatTons(low)} ton`
      : `${formatTons(low)} – ${formatTons(high)} ton`
    : undefined;
  return [...(capacity ? [capacity] : []), ...(family.cardSpec ? [family.cardSpec] : [])];
}
