import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { MilevasHero } from "@/components/blocks/milevas-hero";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { familyFromCatalog, familyLink, familyPrices } from "../milevas-data";
import type { LayoutBlockComponentProps, MilevasHeroBlock } from "../types";

export async function MilevasHeroBlockComponent({
  block,
}: LayoutBlockComponentProps<MilevasHeroBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);
  const columns = block.columns.flatMap((item, index) => {
    const family = familyFromCatalog(item.family, catalog);
    const link = family ? familyLink(family) : undefined;
    if (!family || !link) return [];
    const prices = familyPrices(family, catalog);
    return [
      {
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
        id: item.id ?? String(index),
        attributes: editableBlock(item),
        label: `${item.heading} ${family.name}`,
        name: family.name,
        image: family.image ? (
          <Image
            src={family.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 26.25rem, 75vw"
            className="object-contain object-bottom"
          />
        ) : undefined,
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
      highlight={
        block.highlight ? <span {...editableField("highlight")}>{block.highlight}</span> : undefined
      }
      prompt={block.prompt ? <span {...editableField("prompt")}>{block.prompt}</span> : undefined}
      columns={columns}
      activeColumn={block.activeColumn ?? 3}
    />
  );
}
