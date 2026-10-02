import type { TypedLocale } from "payload";
import { PayloadRedirects } from "@/components/cms/payload-redirects";
import { frontendPath } from "@/i18n/frontend-path";

type CatchAllProps = {
  params: Promise<{ slug: string[]; locale: TypedLocale }>;
};

/** Paths deeper than a page's (`/old/section/page`): only a redirect can answer them. */
export default async function CatchAll({ params }: CatchAllProps) {
  const { locale, slug } = await params;
  return <PayloadRedirects locale={locale} url={frontendPath(`/${slug.join("/")}`, locale)} />;
}
