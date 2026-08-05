import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { LocaleSelect } from "@/components/layout/locale-select";
import { Link } from "@/i18n/navigation";
import { getHeader, resolveNavItem } from "@/payload/data/globals";

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

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-base font-semibold tracking-[0.14em] text-neutral-950 uppercase"
          >
            {siteName}
          </Link>
          <p className="text-xs text-neutral-500">{siteTagline}</p>
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
              >
                {item.link.label}
              </Link>
            );
          })}
          <LocaleSelect locale={locale} />
        </nav>
      </div>
    </header>
  );
}
