import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "@/components/blocks/product-grid";
import type { ProductCardProps } from "@/components/ui/product-card";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { getMediaImageURL } from "@/payload/utilities/media";
import { familyFromCatalog, familyPrices, formatTruckPrice } from "../milevas-data";
import type { LayoutBlockComponentProps, ProductGridBlock } from "../types";

export async function ProductGridBlockComponent({
  block,
}: LayoutBlockComponentProps<ProductGridBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);
  const products = block.products.flatMap((item): ProductCardProps[] => {
    const family = familyFromCatalog(item.family, catalog);
    if (item.family && !family) return [];
    const link = family
      ? { href: `/configurator?family=${encodeURIComponent(family.key)}&step=1` }
      : resolveLinkField(item.link);
    if (!link) return [];
    const src = getMediaImageURL(item.image) ?? family?.image?.url;
    const prices = family
      ? familyPrices(family, catalog)
      : {
          price: item.price != null ? formatTruckPrice(item.price) : undefined,
          leasing: item.leasing != null ? formatTruckPrice(item.leasing) : undefined,
        };
    return [
      {
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
        ...editableBlock(item),
        brand: block.brand ?? "",
        category: block.category ?? "",
        name: (
          <span {...editableField("name")}>{item.name || family?.name || item.link?.label}</span>
        ),
        specs: [item.capacity, item.battery].filter(Boolean).map((spec, index) => (
          <span key={index} {...editableField(spec === item.capacity ? "capacity" : "battery")}>
            {spec}
          </span>
        )),
        ...prices,
        image: src ? (
          <span className="absolute inset-0 block overflow-hidden" {...editableField("image")}>
            <span
              className="absolute block"
              style={{
                width: `${item.imageFit === "crop" ? (item.imageCrop?.width ?? 100) : 100}%`,
                height: `${item.imageFit === "crop" ? (item.imageCrop?.height ?? 100) : 100}%`,
                left: `${item.imageFit === "crop" ? (item.imageCrop?.left ?? 0) : 0}%`,
                top: `${item.imageFit === "crop" ? (item.imageCrop?.top ?? 0) : 0}%`,
              }}
            >
              <Image
                src={src}
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
