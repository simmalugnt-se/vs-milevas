# Payload setup

Payload CMS runs inside this Next.js app (not a separate deployable).

## What is implemented

- App Router split into `(frontend)` for the public site and `(payload)` for admin and APIs.
- Payload routes: `/admin`, `/api`, `/graphql`, `/graphql-playground`.
- Collections: `users`, `media`, `pages`.
- Globals: `header`, `footer`.
- Redirects: enabled through `@payloadcms/plugin-redirects`.
- Database: `@payloadcms/db-postgres` (Neon or local Docker Postgres).
- Media: `@payloadcms/storage-s3` targeting Cloudflare R2 when `R2_*` env vars are set; otherwise local uploads.

## Collections

### `users`

Auth-enabled admin users; first user can be created without an existing session.

### `media`

Uploads with public read access; files go to R2 when configured.

### `pages`

Editorial pages with shared `title`, stable `slug`, shared block structure, localized block copy, SEO fields, and drafts/scheduled publishing.

### `header` / `footer`

Global layout content used by the storefront shell. Nav labels, tagline, and footer copy are localized; shared internal references keep navigation structure stable across languages.

### redirects

Managed through Payload's redirects plugin, cached through Next.js tags, and resolved server-side before storefront routes return `notFound`.

## Environment variables

Add to `.env.local` (see root `.env.example` for the full list):

```bash
PAYLOAD_SECRET=replace_me
PREVIEW_SECRET=replace_me
CRON_SECRET=replace_me
DATABASE_URI=postgresql://payload:payload@127.0.0.1:5434/payload_dev
DATABASE_URI_DIRECT=postgresql://payload:payload@127.0.0.1:5434/payload_dev

# Optional R2
# R2_BUCKET=...
# R2_ENDPOINT=...
# R2_REGION=auto
# R2_ACCESS_KEY_ID=...
# R2_SECRET_ACCESS_KEY=...
```

## First run

1. Copy `.env.example` → `.env.local` and set secrets / DB URL.
2. `pnpm setup:local` (starts Docker Postgres and runs migrations), or `pnpm db:local:up` then `pnpm db:migrate` if Compose does not support `--wait`.
3. `pnpm dev` → open [http://localhost:3000/admin](http://localhost:3000/admin) and create the first user.
4. Add a `pages` document (e.g. slug `home`) for the localized home route.
5. Create `header` / `footer` globals and verify draft preview behavior.
6. Add a redirect in Payload and confirm it resolves on the frontend.

## Vercel

This repo includes `vercel.json`, so Vercel deployments use `pnpm ci:build` and apply Payload migrations before `next build`.

Use separate databases per Vercel environment:

- `Preview` -> staging/development database
- `Production` -> production database

That keeps preview deploys safe while still preventing schema drift during deployment.

## Useful commands

```bash
pnpm run generate:importmap
pnpm run generate:types
pnpm run db:migrate
```

## References

- [Payload: What is Payload?](https://payloadcms.com/docs/getting-started/what-is-payload)
- [Payload: Postgres](https://payloadcms.com/docs/database/postgres)
- [Payload: Storage adapters](https://payloadcms.com/docs/upload/storage-adapters)
