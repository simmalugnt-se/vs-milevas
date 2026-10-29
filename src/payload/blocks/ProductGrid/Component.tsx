import { editableBlock } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "@/components/blocks/product-grid";
import type { DealerProductCardProps } from "@/components/ui/dealer-product-card";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { familyCardSpecs, familyFromCatalog, familyLink, familyPrices } from "../milevas-data";
import type { LayoutBlockComponentProps, ProductGridBlock } from "../types";

export async function ProductGridBlockComponent({
  block,
}: LayoutBlockComponentProps<ProductGridBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);
  const products = block.products.flatMap((item): DealerProductCardProps[] => {
    const family = familyFromCatalog(item.family, catalog);
    const link = family ? familyLink(family) : undefined;
    if (!family || !link) return [];
    return [
      {
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
        ...editableBlock(item),
        brand: block.brand ?? "",
        category: block.category ?? "",
        name: family.name,
        specs: familyCardSpecs(family),
        ...familyPrices(family, catalog),
        // The truck type's main image, always whole: a cut-out truck on its bottom edge.
        image: family.image ? (
          <Image
            src={family.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 90vw"
            className="object-contain"
          />
        ) : null,
      },
    ];
  });
  return <ProductGrid id={block.anchor ?? undefined} label={block.label} products={products} />;
}
