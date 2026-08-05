"use client";

import type { TypedLocale } from "payload";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type LocaleSelectProps = {
  locale: TypedLocale;
};

export function LocaleSelect({ locale }: LocaleSelectProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="group relative inline-flex h-9 shrink-0 cursor-pointer items-center">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => {
          router.replace(pathname, {
            locale: e.target.value as TypedLocale,
            scroll: false,
          });
        }}
        className="h-full min-h-0 cursor-pointer appearance-none uppercase rounded-none border-0 bg-transparent py-0 pr-10 pl-3 text-sm font-semibold leading-9 text-neutral-700 outline-none transition-colors hover:bg-neutral-950 hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-0"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <svg
        aria-hidden={true}
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-neutral-500 group-hover:text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}
