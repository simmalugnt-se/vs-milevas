import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { TypedLocale } from "payload";
import { AdminBarSlot } from "@/components/admin-bar/slot";
import { PayloadDatabaseSetupBanner } from "@/components/cms/payload-database-setup";
import { routing } from "@/i18n/routing";
import { getRobotsMetadata } from "@/lib/seo/indexing";
import { getSiteUrl } from "@/lib/site";
import { FooterSlot as SiteFooter } from "@/payload/globals/Footer/Slot";
import { HeaderSlot as SiteHeader } from "@/payload/globals/Header/Slot";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Header/footer read Payload globals; avoid Postgres during `next build` prerender. */
// export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: tCommon("brand"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    robots: getRobotsMetadata(),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as TypedLocale;
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} canvas min-h-screen font-sans antialiased`}
      >
        <NextIntlClientProvider locale={locale}>
          <AdminBarSlot />
          <div className="canvas min-h-screen">
            <PayloadDatabaseSetupBanner />
            <SiteHeader locale={locale} />
            <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <SiteFooter locale={locale} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
