"use client";

import { useDealerPrice } from "@/features/dealers/DealerProvider";
import { ProductCard, type ProductCardProps } from "./product-card";

export type DealerProductCardProps = ProductCardProps & {
  /** The customer price the card starts at, in kronor, for the dealer price. */
  amount?: number;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * The product card, as Figma's `hover-INLOGGAD` for a signed-in dealer: "Ditt ÅF-pris:" and the
 * customer price as "Kundpris:" where the leasing price is otherwise.
 */
export function DealerProductCard({ amount, ...props }: DealerProductCardProps) {
  const dealerPrice = useDealerPrice();
  const dealer = amount === undefined ? null : dealerPrice(amount);
  if (dealer === null || amount === undefined) return <ProductCard {...props} />;
  return (
    <ProductCard {...props} loggedIn price={formatPrice(dealer)} leasing={formatPrice(amount)} />
  );
}
