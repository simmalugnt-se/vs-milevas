# Payload setup

Payload CMS runs inside this Next.js app (not a separate deployable).

## What is implemented

- App Router split into `(frontend)` for the public site and `(payload)` for admin and APIs.
- Payload routes: `/admin`, `/api`, `/graphql`, `/graphql-playground`.
- Collections: `users`, `pages`, `images`, `videos`, `documents`.
- Globals: `header`, `footer`.
- Redirects: enabled through `@payloadcms/plugin-redirects`.
- Database: `@payloadcms/db-postgres` (Neon or local Docker Postgres).
- Uploads (`images`, `documents`): `@payloadcms/storage-s3` targeting Cloudflare R2 when `R2_*` env vars are set; otherwise local uploads. Videos are stored and streamed by Mux.

## Collections

### `users`

Auth-enabled admin users; first user can be created without an existing session.

### `images`

Image uploads with public read access and a localized alt text; files go to R2 when configured.

### `videos`

Mux videos with public read access. Admin uploads the file straight to Mux and follows the encoding;
the entry keeps the playback id, an MP4 rendition for every browser, a localized description for
readers who cannot see the video, and an optional poster image. From
`@simmalugnt-se/payload-mux`; the project adds its Admin group and cache tags in `plugins/index.ts`.

### `documents`

File uploads (PDF, Office, CSV, text) that rich text can link to.

### `pages`

Editorial pages with shared `title`, stable `slug`, shared block structure, localized block copy, SEO fields, and drafts/scheduled publishing.

### `header` / `footer`

Global layout content used by the site shell. Nav labels, tagline, and footer copy are localized; shared internal references keep navigation structure stable across languages.

### redirects

Managed through Payload's redirects plugin, cached through Next.js tags, and resolved server-side before frontend routes return `notFound`. Publishing a page under a new slug adds a redirect from the old address to the page (a reference, so it follows later renames); none from the start page, and none over a redirect that already exists for that address.

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

1. `pnpm setup:local`: creates `.env.local` (with generated secrets) if it is missing, starts
   Docker Postgres on a free port and runs the migrations.
2. `pnpm dev` → open [http://localhost:3000/admin](http://localhost:3000/admin) and create the
   first user. The first start seeds a published start page (slug `home`).
3. Edit the `header` / `footer` globals and check draft preview.
4. Add a redirect in Payload and confirm it resolves on the frontend.

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
