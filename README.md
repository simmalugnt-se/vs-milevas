# Payload website boilerplate

Next.js 16 + Payload 3 starter for a **content-managed marketing site** (localized pages, admin, R2-ready media).

## Included

- Localized frontend (`en`, `sv`) with CMS-driven **home** and **`/[slug]`** pages from the `pages` collection
- Payload admin at `/admin`, REST at `/api`, GraphQL at `/graphql`
- SEO plugin on `pages`, Mux video helpers, optional Cloudflare R2 for uploads
- Draftable `header` / `footer` globals with scheduled publishing
- Payload-managed redirects through `@payloadcms/plugin-redirects`
- Docker Compose Postgres on host port **5434** (avoids clashing with a typical local Postgres on **5432** or other tools on **5433**)

## Local setup

1. Copy `.env.example` to `.env.local` and set `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and database URLs.
2. `pnpm install` then start Postgres and apply migrations in one step: `pnpm setup:local` (waits for Docker health, then `pnpm db:migrate`). If Compose does not support `--wait`, run `pnpm db:local:up`, wait a few seconds, then `pnpm db:migrate`. Postgres maps **5434** → container `5432`.
3. `pnpm dev`.
4. Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

Until migrations have run, the site shows setup hints instead of raw database errors. Create a `pages` entry with slug `home` for the localized home route.

## Docs

- [Payload setup](./docs/payload-setup.md)
- [Database workflow](./docs/readme/DATABASE_WORKFLOW.md)
- [Boilerplate contract](./docs/boilerplate-contract.md)

## Scripts

```bash
pnpm run quality
pnpm run lint
pnpm run typecheck
pnpm run generate:types
pnpm run generate:importmap
pnpm run db:migrate
pnpm run setup:local
```

## Preview and revalidation

Draft preview uses `GET /[locale]/next/preview` with `PREVIEW_SECRET`. Set `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_SERVER_URL`) to the origin you open in the browser. Published `pages`, `header`, `footer`, and `redirects` changes trigger cache revalidation via Payload hooks.

## Vercel deploys

This repo includes `vercel.json` so Vercel runs `pnpm ci:build` instead of plain `pnpm build`.

That means each deployment applies Payload migrations first, then builds Next.js:

```bash
pnpm ci:build
```

Use separate databases per environment:

- Vercel `Preview` should point at your staging/development database
- Vercel `Production` should point at your production database

Do not point both environments at the same database unless you intentionally want preview deployments to run pending migrations there.
