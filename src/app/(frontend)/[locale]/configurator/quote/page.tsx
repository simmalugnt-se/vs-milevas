import type { Metadata } from "next";
import Link from "next/link";
import type { TypedLocale } from "payload";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { buildQuote } from "@/features/configurator/engine";
import { OrderRequestForm } from "@/features/configurator/RequestForms";
import {
  buildConfiguratorSearchParams,
  parseSelectionReferences,
} from "@/features/configurator/url-state";
import { frontendPath } from "@/i18n/frontend-path";

type QuotePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Din offert", robots: { index: false, follow: false } };

function values(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function linePrice(line: { kind: "base" | "option" | "service"; price: number }) {
  return `${formatPrice(line.price)}${line.kind === "service" ? "/år" : ""}`;
}

export default async function QuotePage({ params, searchParams }: QuotePageProps) {
  const [{ locale: localeParam }, query] = await Promise.all([params, searchParams]);
  const locale = (localeParam === "sv" ? "sv" : "en") as TypedLocale;
  const catalog = await getConfiguratorCatalog(locale, false);
  const familyKey = typeof query.family === "string" ? query.family : "";
  const financingKey = typeof query.financing === "string" ? query.financing : "";
  const selections = parseSelectionReferences(values(query.selection));
  const quote = buildQuote(
    catalog,
    familyKey,
    selections,
    financingKey,
    query.serviceAgreement === "1",
  );
  const configuratorHref = frontendPath("/configurator", locale);

  if (!quote) {
    return (
      <section className="mx-auto w-full max-w-2xl border border-neutral-300 bg-white p-6 sm:p-8">
        <p
          className="mb-5 grid size-10 place-items-center border border-neutral-950 text-xl"
          aria-hidden="true"
        >
          !
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Offerten kan inte visas</h1>
        <p className="mt-3 leading-7 text-neutral-600">
          Något val är ogiltigt eller har ändrats. Öppna konfiguratorn och kontrollera valen.
        </p>
        <Link
          className="mt-6 inline-block border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
          href={configuratorHref}
        >
          Tillbaka till konfiguratorn
        </Link>
      </section>
    );
  }

  const family = catalog.families.find((candidate) => candidate.key === quote.familyKey);
  const resumeParams = buildConfiguratorSearchParams({
    family,
    selections: quote.selections,
    financingKey: quote.financing.key,
    serviceAgreement: Boolean(quote.serviceAgreement),
    step: family ? family.steps.length + 1 : undefined,
  });

  return (
    <section className="space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
        href={`${configuratorHref}?${resumeParams.toString()}`}
      >
        <span aria-hidden="true">←</span> Ändra konfiguration
      </Link>

      <header className="border border-neutral-300 bg-neutral-50 p-5 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Offertöversikt</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {quote.familyName}
          </h1>
          {quote.sku ? (
            <p className="mt-2 font-mono text-xs text-neutral-500">Art.nr {quote.sku}</p>
          ) : null}
        </div>
        <div className="mt-5 border-t border-neutral-300 pt-4 text-sm sm:mt-0 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <p className="text-neutral-500">Konfiguration sparad i URL</p>
          <p className="mt-1 font-medium">Offert giltig i {quote.quoteValidityDays} dagar</p>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="border border-neutral-300 bg-white">
            <div className="border-b border-neutral-300 bg-neutral-50 px-5 py-3 text-xs uppercase tracking-[0.16em] text-neutral-600">
              Vald konfiguration
            </div>
            <dl className="px-5">
              {quote.lines.map((line) => (
                <div
                  className="flex justify-between gap-5 border-b border-neutral-200 py-3 text-sm"
                  key={line.key}
                >
                  <dt className="text-neutral-700">{line.label}</dt>
                  <dd className="shrink-0 font-medium">{linePrice(line)}</dd>
                </div>
              ))}
              <div className="flex items-end justify-between gap-5 py-5">
                <dt>Totalpris</dt>
                <dd className="text-2xl font-semibold">{formatPrice(quote.totalPrice)}</dd>
              </div>
            </dl>
          </div>

          {quote.specifications.length > 0 ? (
            <div className="border border-neutral-300 bg-white">
              <div className="border-b border-neutral-300 bg-neutral-50 px-5 py-3 text-xs uppercase tracking-[0.16em] text-neutral-600">
                Tekniska specifikationer
              </div>
              <dl className="grid px-5 sm:grid-cols-2 sm:gap-x-8">
                {quote.specifications.map((specification) => (
                  <div
                    className="flex justify-between gap-5 border-b border-neutral-200 py-3 text-sm"
                    key={`${specification.label}-${specification.value}`}
                  >
                    <dt className="text-neutral-600">{specification.label}</dt>
                    <dd className="text-right font-medium">{specification.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {family?.brochure ? (
            <a
              className="inline-block text-sm font-medium underline underline-offset-4"
              href={family.brochure.url}
              target="_blank"
              rel="noreferrer"
            >
              {family.brochure.title}
            </a>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <div className="border border-neutral-950 bg-neutral-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              Vald finansiering
            </p>
            <p className="mt-2 font-medium">{quote.financing.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatPrice(quote.financingPrice)}
              {quote.financing.kind === "monthly" ? (
                <span className="text-base font-normal">/månad</span>
              ) : null}
            </p>
            <dl className="mt-5 space-y-3 border-t border-neutral-700 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Leveranstid</dt>
                <dd className="text-right">{quote.deliveryTime}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-400">Garanti</dt>
                <dd className="text-right">{quote.warranty}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-neutral-400">
              Alla priser visas exkl. moms. Priset baseras på aktuellt lager och bekräftas av säljare.
            </p>
          </div>
          <OrderRequestForm quote={quote} locale={locale} />
        </aside>
      </div>
    </section>
  );
}
