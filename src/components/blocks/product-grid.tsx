import { ProductCard, type ProductCardProps } from "@/components/ui/product-card";

/**
 * Product-Grid from Figma "04 — Blocks" (8365:8988): product-cards on `bg-inv-fill`, with
 * `grid/margin` around and `grid/gap` between.
 * - Desktop L and S: three per row (`card-grid-3`, each card 4 of the 12 columns).
 * - Tablet: two per row.
 * - Mobile: a horizontal slider (Figma "product-slider"); a card is the width less
 *   `spacing/md`, so the next one shows at the edge.
 * The cards keep Figma's proportions per mode (see ProductCard).
 *
 * A component with props for now; `TruckFamilies` will feed it as a Payload block.
 */

type ProductGridProps = {
  products: ProductCardProps[];
  /** Accessible name of the list, e.g. "Modeller". */
  label?: string;
};

export function ProductGrid({ products, label }: ProductGridProps) {
  return (
    <section aria-label={label} className="bg-bg-inv-fill py-(--grid-margin)">
      {/* The slider runs to the screen edge; its padding keeps the first card on the margin. */}
      <ul className="flex snap-x snap-mandatory scroll-px-(--grid-margin) gap-(--grid-gap) overflow-x-auto px-(--grid-margin) [scrollbar-width:none] tablet:card-grid-3 tablet:overflow-visible">
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
