import { notFound, permanentRedirect } from "next/navigation";
import type { TypedLocale } from "payload";
import { getRedirectDestination } from "@/payload/data/redirects";

type PayloadRedirectsProps = {
  disableNotFound?: boolean;
  locale: TypedLocale;
  url: string;
};

export async function PayloadRedirects({ disableNotFound, locale, url }: PayloadRedirectsProps) {
  const destination = await getRedirectDestination(url, locale);

  if (destination) {
    permanentRedirect(destination);
  }

  if (disableNotFound) {
    return null;
  }

  notFound();
}
