import { getTranslations } from "next-intl/server";
import type { TypedLocale } from "payload";
import { Link } from "@/i18n/navigation";
import { getFooter, resolveNavItem } from "@/payload/data/globals";

type FooterComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

export async function FooterComponent({ draft = false, locale }: FooterComponentProps) {
  const footer = await getFooter(locale, draft);
  const t = await getTranslations({ locale, namespace: "common" });

  const brand = footer.copyright || t("brand");
  const navItems = footer.navItems ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-5 py-6 sm:flex-row sm:justify-between sm:px-8 lg:px-10">
        <p className="text-xs text-neutral-500">
          &copy; {year} {brand}. {t("allRightsReserved")}
        </p>
        {navItems.length > 0 ? (
          <nav className="flex flex-wrap items-center gap-6">
            {navItems.map((item) => {
              const resolvedLink = resolveNavItem(item);

              if (!resolvedLink) {
                return null;
              }

              return (
                <Link
                  key={item.id ?? resolvedLink.href}
                  href={resolvedLink.href}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-950"
                  rel={resolvedLink.rel}
                  target={resolvedLink.target}
                >
                  {item.link.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
