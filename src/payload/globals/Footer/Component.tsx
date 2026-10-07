import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { Footer, type FooterLink } from "@/components/blocks/footer";
import { getFooter, resolveNavItem } from "@/payload/data/globals";

type FooterComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

/**
 * The site's footer: the Footer block (Figma 6076:622) fed by the Footer global. `copyright` stays
 * in the global but is not shown: Figma's footer has none.
 */
export async function FooterComponent({ draft = false, locale }: FooterComponentProps) {
  const footer = await getFooter(locale, draft);
  const t = await getTranslations({ locale, namespace: "footer" });

  // Click-to-edit markers, only in Live Preview; they respond while the footer is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  const links = (footer.navItems ?? []).flatMap((item): FooterLink[] => {
    const resolved = resolveNavItem(item);
    if (!resolved) return [];
    return [
      {
        label: <span {...mark(editableField("link.label"))}>{item.link.label}</span>,
        href: resolved.href,
        rel: resolved.rel,
        target: resolved.target,
        attributes: mark(editableBlock(item)),
      },
    ];
  });

  return (
    <Footer
      links={links}
      email={
        footer.email
          ? { address: footer.email, label: t("email"), attributes: mark(editableField("email")) }
          : undefined
      }
      languageLabel={t("otherLanguage")}
      attributes={{
        id: "kontakt",
        "data-layout-block": "footer",
        ...mark(editableGlobal("footer")),
      }}
    />
  );
}
