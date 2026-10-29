/**
 * Dealer prices (ÅF-priser): the customer price less the dealer discount, in whole kronor. The
 * discount is the model's (`override`), or the shared one in the configurator settings; options
 * get the chosen model's.
 */
export function dealerPrice(price: number, discountPercent: number, override?: number): number {
  const percent = override ?? discountPercent;
  if (!Number.isFinite(percent) || percent <= 0) return price;
  return Math.round(price * (1 - Math.min(percent, 100) / 100));
}

/** What the site knows about a signed-in dealer. */
export type DealerSession = {
  email: string;
  company: string;
  name?: string;
  /** The shared discount, for models without their own. */
  discountPercent: number;
  /** The models' own discounts, by model id. */
  modelDiscounts: Record<string, number>;
};

/** The discount for a model: its own, or the shared one. */
export const discountFor = (
  session: Pick<DealerSession, "discountPercent" | "modelDiscounts">,
  model?: string,
) => (model ? session.modelDiscounts[model] : undefined) ?? session.discountPercent;
