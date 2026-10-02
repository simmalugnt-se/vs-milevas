import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { LocaleSelect } from "@/components/layout/locale-select";
import { Link } from "@/i18n/navigation";
import { getHeader, resolveNavItem } from "@/payload/data/globals";
import { resolveLinkField } from "@/payload/utilities/link-field";

type HeaderComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

export async function HeaderComponent({ draft = false, locale }: HeaderComponentProps) {
  const header = await getHeader(locale, draft);
  const t = await getTranslations({ locale, namespace: "common" });

  const siteName = header.siteName || t("brand");
  const siteTagline = header.siteTagline || t("tagline");
  const navItems = header.navItems ?? [];
  const announcementLink = resolveLinkField(header.announcementLink);

  // Click-to-edit markers, only in Live Preview; they respond while the header is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  return (
    <header
      className="sticky top-0 z-20 border-b border-neutral-200 bg-white"
      {...mark(editableGlobal("header"))}
    >
      {header.showAnnouncement && header.announcement ? (
        <div className="bg-neutral-950 text-sm text-white">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
            <p {...mark(editableField("announcement"))}>{header.announcement}</p>
            {announcementLink ? (
              <Link
                href={announcementLink.href}
                rel={announcementLink.rel}
                target={announcementLink.target}
                className="font-semibold underline underline-offset-4"
                {...mark(editableField("announcementLink.label"))}
              >
                {header.announcementLink?.label}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-base font-semibold tracking-[0.14em] text-neutral-950 uppercase"
            {...mark(editableField("siteName"))}
          >
            {siteName}
          </Link>
          <p className="text-xs text-neutral-500" {...mark(editableField("siteTagline"))}>
            {siteTagline}
          </p>
        </div>

        <nav className="flex items-center gap-2 ">
          {navItems.map((item) => {
            const resolvedLink = resolveNavItem(item);

            if (!resolvedLink) {
              return null;
            }

            return (
              <Link
                key={item.id ?? resolvedLink.href}
                href={resolvedLink.href}
                className="inline-flex h-9 items-center rounded-none px-3 text-sm font-semibold leading-9 text-neutral-700 hover:bg-neutral-950 hover:text-white"
                rel={resolvedLink.rel}
                target={resolvedLink.target}
                {...mark(editableBlock(item))}
              >
                <span {...mark(editableField("link.label"))}>{item.link.label}</span>
              </Link>
            );
          })}
          <LocaleSelect locale={locale} />
        </nav>
      </div>
    </header>
  );
}
