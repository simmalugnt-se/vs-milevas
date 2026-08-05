/** @type {import('next-sitemap').IConfig} */
module.exports = {
  /*
   * Robots and sitemap index files are served by Next.js route handlers:
   * - src/app/(frontend)/(sitemaps)/robots.txt/route.ts
   * - src/app/(frontend)/(sitemaps)/sitemap.xml/route.ts
   *
   * Keep this config inert so manual next-sitemap runs cannot generate stale
   * public/robots.txt or public/sitemap.xml files for preview/staging URLs.
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  generateRobotsTxt: false,
  exclude: ["/*"],
};
