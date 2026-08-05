# Boilerplate Contract

This repo is meant to stay close to the shared Payload + Next baseline.

## Editorial rules

- Slugs are auto-generated from the title on the first save.
- Existing slugs stay stable unless an editor explicitly changes them.
- Preview and live preview are only shown when the document already has a valid route key.
- CMS page SEO is driven by Payload's SEO fields first, with layout-derived fallbacks when those fields are empty.
- `pages`, `header`, and `footer` all support drafts and scheduled publishing.

## Routing and rendering

- `src/proxy.ts` is the correct Next.js 16 file convention for locale routing.
- Locale segments are generated at the layout level; child CMS routes only generate the params they own.
- CMS routes keep `dynamicParams` behavior so new content can be rendered after deploys, while cache invalidation is handled through Payload hooks.
- Storefront routes resolve Payload-managed redirects before returning `notFound`.

## Localization

- Payload locales stay language-only (`en`, `sv` by default).
- `Pages.title`, `Pages.slug`, and `Pages.layout` remain shared across locales so editor labels, URLs, and page structure stay stable.
- Localized block content lives inside the blocks, for example hero copy, rich text content, and media captions.
- `Header.siteTagline`, footer copyright, and navigation link labels are localized. `siteName` and internal references remain shared.

## Revalidation

- Published page changes revalidate page routes plus the `pages` tag.
- Header and footer changes revalidate their global tags.
- Redirect changes revalidate the `redirects` tag.
- Media and document changes revalidate their respective tags.
- All revalidation hooks optionally notify a remote deployment via `PAYLOAD_REVALIDATE_REMOTE_URL`.
- The admin dashboard includes a "Revalidate all cache" button for manual cache purging.

## Search indexing

- Search indexing requires `APP_ENV=production` and `ENABLE_SEARCH_INDEXING=true`.
- `/robots.txt` and `/sitemap.xml` are served by Next.js route handlers with indexing gates.
- See `docs/PRODUCTION-INDEXING.md` for the full production switch workflow.
