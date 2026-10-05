"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * The current page in the other language (the site has two). Footer's globe icon uses it in
 * place of the boilerplate's language select, which Figma does not have.
 */
export function LocaleLink({
  label,
  className,
  children,
}: {
  /** Accessible name, e.g. "In English". */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={label}
      scroll={false}
      className={className}
    >
      {children}
    </Link>
  );
}
