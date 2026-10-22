import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import {
  Navigation,
  type NavigationLink,
  type NavigationMenu,
} from "@/components/blocks/navigation";
import { Link } from "@/i18n/navigation";
import { getHeader, resolveNavItem } from "@/payload/data/globals";
import { resolveLinkField } from "@/payload/utilities/link-field";
import { getMediaImageURL } from "@/payload/utilities/media";
import type { Image as PayloadImage } from "@/payload-types";

type HeaderComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

/**
 * The site's header: the Navigation block (Figma 9051:12518) fed by the Header global, with the
 * boilerplate's optional announcement bar above it. `siteName` and `siteTagline` stay in the global
 * but are not shown, and neither is `cta`: Figma's navigation has no button. Each `navItems` row
 * is a menu: with `links` it opens them beside its `image` (each link's own image shows while it is
 * pointed at), without them its link is a plain link. `login` is the login link. Dark, since the
 * site's sections are dark.
 */

/** A Header image in the menu's square: the menu's contained, a link's (a truck) covering it. */
function menuImage(value: PayloadImage | string | null | undefined, fit: "contain" | "cover") {
  const src = getMediaImageURL(value);
  if (!src) return undefined;
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 64rem) 25vw, 50vw"
      className={fit === "cover" ? "object-cover" : "object-contain"}
    />
  );
}
export async function HeaderComponent({ draft = false, locale }: HeaderComponentProps) {
  const header = await getHeader(locale, draft);
  const t = await getTranslations({ locale, namespace: "nav" });

  const announcementLink = resolveLinkField(header.announcementLink);

  // Click-to-edit markers, only in Live Preview; they respond while the header is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  const menus = (header.navItems ?? []).flatMap((item): NavigationMenu[] => {
    const links = (item.links ?? []).flatMap((row): NavigationLink[] => {
      const resolved = resolveNavItem(row);
      if (!resolved) return [];
      return [
        {
          label: <span {...mark(editableField("link.label"))}>{row.link.label}</span>,
          href: resolved.href,
          rel: resolved.rel,
          target: resolved.target,
          image: menuImage(row.image, "cover"),
          attributes: mark(editableBlock(row)),
        },
      ];
    });
    const resolved = resolveNavItem(item);
    if (!item.link.label || (!links.length && !resolved)) return [];
    return [
      {
        label: <span {...mark(editableField("link.label"))}>{item.link.label}</span>,
        links,
        href: resolved?.href,
        rel: resolved?.rel,
        target: resolved?.target,
        image: menuImage(item.image, "contain"),
        attributes: mark(editableBlock(item)),
      },
    ];
  });

  const loginLink = resolveLinkField(header.login?.link);
  const login =
    loginLink && header.login?.link?.label
      ? {
          label: header.login.link.label,
          shortLabel: header.login.shortLabel ?? undefined,
          href: loginLink.href,
          rel: loginLink.rel,
          target: loginLink.target,
          attributes: mark(editableField("login.link.label")),
        }
      : undefined;

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
      <Navigation menus={menus} login={login} color="dark" menuLabel={t("menu")} />
    </header>
  );
}
