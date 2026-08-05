import type { TypedLocale } from "payload";
import { frontendPath } from "@/i18n/frontend-path";
import { routing } from "@/i18n/routing";

type LayoutBlockValue = {
  blockType?: string | null;
  body?: unknown;
  content?: unknown;
  image?: unknown;
  media?: unknown;
  summary?: unknown;
};

type LexicalNode = {
  children?: LexicalNode[];
  text?: string;
  type?: string;
};

type UploadValue =
  | {
      id?: number | string | null;
    }
  | number
  | string
  | null
  | undefined;

type PageLike = {
  layout?: LayoutBlockValue[] | null;
  slug?: string | null;
  title?: string | null;
};

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const collectLexicalText = (node: LexicalNode | null | undefined): string => {
  if (!node) {
    return "";
  }

  const text = typeof node.text === "string" ? node.text : "";
  const childrenText = Array.isArray(node.children)
    ? node.children.map((child) => collectLexicalText(child)).join(" ")
    : "";

  return [text, childrenText].filter(Boolean).join(" ").trim();
};

const truncate = (value: string, maxLength = 160) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

export const getDocumentTitle = (doc: PageLike) => asString(doc.title) || "Untitled";

export const getDocumentDescription = (doc: PageLike) => {
  const layout = Array.isArray(doc.layout) ? doc.layout : [];

  for (const block of layout) {
    if (block.blockType === "hero") {
      const summary = asString(block.summary);

      if (summary) {
        return truncate(summary);
      }
    }

    if (block.blockType === "callout") {
      const body = asString(block.body);

      if (body) {
        return truncate(body);
      }
    }

    if (block.blockType === "richText") {
      const content = block.content as LexicalNode | null | undefined;
      const text = collectLexicalText(content).replace(/\s+/g, " ").trim();

      if (text) {
        return truncate(text);
      }
    }
  }

  return asString(doc.title);
};

export const getDocumentImage = (doc: PageLike) => {
  const layout = Array.isArray(doc.layout) ? doc.layout : [];

  for (const block of layout) {
    if (block.blockType !== "hero" && block.blockType !== "media") {
      continue;
    }

    const upload = (block.image as UploadValue) ?? (block.media as UploadValue) ?? null;

    if (typeof upload === "number" || typeof upload === "string") {
      return upload;
    }

    if (upload && typeof upload === "object" && upload.id) {
      return upload.id;
    }
  }

  return undefined;
};

export const getDocumentURL = (
  doc: PageLike,
  locale: TypedLocale = routing.defaultLocale as TypedLocale,
  _collectionSlug?: string,
) => {
  const siteURL = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "");

  if (!siteURL) {
    return "";
  }

  const slug = asString(doc.slug);

  if (!slug || slug === "home") {
    return `${siteURL}${frontendPath("/", locale)}`;
  }

  return `${siteURL}${frontendPath(`/${slug}`, locale)}`;
};
