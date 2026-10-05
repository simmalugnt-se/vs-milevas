import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { Navigation, type NavigationLink } from "@/components/blocks/navigation";
import { Link } from "@/i18n/navigation";
import { getHeader, resolveNavItem } from "@/payload/data/globals";
import { resolveLinkField } from "@/payload/utilities/link-field";

type HeaderComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

/**
 * The site's header: the Navigation block (Figma 8309:4506) fed by the Header global, with the
 * boilerplate's optional announcement bar above it. `siteName` and `siteTagline` stay in the global
 * but are not shown: Figma's navigation has only the logo symbol.
 */
export async function HeaderComponent({ draft = false, locale }: HeaderComponentProps) {
  const header = await getHeader(locale, draft);
  const t = await getTranslations({ locale, namespace: "nav" });

  const announcementLink = resolveLinkField(header.announcementLink);
  const cta = resolveLinkField(header.cta);

  // Click-to-edit markers, only in Live Preview; they respond while the header is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  const links = (header.navItems ?? []).flatMap((item): NavigationLink[] => {
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
    <header data-layout-block="header" {...mark(editableGlobal("header"))}>
      {header.showAnnouncement && header.announcement ? (
        <div className="bg-bg-inv-fill text-text-s text-ui-inv-primary">
          <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-(--grid-margin) py-2">
            <p {...mark(editableField("announcement"))}>{header.announcement}</p>
            {announcementLink ? (
              <Link
                href={announcementLink.href}
                rel={announcementLink.rel}
                target={announcementLink.target}
                className="underline underline-offset-4"
                {...mark(editableField("announcementLink.label"))}
              >
                {header.announcementLink?.label}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <Navigation
        links={links}
        cta={
          cta && header.cta?.label
            ? {
                label: header.cta.label,
                href: cta.href,
                rel: cta.rel,
                target: cta.target,
                attributes: mark(editableField("cta.label")),
              }
            : undefined
        }
        menuLabel={t("menu")}
        closeLabel={t("close")}
      />
    </header>
  );
}
