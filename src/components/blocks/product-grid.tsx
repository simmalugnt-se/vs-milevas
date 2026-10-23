import type { HTMLAttributes } from "react";
import { ProductCard, type ProductCardProps } from "@/components/ui/product-card";

/**
 * Product-Grid from Figma "04 — Blocks" (8365:8988): product-cards on Dark `bg-fill`, with
 * `grid/margin` at the sides and `grid/gap` between, and nothing above or below them.
 * - Desktop L and S: three per row (each card 4 of the 12 columns).
 * - Tablet: two per row.
 * - Mobile: a horizontal slider (Figma "product-slider"); a card is the width less
 *   `spacing/md`, so the next one shows at the edge.
 * Figma's cards are 507px high in every mode; here each mode keeps the proportion of its frame's
 * cards (339, 388, 416 and 469 wide), so they scale with the width between the frames.
 *
 * Reused by the ProductGrid Payload block, with optional TruckFamilies data.
 */

type ProductGridProps = HTMLAttributes<HTMLElement> & {
  products: ProductCardProps[];
  /** Accessible name of the list, e.g. "Modeller". */
  label?: string;
};

export function ProductGrid({ products, label, ...attributes }: ProductGridProps) {
  return (
    <section
      {...attributes}
      aria-label={label}
      className="mode-dark bg-bg-fill [overflow-anchor:none]"
    >
      {/* The slider runs to the screen edge; its padding keeps the first card on the margin. */}
      <ul className="flex snap-x snap-mandatory scroll-px-(--grid-margin) gap-(--grid-gap) overflow-x-auto px-(--grid-margin) [scrollbar-width:none] [--card-aspect:339/507] tablet:grid tablet:grid-cols-2 tablet:overflow-visible tablet:[--card-aspect:388/507] desktop-s:grid-cols-3 desktop-s:[--card-aspect:416/507] desktop-l:[--card-aspect:469.33/507]">
        {products.map((product) => (
          <li
            key={String(product.href)}
            className="w-[calc(100%-var(--spacing-md))] shrink-0 snap-start tablet:w-auto"
          >
            <ProductCard {...product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
