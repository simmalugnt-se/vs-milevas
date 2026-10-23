import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import { ConfiguratorClient } from "@/features/configurator/ConfiguratorClient";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import type { ConfiguratorBlock, LayoutBlockComponentProps } from "../types";

/**
 * The configurator as on Figma's Konfigurator page: the screen from the top of the page, under the
 * overlaid navigation, which turns Light here (`data-navigation`). The screen owns its spacing.
 */
export async function ConfiguratorBlockComponent(_: LayoutBlockComponentProps<ConfiguratorBlock>) {
  const locale = await getLocale();
  const { isEnabled: draft } = await draftMode();
  const catalog = await getConfiguratorCatalog(locale, draft);

  return (
    <section className="bg-bg-fill-secondary" id="truck-configurator" data-navigation="light">
      <ConfiguratorClient catalog={catalog} locale={locale} />
    </section>
  );
}
