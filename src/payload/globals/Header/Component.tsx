import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { Navigation, type NavigationMenu } from "@/components/blocks/navigation";
import { Link } from "@/i18n/navigation";
import { getHeader, resolveNavItem } from "@/payload/data/globals";
import { resolveLinkField } from "@/payload/utilities/link-field";

type HeaderComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

/**
 * The site's header: the Navigation block (Figma 9051:12518) fed by the Header global, with the
 * boilerplate's optional announcement bar above it. `siteName` and `siteTagline` stay in the global
 * but are not shown, and neither is `cta`: Figma's navigation has no button. The global has no
 * fields for the menus' links and images or for the login link yet, so each `navItems` link is a
 * menu without links (a plain link). Dark, since the site's sections are dark.
 */
export async function HeaderComponent({ draft = false, locale }: HeaderComponentProps) {
  const header = await getHeader(locale, draft);
  const t = await getTranslations({ locale, namespace: "nav" });

  const announcementLink = resolveLinkField(header.announcementLink);

  // Click-to-edit markers, only in Live Preview; they respond while the header is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  const menus = (header.navItems ?? []).flatMap((item): NavigationMenu[] => {
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
    <header
      className="sticky top-0 z-30 h-0"
      data-layout-block="header"
      {...mark(editableGlobal("header"))}
    >
      {header.showAnnouncement && header.announcement ? (
        <div className="mode-dark bg-bg-fill text-text-s text-ui-primary">
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
      <Navigation menus={menus} color="dark" menuLabel={t("menu")} />
    </header>
  );
}
