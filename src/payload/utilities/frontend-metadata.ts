import type { Metadata } from "next";
import type { TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { getSiteUrl } from "@/lib/site";
import type { Media, Page } from "@/payload-types";
import { getDocumentDescription, getDocumentTitle } from "./seo";

type PageMetadataDoc = Pick<Page, "layout" | "meta" | "slug" | "title">;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toAbsoluteImageURL(url: string | null | undefined) {
  const source = asTrimmedString(url);

  if (!source) {
    return null;
  }

  return new URL(source, getSiteUrl()).toString();
}

function resolvePayloadImage(image: string | Media | null | undefined) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return {
      alt: undefined,
      height: undefined,
      url: toAbsoluteImageURL(image),
      width: undefined,
    };
  }

  return {
    alt: typeof image.alt === "string" ? image.alt : undefined,
    height: typeof image.height === "number" ? image.height : undefined,
    url: typeof image.url === "string" ? toAbsoluteImageURL(image.url) : null,
    width: typeof image.width === "number" ? image.width : undefined,
  };
}

export function buildPageMetadata(page: PageMetadataDoc | null, locale: TypedLocale): Metadata {
  if (!page) {
    return {};
  }

  const title = asTrimmedString(page.meta?.title) || getDocumentTitle(page);
  const description = asTrimmedString(page.meta?.description) || getDocumentDescription(page);
  const image = resolvePayloadImage(page.meta?.image);
  const pathname =
    page.slug === "home" ? frontendPath("/", locale) : frontendPath(`/${page.slug}`, locale);

  return {
    alternates: {
      canonical: pathname,
    },
    description,
    openGraph: {
      description,
      ...(image?.url
        ? {
            images: [
              {
                alt: image.alt ?? title,
                height: image.height,
                url: image.url,
                width: image.width,
              },
            ],
          }
        : {}),
      title,
      type: "website",
    },
    title,
  };
}
