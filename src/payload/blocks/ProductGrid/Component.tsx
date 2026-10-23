import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "@/components/blocks/product-grid";
import type { ProductCardProps } from "@/components/ui/product-card";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { familyCardSpecs, familyFromCatalog, familyLink, familyPrices } from "../milevas-data";
import type { LayoutBlockComponentProps, ProductGridBlock } from "../types";

export async function ProductGridBlockComponent({
  block,
}: LayoutBlockComponentProps<ProductGridBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);
  const products = block.products.flatMap((item): ProductCardProps[] => {
    const family = familyFromCatalog(item.family, catalog);
    const link = family ? familyLink(family) : undefined;
    if (!family || !link) return [];
    const crop = item.imageFit === "crop" ? item.imageCrop : undefined;
    return [
      {
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
        ...editableBlock(item),
        brand: block.brand ?? "",
        category: block.category ?? "",
        name: family.name,
        specs: familyCardSpecs(family, catalog),
        ...familyPrices(family, catalog),
        image: family.image ? (
          <span className="absolute inset-0 block overflow-hidden" {...editableField("imageFit")}>
            <span
              className="absolute block"
              style={{
                width: `${crop?.width ?? 100}%`,
                height: `${crop?.height ?? 100}%`,
                left: `${crop?.left ?? 0}%`,
                top: `${crop?.top ?? 0}%`,
              }}
            >
              <Image
                src={family.image.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 90vw"
                className={item.imageFit === "cover" ? "object-cover" : "object-contain"}
              />
            </span>
          </span>
        ) : null,
      },
    ];
  });
  return <ProductGrid id={block.anchor ?? undefined} label={block.label} products={products} />;
}
