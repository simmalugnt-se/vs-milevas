"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  isSchemaMismatchErrorMessage,
  isUninitializedPayloadDatabaseErrorMessage,
} from "@/utilities/payload-schema-error";

function DatabaseSetupHint({ reset, t }: { reset: () => void; t: (key: string) => string }) {
  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-site-accent">
        {t("dbSetup")}
      </p>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {t("dbSetupTitle")}
        </h1>
        <p className="text-base leading-7 text-neutral-600">{t("dbSetupDescription")}</p>
      </div>
      <pre className="max-w-full overflow-x-auto border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900">
        pnpm setup:local{"\n"}
        {"# or: pnpm db:migrate"}
      </pre>
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

function SchemaMismatchHint({ reset, t }: { reset: () => void; t: (key: string) => string }) {
  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-red-600">
        {t("schemaMismatch")}
      </p>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {t("schemaMismatchTitle")}
        </h1>
        <p className="text-base leading-7 text-neutral-600">{t("schemaMismatchDescription")}</p>
      </div>
      <pre className="max-w-full overflow-x-auto border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900">
        pnpm db:local:reset{"\n"}
        pnpm setup:local
      </pre>
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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  if (isSchemaMismatchErrorMessage(error.message)) {
    return <SchemaMismatchHint reset={reset} t={t} />;
  }

  if (isUninitializedPayloadDatabaseErrorMessage(error.message)) {
    return <DatabaseSetupHint reset={reset} t={t} />;
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
