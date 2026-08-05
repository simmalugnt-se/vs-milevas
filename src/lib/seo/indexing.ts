import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const truthyValues = new Set(["1", "true", "yes", "on"]);

function isTruthy(value: string | undefined) {
  return truthyValues.has((value || "").trim().toLowerCase());
}

export function isSearchIndexingEnabled() {
  return process.env.APP_ENV === "production" && isTruthy(process.env.ENABLE_SEARCH_INDEXING);
}

export function getSiteOrigin() {
  return getSiteUrl().toString().replace(/\/+$/, "");
}

export function getRobotsMetadata(): Metadata["robots"] {
  if (isSearchIndexingEnabled()) {
    return {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
      },
      index: true,
    };
  }

  return {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
      noarchive: true,
      nosnippet: true,
    },
    index: false,
    noarchive: true,
    nosnippet: true,
  };
}

export function getNoIndexHeaderValue() {
  return "noindex, nofollow, noarchive";
}
