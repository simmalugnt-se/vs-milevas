/**
 * Dealer prices (ÅF-priser): the customer price less the dealer discount set in the configurator
 * settings, in whole kronor. One percentage for every price for now; a percentage per price can
 * override it later (`override`), which is why every price goes through here.
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
  discountPercent: number;
};
