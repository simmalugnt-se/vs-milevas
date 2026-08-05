export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (!siteUrl) {
    return new URL("http://localhost:3000");
  }

  return new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`);
}
