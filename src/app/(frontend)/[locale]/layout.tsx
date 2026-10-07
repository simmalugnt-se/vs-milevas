import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { TypedLocale } from "payload";
import { AdminBarSlot } from "@/components/admin-bar/slot";
import { GridOverlay } from "@/components/grid-overlay";
import { routing } from "@/i18n/routing";
import { getRobotsMetadata } from "@/lib/seo/indexing";
import { getSiteUrl } from "@/lib/site";
import { FooterSlot as SiteFooter } from "@/payload/globals/Footer/Slot";
import { HeaderSlot as SiteHeader } from "@/payload/globals/Header/Slot";
import "../globals.css";

const clashGrotesk = localFont({
  src: "../fonts/clash-grotesk/ClashGrotesk-Variable.woff2",
  variable: "--font-clash-grotesk",
  weight: "200 700",
  style: "normal",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#E0FF3C",
};

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
    applicationName: "Milevas",
    title: {
      default: tCommon("brand"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      description: t("description"),
      images: [{ alt: "Milevas", height: 630, url: "/milevas-og.png", width: 1200 }],
      siteName: "Milevas",
      title: tCommon("brand"),
      type: "website",
    },
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
    <html lang={locale} className="milevas-site">
      <body
        className={`${clashGrotesk.variable} ${geistMono.variable} canvas min-h-screen font-sans antialiased`}
      >
        <NextIntlClientProvider locale={locale}>
          <AdminBarSlot />
          <div className="canvas min-h-screen">
            <SiteHeader locale={locale} />
            <main className="flex w-full flex-col">{children}</main>
            <SiteFooter locale={locale} />
          </div>
          <GridOverlay />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
