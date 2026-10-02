"use client";

import { useTranslations } from "next-intl";
import { DatabaseSetup } from "@/components/cms/database-setup";
import { Link } from "@/i18n/navigation";
import { classifyDatabaseErrorMessage } from "@/utilities/payload-schema-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  const problem = classifyDatabaseErrorMessage(error.message);
  if (problem) {
    return <DatabaseSetup problem={problem} onRetry={reset} />;
  }

  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-site-accent">
        {t("unexpectedError")}
      </p>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {t("unexpectedTitle")}
        </h1>
        <p className="text-base leading-7 text-neutral-600">{t("unexpectedDescription")}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-none bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="rounded-none border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-900"
        >
          {t("goHome")}
        </Link>
      </div>
    </section>
  );
}
