# Database Workflow (Payload + Neon + Local Postgres)

This is the canonical database/storage workflow for this project (Payload + Next.js website). Local Docker Postgres runs Postgres 18 (the Neon default) on host port **5434**, or the next free port when another project uses it; `pnpm setup:local` picks the port and writes it to `.env.local`.

## 1) Standard Model

Use one active runtime target at a time via generic keys:

- `DATABASE_URI`
- `DATABASE_URI_DIRECT`

The scripts that copy between environments (`pnpm db:copy*`, `pnpm assets:sync*`) read production
and staging from files of their own, with the names Neon and Vercel use:

- `.env.remote.prod`: Neon's block for the production branch
- `.env.remote.staging`: Neon's block for the staging branch

Each holds `SERVICES=cloud`, `DATABASE_URL` (direct), `DATABASE_URL_POOLED`, `AWS_ENDPOINT_URL_S3`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` and `S3_BUCKET`: the same values as
Vercel's Production and Preview. The app never reads them; `.env.local` stays on `SERVICES=local`.
Older `DATABASE_URI_DIRECT_PROD` / `DATABASE_URI_DIRECT_STAGING` in `.env.local` still work for the
database scripts. See [`scripts/lib/remote-env.mjs`](../../scripts/lib/remote-env.mjs).

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

1. Create `.env.local`, start the local database and run the migrations in one step:

```bash
pnpm setup:local
```

It copies `.env.example` to `.env.local` when there is none (with generated secrets), picks a free
host port for Postgres and points `DATABASE_URI` / `DATABASE_URI_DIRECT` at it.

2. Choose active media target for local runtime:

- safest: dedicated dev bucket
- acceptable short-term: shared staging bucket

3. Start app:

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

- `SERVICES=local` and `POSTGRES_HOST_PORT` in `.env.local` (the local Docker database)
- `DATABASE_URL` in `.env.remote.staging` (Neon's direct connection for the staging branch)

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

## 6) Asset Sync Runbooks

[`scripts/sync-s3-assets.mjs`](../../scripts/sync-s3-assets.mjs) copies uploads between `local` (the
`images/` and `documents/` folders) and the buckets in `.env.remote.staging` and `.env.remote.prod`.
Files are added or replaced, never deleted, and files already at the target are skipped.

```bash
pnpm assets:sync:staging-to-local
pnpm assets:sync:prod-to-local
pnpm assets:sync:prod-to-staging
pnpm assets:sync -- --from local --to staging
pnpm assets:sync -- --from local --to prod --force   # writing to prod needs --force
```

Copy the files along with a database copy: `db:copy:prod-to-staging` with
`assets:sync:prod-to-staging`, `db:copy:staging-to-local` with `assets:sync:staging-to-local`.

## 7) Media storage

Payload uses `@payloadcms/storage-s3` with the bucket `SERVICES=cloud` points at (Neon or R2; see
[`src/utilities/services.mjs`](../../src/utilities/services.mjs)). With `SERVICES=local` uploads stay
in the project folders. Uploads go straight from the browser to the bucket, which needs a CORS rule
for each address Admin runs on.

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
- Keep local on the same major version as Neon (Postgres 18 in `docker-compose.yml`). The copy scripts use Postgres 18 tools, which can also dump older servers.

Connection refused on `127.0.0.1:5432`:

- Local Docker Postgres is exposed on `POSTGRES_HOST_PORT` (5434 by default) on the host, not 5432; `pnpm setup:local` keeps the connection strings in step with it.
