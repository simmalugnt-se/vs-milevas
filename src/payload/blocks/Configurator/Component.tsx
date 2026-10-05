import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import { ConfiguratorClient } from "@/features/configurator/ConfiguratorClient";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import type { ConfiguratorBlock, LayoutBlockComponentProps } from "../types";

/** The truck configurator across the full width: <main> pads with the grid margin, so cancel it. */
export async function ConfiguratorBlockComponent(_: LayoutBlockComponentProps<ConfiguratorBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);

  return (
    <section className="-mx-(--grid-margin)" id="truck-configurator">
      <ConfiguratorClient catalog={catalog} locale={locale} />
    </section>
  );
}
