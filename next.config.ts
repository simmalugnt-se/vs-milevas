import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const searchIndexingEnabled =
  process.env.APP_ENV === "production" &&
  ["1", "true", "yes", "on"].includes(
    (process.env.ENABLE_SEARCH_INDEXING || "").trim().toLowerCase(),
  );

/** Derives `next/image` remotePatterns from public media URL (see `.env.example`). */
function imageRemotePatternFromEnv(
  raw: string | undefined,
): { hostname: string; protocol: "http" | "https" } | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (!url.hostname) return null;
    const protocol = url.protocol === "http:" ? "http" : "https";
    return { hostname: url.hostname, protocol };
  } catch {
    return null;
  }
}

const r2ImagePattern =
  imageRemotePatternFromEnv(process.env.NEXT_PUBLIC_R2_IMAGE_HOSTNAME) ??
  imageRemotePatternFromEnv(process.env.R2_PUBLIC_URL);

const nextConfig: NextConfig = {
  env: {
    appEnv: process.env.APP_ENV || "development",
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        ...(searchIndexingEnabled
          ? []
          : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]),
        ...(process.env.APP_ENV === "production" || process.env.APP_ENV === "prod"
          ? [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]
          : []),
      ],
    },
    {
      source: "/admin/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    },
  ],
  images: {
    remotePatterns: [...(r2ImagePattern ? [r2ImagePattern] : [])],
  },
};

const finalConfig = withPayload(withNextIntl(nextConfig));

finalConfig.turbopack = {
  ...(finalConfig.turbopack || {}),
  root: process.cwd(),
};

export default finalConfig;
