import {
  calculateFinancingPrice,
  estimateTotal,
  sanitizeSelections,
} from "@/features/configurator/engine";
import type { ConfiguratorCatalog } from "@/features/configurator/types";
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

export function familyPrices(
  family: ConfiguratorCatalog["families"][number],
  catalog: ConfiguratorCatalog,
) {
  const leasing = catalog.financingMethods.find(
    (method) => method.key === "leasing" && method.kind === "monthly",
  );
  const total = estimateTotal(family, sanitizeSelections(family, {}));
  return {
    price: formatTruckPrice(total),
    leasing: leasing ? formatTruckPrice(calculateFinancingPrice(total, leasing)) : undefined,
  };
}
