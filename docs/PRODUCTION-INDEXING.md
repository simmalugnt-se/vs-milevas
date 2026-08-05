# Production indexing

Search indexing is enabled only when both conditions are true:

```env
APP_ENV=production
ENABLE_SEARCH_INDEXING=true
```

Every other combination is treated as non-indexable, including local development, staging, Vercel preview deployments, and production deployments where `ENABLE_SEARCH_INDEXING` is missing or false.

## What happens when indexing is disabled

- `/robots.txt` returns `Disallow: /`.
- `/sitemap.xml` returns an empty sitemap index.
- `/sitemap-pages.xml` returns no page URLs.
- Frontend page metadata includes `robots: noindex, nofollow`.
- A global `X-Robots-Tag: noindex, nofollow, noarchive` header is sent.

## What happens when indexing is enabled

- `/robots.txt` allows public crawling except internal routes and points crawlers to `/sitemap.xml`.
- `/sitemap.xml` lists `/sitemap-pages.xml`.
- CMS page sitemap entries are generated from published Payload pages with locale-aware URLs.

## Required production env vars

```env
APP_ENV=production
ENABLE_SEARCH_INDEXING=true
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

## Remote cache revalidation

When editing against a shared database from a local admin, set:

```env
PAYLOAD_REVALIDATE_REMOTE_URL=https://your-staging-or-prod-url.com
```

Payload hooks will fire-and-forget a POST to `/api/revalidate-all` on the remote deployment when content is saved.
