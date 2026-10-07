import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import { ConfiguratorClient } from "@/features/configurator/ConfiguratorClient";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import type { ConfiguratorBlock, LayoutBlockComponentProps } from "../types";

/** Full-width block; ConfiguratorScreen owns its internal spacing. */
export async function ConfiguratorBlockComponent(_: LayoutBlockComponentProps<ConfiguratorBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);

  return (
    <section id="truck-configurator">
      <ConfiguratorClient catalog={catalog} locale={locale} />
    </section>
  );
}
