"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { kitchensinkPages } from "./sections";

/** The kitchensink's pages as tabs; the current one is underlined. */
export function KitchensinkTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Kitchensink">
      <ul className="-mb-px flex gap-(--spacing-md) overflow-x-auto [scrollbar-width:none]">
        {kitchensinkPages.map((page) => {
          const current = pathname === page.href;
          return (
            <li key={page.href}>
              <Link
                href={page.href}
                aria-current={current ? "page" : undefined}
                className={`block whitespace-nowrap border-b-2 py-(--spacing-xs) text-label-s transition-colors tablet:text-label-l ${
                  current
                    ? "border-ui-primary text-ui-primary"
                    : "border-transparent text-ui-tertiary hover:text-ui-primary"
                }`}
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
