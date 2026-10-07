import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import { MilevasHero } from "@/components/blocks/milevas-hero";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { familyFromCatalog, familyPrices } from "../milevas-data";
import type { LayoutBlockComponentProps, MilevasHeroBlock } from "../types";

export async function MilevasHeroBlockComponent({
  block,
}: LayoutBlockComponentProps<MilevasHeroBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);
  const columns = block.columns.flatMap((item, index) => {
    const family = familyFromCatalog(item.family, catalog);
    if (item.family && !family) return [];
    const link = family
      ? { href: `/configurator?family=${encodeURIComponent(family.key)}&step=1` }
      : resolveLinkField(item.link);
    if (!link) return [];
    const prices = family
      ? familyPrices(family, catalog)
      : { price: item.price, leasing: item.leasing };
    return [
      {
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
        id: item.id ?? String(index),
        attributes: editableBlock(item),
        label: family ? `${item.heading} ${family.name}` : item.heading,
        heading: <span {...editableField("heading")}>{item.heading}</span>,
        rows: [
          ...(prices.price ? [{ label: "Från", value: prices.price }] : []),
          ...(prices.leasing ? [{ label: "Leasing från:", value: `${prices.leasing}/mån` }] : []),
        ],
      },
    ];
  });
  return (
    <MilevasHero
      id={block.anchor ?? undefined}
      heading={<span {...editableField("heading")}>{block.heading}</span>}
      columns={columns}
      activeColumn={block.activeColumn ?? 3}
    />
  );
}
