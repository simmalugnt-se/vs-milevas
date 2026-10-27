import { dealerPrice } from "@/features/dealers/pricing";
import { financingLabel, MODEL_CHOICE } from "./engine";
import type { ConfiguratorQuote } from "./types";

/** Labels keep their soft hyphens (`|` in the CMS) for the site; Admin shows them plain. */
const plain = (text: string | undefined) => text?.replaceAll("­", "") || undefined;

/**
 * A request's configuration as readable fields in Admin, from the quote it was sent with. The quote
 * itself stays in `snapshot`. With a dealer, each line and the total carry the dealer price too.
 */
export function quoteFields(
  quote: ConfiguratorQuote,
  dealer?: { id: string; discountPercent: number },
) {
  const forDealer = (price: number) =>
    dealer && dealer.discountPercent > 0 ? dealerPrice(price, dealer.discountPercent) : undefined;
  return {
    familyName: plain(quote.familySingularName ?? quote.familyName),
    model: plain(quote.selectedOptions.find((option) => option.groupKey === MODEL_CHOICE)?.label),
    sku: quote.sku || undefined,
    // Older snapshots have no `complete` and are whole.
    complete: quote.complete !== false,
    lines: quote.lines.map((line) => ({
      label: plain(line.label) ?? "",
      price: line.price,
      dealerPrice: line.kind === "service" ? undefined : forDealer(line.price),
      kind: line.kind,
    })),
    totalPrice: quote.totalPrice,
    dealer: dealer?.id,
    dealerTotalPrice: forDealer(quote.totalPrice),
    financing: {
      label: financingLabel(quote.financing, { residual: true }),
      price: quote.financingPrice,
      monthly: quote.financing.kind === "monthly",
    },
    specifications: quote.specifications.map((spec) => ({ label: spec.label, value: spec.value })),
    deliveryTime: quote.deliveryTime || undefined,
    warranty: quote.warranty || undefined,
  };
}
