# Database Workflow (Payload + Neon + Local Postgres)

This is the canonical database/storage workflow for this project (Payload + Next.js website). Local Docker Postgres uses host port **5434** so it does not collide with a typical local Postgres on **5432** or other projects on **5433**.

## 1) Standard Model

Use one active runtime target at a time via generic keys:

- `DATABASE_URI`
- `DATABASE_URI_DIRECT`

For S3-compatible object storage (Cloudflare R2, AWS S3, etc.), this repo’s Payload config primarily uses **`R2_*`** at runtime. For **multi-environment sync scripts**, you can use either:

- `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, or
- the same values as `R2_*` / `R2_*_{PROFILE}` — see [`scripts/sync-s3-assets.mjs`](../../scripts/sync-s3-assets.mjs).

Use profile keys only when a command needs two environments at once (sync/copy):

- `*_LOCAL`
- `*_STAGING`
- `*_PROD`

Important naming note:

- In teams using Neon, `STAGING` profile keys often represent your Neon `development` branch.

## 2) Vercel Setup

Keep Vercel as generic keys only:

- Production environment in Vercel → production DB URLs + production bucket
- Preview/Staging environment in Vercel → staging/dev DB URLs + staging bucket

Do not rely on suffixed keys in Vercel runtime.

This repo also includes `vercel.json`, which sets Vercel's build command to:

```bash
pnpm ci:build
```

That command runs Payload migrations before `next build`, so Preview should use a staging/development database and Production should use the production database. Avoid sharing one database across both Vercel environments unless you explicitly want preview deployments to apply pending migrations there.

## 3) Local Setup (Runtime)

1. Copy template:

```bash
cp .env.example .env.local
```

2. Set active runtime keys to local DB. **Docker Compose maps host port `5434` → container `5432`**, so from your Mac use:

```bash
DATABASE_URI=postgresql://payload:payload@127.0.0.1:5434/payload_dev
DATABASE_URI_DIRECT=postgresql://payload:payload@127.0.0.1:5434/payload_dev
```

3. Choose active media target for local runtime:

- safest: dedicated dev bucket
- acceptable short-term: shared staging bucket

4. Start local DB (Postgres 17) and run migrations:

```bash
pnpm db:local:up
pnpm db:migrate
```

5. Start app:

```bash
pnpm dev
```

**Backward compatibility:** `DATABASE_URL` is still accepted if `DATABASE_URI` is unset.

## 4) Daily Schema Workflow (Two Modes)

Shared environments are always migration-driven.  
Local can be run in either mode below.

### Mode A: `push: false` (Migration-Only, safest default)

Use when you want local to behave like staging/prod at all times.

```bash
# 1) change schema code

# 2) create migration
pnpm db:migrate:create -- short-change-name

# 3) apply migration
pnpm db:migrate

# 4) regenerate types (only needed if auto-generation did not already run)
pnpm generate:types
```

### Mode B: `push: true` (Local Sandbox, fastest iteration)

Use only with local disposable DB.

1. In `.env` set:

```bash
PAYLOAD_LOCAL_PUSH=true
```

2. Iterate quickly on fields/collections; schema is pushed live to local DB.

3. When feature is done:

```bash
# create migration from current schema changes
pnpm db:migrate:create -- short-change-name

# switch back to migration mode
# (set PAYLOAD_LOCAL_PUSH=false in .env)

# proof test on clean DB: migrations alone must rebuild schema
pnpm db:local:reset
pnpm db:migrate

# regenerate types (only needed if auto-generation did not already run)
pnpm generate:types
```

Important:

- Do not use `PAYLOAD_LOCAL_PUSH=true` against shared DBs.
- Do not keep mixing push mode and migration mode on the same long-lived local DB.
- The clean verification step is always `pnpm db:local:reset && pnpm db:migrate`.

Commit schema code + migration files + generated types together.

### Rename Prompt Rules (`pnpm db:migrate:create`)

When you rename fields, migration generation can ask multiple rename questions across live tables, version tables, and rollback (`down`) mapping.

Use this rule:

- if it is the same logical field with a new name, always choose `rename column` (not `create column`)
- only choose `create column` for truly brand-new fields with no previous data

## 5) DB Copy Runbooks

All copy operations are overwrite operations.  
Commands use Dockerized Postgres tools, so you do not need local `psql`/`pg_dump` binaries.

### A) Development (Neon) → Local

Assumes:

- `DATABASE_URI_DIRECT` points to local DB (host port **5434**)
- `DATABASE_URI_DIRECT_STAGING` points to Neon development branch direct URL

Run (recommended):

```bash
pnpm db:copy:staging-to-local
```

### B) Production → Local

Run:

```bash
pnpm db:copy:prod-to-local
```

### C) Remote → Remote

Only with explicit approval for production targets.

```bash
# production -> staging refresh
pnpm db:copy:prod-to-staging

# staging -> production overwrite (guarded)
pnpm db:copy:staging-to-prod
```

Dry-run preview (no DB writes):

```bash
pnpm db:copy:remote -- --from prod --to staging --dry-run
pnpm db:copy:remote -- --from staging --to prod --dry-run --force --confirm OVERWRITE_PROD
```

## 6) Asset Sync Runbooks (S3/R2)

[`scripts/sync-s3-assets.mjs`](../../scripts/sync-s3-assets.mjs) accepts **`S3_*_{PROFILE}`** or **`R2_*_{PROFILE}`**. For local, unsuffixed **`R2_*`** (as used by [`src/payload.config.ts`](../../src/payload.config.ts)) also work.

```bash
pnpm assets:sync:staging-to-local
pnpm assets:sync:prod-to-local
```

Optional flags:

```bash
pnpm assets:sync -- --from staging --to local --delete
```

Do not use `--delete` unless you want destination cleanup.

## 7) Media storage (R2)

Payload uses `@payloadcms/storage-s3` with Cloudflare R2 when `R2_*` env vars are set. See [`src/payload/utilities/r2.ts`](../../src/payload/utilities/r2.ts) and [`src/payload/collections/Media/config.ts`](../../src/payload/collections/Media/config.ts).

## 8) Localizing Existing Fields

Changing a field from non-localized to localized usually needs a manual data migration step. Use [`scripts/migration-template-localize-field.ts`](../../scripts/migration-template-localize-field.ts) as the reference pattern when applicable.

## 9) Troubleshooting

`database "payload" does not exist`:

- Your URL points to a DB name that does not exist in local Postgres.
- Fix `DATABASE_URI` and `DATABASE_URI_DIRECT` to match `POSTGRES_DB` in `docker-compose.yml` (`payload_dev`), then rerun migrations.

`PAYLOAD_LOCAL_PUSH=true` throws non-local-host error:

- Expected guard behavior. Use push mode only against local hosts.

`pg_dump: server version mismatch`:

- Local Postgres and remote Postgres major versions differ.
- The database-copy scripts use PostgreSQL 18 client tools for Neon. Keep the local Compose database on Postgres 17 unless you intentionally migrate it.

Connection refused on `127.0.0.1:5432`:

- Local Docker Postgres is exposed on **5434** on the host; use `127.0.0.1:5434` in connection strings (container still listens on `5432` internally).
