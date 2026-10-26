import type { Metadata } from "next";
import Link from "next/link";
import type { TypedLocale } from "payload";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { buildQuote, familySteps } from "@/features/configurator/engine";
import { QuoteView } from "@/features/configurator/QuoteView";
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
      <section
        className="mx-auto w-full max-w-2xl border border-neutral-300 bg-white p-6 sm:p-8"
        data-page-background="light"
      >
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
    step: family ? familySteps(family).length + 1 : undefined,
  });

  // The site's overlaid navigation, Light here as on the configurator, and the page's light grey
  // background around the footer, as the configurator page has. The quote leaves the navigation
  // room itself, inside the window's height.
  return (
    <div
      className="bg-bg-fill-secondary"
      data-page-background="light"
      data-navigation="light"
    >
      <QuoteView
        quote={quote}
        locale={locale}
        configuratorHref={`${configuratorHref}?${resumeParams.toString()}`}
        image={family?.image}
        warrantyNote={catalog.warrantyNote}
        nextSteps={catalog.nextSteps}
      />
    </div>
  );
}
