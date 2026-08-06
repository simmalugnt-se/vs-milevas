import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import { ConfiguratorClient } from "@/features/configurator/ConfiguratorClient";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import type { ConfiguratorBlock, LayoutBlockComponentProps } from "../types";

export async function ConfiguratorBlockComponent({
  block,
}: LayoutBlockComponentProps<ConfiguratorBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);

  return (
    <section className="space-y-7" id="truck-configurator">
      {block.heading || block.intro ? (
        <header className="grid gap-4 border-b border-neutral-300 pb-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)] md:items-end">
          {block.heading ? (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Truckkonfigurator
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                {block.heading}
              </h1>
            </div>
          ) : null}
          {block.intro ? (
            <p className="max-w-xl text-sm leading-6 text-neutral-600">{block.intro}</p>
          ) : null}
        </header>
      ) : null}
      <ConfiguratorClient catalog={catalog} locale={locale} />
    </section>
  );
}
