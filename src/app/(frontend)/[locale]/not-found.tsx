import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-site-accent">
        {t("notFound")}
      </p>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {t("notFoundTitle")}
        </h1>
        <p className="text-base leading-7 text-neutral-600">{t("notFoundDescription")}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-none bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {t("goHome")}
        </Link>
        <NextLink
          href="/admin"
          className="rounded-none border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-900"
        >
          {t("goToAdmin")}
        </NextLink>
      </div>
    </section>
  );
}
