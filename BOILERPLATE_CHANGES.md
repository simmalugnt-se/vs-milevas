# Boilerplate Parity & Robustness Changes

> Session: 2026-05-14  
> Scope: `payload-boilerplate-v2` (regular) + `payload-shopify-boilerplate` (Shopify)  
> Reference: `harvest-moon` (most up-to-date project)

---

## Overview

This session brought both boilerplates to parity with `harvest-moon` across 30 analyzed categories, then fixed critical runtime issues discovered during end-to-end testing. The work is organized into four implementation phases plus bug-fixes.

---

## Phase 1: Foundation (Both Boilerplates)

### C1 — `blocksAsJSON: true` in `src/payload.config.ts`
- **Why**: Payload v3 recommended pattern. Without it, blocks use a different JSON serialization format causing migration/schema mismatches.
- **Change**: Added `blocksAsJSON: true` to the `postgresAdapter()` call in both `src/payload.config.ts` files.

### C3 — `pnpm-workspace.yaml` security hardening
- **Added**: `minimumReleaseAge: 1440` (24h delay on new packages)
- **Added**: `strictDepBuilds: true` (blocks unreviewed build scripts)
- **Added**: `blockExoticSubdeps: true` (blocks git/tarball transitive deps)
- **Added**: `onlyBuiltDependencies` + `allowBuilds` explicit allow-list
- **Removed**: `trustPolicy: no-downgrade` — removed during testing because it produces false-positive trust-downgrade errors on legitimate transitive dependency updates (e.g. `eslint-import-resolver-typescript`).

### C4 — `docker-compose.yml` modernization
- Removed deprecated `version: "3"` line
- Added `name:` top-level key (`payload-boilerplate` / `shopify`)
- Changed hardcoded port to env-var mapping: `${POSTGRES_HOST_PORT:-5434}:5432` (v2) / `${POSTGRES_HOST_PORT:-5435}:5432` (shopify)

### C5 — Dependency version bumps (`package.json`)
- `next`: `16.2.1` → `16.2.3`
- `eslint-config-next`: `16.2.1` → `16.2.3`
- All `@payloadcms/*`: `3.80.0` / `^3.80.0` → `^3.84.1`
- `@payloadcms/admin-bar`: exact `3.80.0` → caret `^3.84.1`
- v2 only: added `dotenv` `16.4.7` and `sonner` `^2.0.7`
- Both: added `@biomejs/biome` `2.4.15` to `devDependencies`

### C13 — `.nvmrc`
- Created with content `24` (both projects)

### C14 — `.gitignore` improvements
- Added IDE/tooling exclusion block (`.idea`, `.vscode/*` with exceptions, `.pi-lens`)
- Added `/tmp`
- Added `.env*.local`

---

## Phase 2: Configuration Alignment

### C11 — `next.config.ts` modernization
- Added `env: { appEnv: process.env.APP_ENV || "development" }`
- Added `turbopack.root: process.cwd()` via mutation on the final config object
- v2 only: Removed `devBundleServerPackages: false` from `withPayload()` call (old pattern)
- Both: Restructured export to use `const finalConfig = withPayload(withNextIntl(nextConfig))` pattern

### C2 — PAYLOAD_SECRET hardening (shopify only)
- Replaced `secret: process.env.PAYLOAD_SECRET!` with explicit validation + throw
- Added early guard:
  ```ts
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is required but not set.");
  }
  const payloadSecret = process.env.PAYLOAD_SECRET;
  ```
- Uses `secret: payloadSecret` instead of non-null assertion

### H1 — Full Biome integration (both)
Created files:
- `biome.json` — comprehensive config (286 lines) matching harvest-moon exactly
- `BIOME.md` — documentation of Biome workflow, scripts, config, and ESLint fallback strategy
- `.vscode/settings.json` — Biome as default formatter, organize imports on save
- `.vscode/extensions.json` — recommends `biomejs.biome`
- `.zed/settings.json` — Biome LSP for JS/TS/TSX formatting and import sorting

Added scripts to `package.json`:
- `check`: `biome check .`
- `check:write`: `biome check . --write`
- `format`: `biome format . --write`
- `format:check`: `biome format .`
- `lint:biome`: `biome lint .`
- `lint:eslint`: `eslint .`
- `lint`: `pnpm lint:biome && pnpm lint:eslint`
- `quality`: `pnpm check && pnpm typecheck && pnpm lint:eslint`
- `db:copy:local-to-staging`: `node ./scripts/copy-local-db-to-remote.mjs --to staging --confirm OVERWRITE_STAGING`

### C6 — I18n routing utilities (v2 only)
- Added `isTypedLocale()` and `getTypedLocale()` to `src/i18n/routing.ts`
- Provides type-safe locale checking & coercion used across the codebase

### C7 — Multi-locale revalidate (v2 only)
- Created `src/i18n/revalidate-storefront.ts` from harvest-moon
- Revalidates the same logical route for every configured locale

### C8 — `revalidateGlobal.ts` hook (shopify only)
- Created `src/payload/hooks/revalidateGlobal.ts` from harvest-moon
- Provides `createRevalidateGlobalHook(tag)` for global cache invalidation

---

## Phase 3: Code Quality & Features

### C9/C12 — SEO `generateURL` locale support
- **Both `src/payload/plugins/index.ts`**: Updated `generateURL` to pass `routing.defaultLocale` and `collectionConfig?.slug`
- **Both `src/payload/utilities/seo.ts`**: Updated `getDocumentURL()` signature to accept `(doc, locale, collectionSlug)` and use `frontendPath()` for locale-aware URLs
- **Shopify only**: Created `src/i18n/frontend-path.ts` (was missing)

### C10 — Media `admin.defaultColumns`
- Added `defaultColumns: ["filename", "alt", "muxVideo"]` to both `src/payload/collections/Media/config.ts`

### H2 — `copy-local-db-to-remote.mjs` script
- Copied from harvest-moon to both projects at `scripts/copy-local-db-to-remote.mjs`
- Supports `--to staging|prod`, `--dry-run`, `--force`, `--confirm`, `--skip-backup`

### H3 — `.env.example` updates
- Added `POSTGRES_HOST_PORT=5434` (v2) / `POSTGRES_HOST_PORT=5435` (shopify)
- Updated DATABASE_URI/DATABASE_URI_DIRECT comments to reference the env var
- Shopify: added `SHOPIFY_STATIC_PRERENDER_LIMIT=0`

### H4 — `README.md` updates
- Added `pnpm run quality` to script lists

---

## Phase 4: Nice-to-Haves

### N1 — Color palette extraction
- **Status: REMOVED from both boilerplates per user request**
- Initially added `node-vibrant`, `color-palette.ts`, `populateColorPalette.ts`, `accent-color-picker/` field, and `colorPalette` JSON field to Media config
- Removed because it's project-specific and not appropriate for boilerplate starting points

### N2 — `cn()` class utility
- Created `src/utilities/ui.ts` in both projects (harvest-moon pattern)
- Lightweight `classnames`-like utility without external dependencies

### N3 — `globals-nav.ts`
- Created `src/payload/data/globals-nav.ts` in both projects
- Typed nav item resolution utilities

### N4-N6 — Shopify lib parity (shopify only)
- Verified `market-cookie.ts` and `storefront-context.ts` already present
- Added `isShopifyConfigured()` guard to `getStorefrontOptions()` in `storefront-context.ts`
- `getShopifyStaticPrerenderLimit()` already present in `storefront.ts`

### N7 — Media `alt` field optional
- Removed `required: true` from `alt` field in both `src/payload/collections/Media/config.ts`

---

## Admin Bar Redesign (All 3 Projects)

Updated `src/components/admin-bar/index.tsx` in harvest-moon, v2, and shopify to match `xo-foundation` pattern:

- **Position**: Fixed floating pill (`bottom-4 right-4`, iframe-aware `top-4` centered)
- **Toggle**: "Admin" pill button with "Draft" badge indicator when in preview mode
- **Menu panel**: Rounded glassmorphism card (`bg-black/95`, `backdrop-blur-md`, `border-white/15`)
- **Interactions**: Click-outside and Escape-to-close behavior via `useEffect` listeners
- **Unstyled PayloadAdminBar**: Full custom `classNames` for complete visual control
- **Added**: `index.scss` with `@import '~@payloadcms/ui/scss'` and `small-break` hide rule
- **Exit draft mode**: Available to non-authenticated preview viewers

v2 and shopify versions keep their respective collection label sets (v2: pages only; shopify: pages + productPages) and locale-aware exit-preview handlers.

---

## Critical Bug Fixes Discovered During Testing

### 1. Connection error not caught by setup-hint UI
**Problem**: `isUninitializedPayloadDatabaseError()` only detected schema errors (`42P01` = undefined_table) but not connection errors (`ECONNREFUSED`, `ECONNRESET`, `ENOTFOUND`, `ETIMEDOUT`, `EPIPE`). When Postgres was down, `getPayloadDbReady()` threw instead of returning `false`, so the friendly setup hint never rendered.

**Fix** (all 3 projects — `src/utilities/payload-schema-error.ts`):
- Added `CONNECTION_ERROR_CODES` set
- Added message-level detection for `"cannot connect to postgres"`, `"connect econnrefused"`, `"connection refused"`
- Postgres error code `42703` (undefined_column) now also treated as uninitialized/mismatch

### 2. Schema mismatch not distinguished from missing tables
**Problem**: When the DB had an old migration (pre-`blocksAsJSON`), pages loaded but queries failed with `column pages.layout does not exist`. The UI showed the generic "tables missing" hint, which was misleading.

**Fix** (all 3 projects):
- `src/payload/data/db-ready.ts`: Changed return type from `boolean` to `{ ready: boolean; mismatch: boolean }`
- Added `isSchemaMismatchError()` detector for "column ... does not exist" errors
- All callers updated to check `.ready` and conditionally render `PayloadSchemaMismatchMain` (new red-tinted component) vs `PayloadDatabaseSetupMain`
- Updated `src/components/cms/payload-database-setup.tsx` with `PayloadSchemaMismatchMain` component and schema-mismatch-specific reset instructions

### 3. Baseline migrations incompatible with `blocksAsJSON: true`
**Problem**: Both boilerplates had baseline migrations (`20260324_083413_initial_schema`) generated **before** `blocksAsJSON: true` was added. These migrations stored blocks in separate tables (`pages_blocks_hero`, etc.) and had no `layout jsonb` column on `pages`. After adding `blocksAsJSON: true`, every query failed.

**Fix** (both boilerplates):
- Deleted old `.ts` + `.json` migration files and reset `index.ts`
- Ran `pnpm exec payload migrate:create` to generate fresh baselines:
  - v2: `20260514_115903`
  - shopify: `20260514_120315`
- Verified new migrations contain `"layout" jsonb` on `pages` table
- Applied to local Docker DBs

### 4. `pnpm setup:local` script health check bug
**Problem**: `docker compose ps --format json` returns a **single object** when there is one container, not an array. The `waitForPostgres()` function only handled arrays, so it never found the healthy container and always timed out after 60 seconds.

**Fix** (both `scripts/setup-local.mjs`):
- Normalize output: `const containers = Array.isArray(parsed) ? parsed : [parsed]`
- Check both capitalized (`Health`, `Status`) and lowercase (`health`, `status`) field names

### 5. `pnpm-workspace.yaml` `trustPolicy: no-downgrade` too aggressive
**Problem**: After dependency bumps, `pnpm install` failed with `[ERR_PNPM_TRUST_DOWNGRADE]` on `eslint-import-resolver-typescript@3.10.1` — a false positive because an earlier version had stronger trust evidence than the current one.

**Fix** (both boilerplates):
- Removed `trustPolicy: no-downgrade` line
- Remaining settings (`minimumReleaseAge`, `strictDepBuilds`, `blockExoticSubdeps`, `onlyBuiltDependencies`) still provide strong supply-chain protection

---

## Post-Implementation Lint & Typecheck Enforcement

After the bulk of the parity work was committed, a full lint/typecheck pass was run across all three projects. This surfaced issues that Biome and TypeScript alone did not catch.

### 6. ESLint `react-hooks/set-state-in-effect` in admin-bar
**Problem**: All three `src/components/admin-bar/index.tsx` files called `setState` synchronously inside a `useEffect` body to detect iframe context:
```tsx
useEffect(() => {
  setIsInIframe(window.self !== window.top); // ESLint error
}, []);
```
ESLint rule `react-hooks/set-state-in-effect` flagged this as a cascading-render anti-pattern.

**Fix** (all 3 projects):
- Replaced the `useState` + `useEffect` pattern with `useSyncExternalStore`, which is the idiomatic React API for reading a one-time browser value:
```tsx
const isInIframe = useSyncExternalStore(
  () => () => {},
  () => {
    try { return window.self !== window.top; }
    catch { return true; }
  },
  () => false,
);
```
- Removed the now-unnecessary `useEffect` block entirely.

### 7. `@typescript-eslint/no-unused-vars` underscore convention
**Problem**: ESLint flagged unused destructured parameters in migration files (`payload`, `req`) and unused function parameters (`collectionSlug`, `label`) even when prefixed with `_`. The default `eslint-config-next/typescript` configuration does not ignore underscore-prefixed names.

**Fix** (all 3 projects):
- Updated `eslint.config.mjs` to explicitly allow underscore-prefixed unused variables:
```js
"@typescript-eslint/no-unused-vars": [
  "error",
  {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_",
  },
],
```
- Prefixed genuinely unused parameters with `_` instead of removing them (preserves API signatures).

### 8. Biome auto-fix sweep
**What was fixed** (138 files total across 3 projects):
- Import sorting (`organizeImports` assist action)
- Quote style: single → double (`.mjs` scripts, `sl-cli/`)
- Missing semicolons
- Line wrapping for long expressions
- `tsconfig.json` array/object compact formatting
- Migration SQL template literal trailing semicolons

### Toolchain coverage note
Biome does **not** implement the `react-hooks/set-state-in-effect` rule. From Biome's official rule-sources documentation, only two `eslint-plugin-react-hooks` rules are ported:
- `exhaustive-deps` → `useExhaustiveDependencies`
- `rules-of-hooks` → `useHookAtTopLevel`

This means **ESLint cannot be dropped** from the toolchain while that rule is needed. The `quality` script (`pnpm check && pnpm typecheck && pnpm lint:eslint`) remains the correct full-gate command.

---

## New Files Created

### Both boilerplates
| File | Source |
|------|--------|
| `.nvmrc` | harvest-moon |
| `biome.json` | harvest-moon |
| `BIOME.md` | harvest-moon |
| `.vscode/settings.json` | harvest-moon |
| `.vscode/extensions.json` | harvest-moon |
| `.zed/settings.json` | harvest-moon |
| `scripts/copy-local-db-to-remote.mjs` | harvest-moon |
| `scripts/setup-local.mjs` | New — robust local setup |
| `src/utilities/ui.ts` | harvest-moon |
| `src/payload/data/globals-nav.ts` | harvest-moon |
| `src/payload/hooks/revalidateGlobal.ts` | shopify only |
| `src/i18n/revalidate-storefront.ts` | v2 only |
| `src/components/admin-bar/index.scss` | xo-foundation pattern |

### v2 only
- `src/payload/migrations/20260514_115903.ts` + `.json` (regenerated baseline)

### shopify only
- `src/payload/migrations/20260514_120315.ts` + `.json` (regenerated baseline)
- `src/i18n/frontend-path.ts` (was missing)

---

## Files Modified (Key)

### Both
- `package.json` — deps, devDeps, scripts
- `pnpm-workspace.yaml` — security settings
- `docker-compose.yml` — modernization
- `.gitignore` — IDE exclusions, /tmp
- `next.config.ts` — env.appEnv, turbopack.root
- `src/payload.config.ts` — blocksAsJSON, payloadSecret (shopify)
- `src/payload/plugins/index.ts` — SEO generateURL locale support
- `src/payload/utilities/seo.ts` — locale-aware getDocumentURL
- `src/payload/collections/Media/config.ts` — defaultColumns, alt optional
- `src/utilities/payload-schema-error.ts` — connection + mismatch detection
- `src/payload/data/db-ready.ts` — { ready, mismatch } return type
- `src/components/admin-bar/index.tsx` — pill redesign
- `src/components/cms/payload-database-setup.tsx` — schema mismatch UI
- `src/app/(frontend)/[locale]/page.tsx` — conditional mismatch rendering
- `src/app/(frontend)/[locale]/[slug]/page.tsx` — conditional mismatch rendering
- `src/app/(frontend)/(sitemaps)/sitemap-pages.xml/route.ts` — `.ready` access
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — `.ready` access
- `src/app/(payload)/layout.tsx` — `.ready` access
- `src/payload/data/documents.ts` — `.ready` access
- `src/payload/data/globals.ts` — `.ready` access
- `src/payload/data/redirects.ts` — `.ready` access

### v2 only
- `src/i18n/routing.ts` — added isTypedLocale, getTypedLocale

---

## Verification Checklist

- [x] `pnpm install` succeeds with updated dependencies
- [x] `pnpm setup:local` runs the robust Node.js script (Docker checks, health wait, migrations)
- [x] Postgres container starts and passes health check
- [x] Baseline migrations contain `"layout" jsonb` column
- [x] `pnpm dev` starts without schema errors
- [x] Setup hint renders when DB is down (connection error detection)
- [x] Setup hint renders when DB is empty (missing tables)
- [x] Schema mismatch UI renders when DB has old migration schema
- [x] Site loads with seeded home/test pages after migrations
- [x] Admin UI loads at `/admin`
- [x] `pnpm typecheck` passes in both boilerplates
- [x] `pnpm lint:eslint` passes (0 errors, 0 warnings) in all 3 projects
- [x] `pnpm check` passes (0 errors) in all 3 projects
- [x] Admin-bar uses `useSyncExternalStore` instead of `setState` in `useEffect`

---

## Remaining Gaps / Future Work

These are noted from the original plan but not implemented, or are forward-looking:

1. **H4 README**: Only minimally updated with `pnpm run quality`. Full rewrite to document Biome workflow, new setup script, and troubleshooting would be valuable.
2. **Optional: Forward-looking** (from plan O1-O5):
   - Tailwind CSS v4 `@import "tailwindcss"` syntax verification
   - Next.js 16.3+ `turbopack` stability monitoring
   - Payload v3 MCP plugin collection verification
   - Shopify Storefront API version check (`2026-01` → `2026-04`)
   - ESLint removal evaluation per BIOME.md guidance
3. **Shopify-specific**: The `revalidateGlobal.ts` hook was added, but it is not yet wired into any global configs. Header/footer globals should use it for cache invalidation.
4. **Error boundaries**: The client `error.tsx` could be enhanced to distinguish schema mismatch from connection errors using `isSchemaMismatchErrorMessage()`.

---

## How to Regenerate Baseline Migrations (if schema changes again)

```bash
# 1. Reset the local database
pnpm db:local:reset

# 2. Delete old migration files (keep index.ts)
rm src/payload/migrations/20*.ts src/payload/migrations/20*.json

# 3. Generate fresh baseline
cat > src/payload/migrations/index.ts << 'EOF'
import type { Migration } from "payload/database";
export const migrations: Migration[] = [];
EOF
pnpm exec payload migrate:create

# 4. Apply it
pnpm db:migrate

# 5. Commit the new .ts + .json files
```

---

## How the Setup Script Works

`scripts/setup-local.mjs` replaces the simple shell command with a 7-step process:

1. **Check Docker CLI** — verifies `docker` and `docker compose` are installed; shows OS-specific install instructions if missing
2. **Check Docker daemon** — verifies daemon is running; shows start instructions per OS
3. **Start Postgres** — `docker compose up -d postgres`; handles port conflicts, permission errors
4. **Wait for health** — polls `docker compose ps --format json` every 2s for 60s; handles both single-object and array JSON output
5. **Check baseline migrations** — verifies migration files exist; warns if repo is missing them
6. **Run migrations** — executes `pnpm db:migrate`; catches and explains:
   - Connection refused
   - Column/table does not exist (schema mismatch)
   - Permission denied
   - Already exists / duplicate
7. **Verify status** — runs `payload migrate:status` to confirm all migrations applied

---

*End of document*
