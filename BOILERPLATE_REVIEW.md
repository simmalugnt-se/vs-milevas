# Boilerplate Review: Payload CMS 3 + Next.js 16

> Review date: 2026-05-01  
> Versions: Next.js 16.2.1 · Payload 3.80.0 · React 19.2.3 · next-intl 4.x · Tailwind CSS 4

---

## Executive Summary

This is a well-structured, production-minded boilerplate that covers the major concerns of a localized CMS-driven marketing site. The architecture is thoughtful — clear separation between Payload admin and frontend route groups, solid caching/revalidation, and good DX tooling (scaffolding CLI, DB copy scripts). There are, however, several concrete issues and some areas where the setup deviates from or can be tightened against current best practices. Below is a detailed breakdown.

---

## What's Done Well ✅

### 1. Route Group Architecture
The `(payload)` / `(frontend)` route group split cleanly isolates the CMS admin shell from the public site. Each group gets its own layout, CSS, and middleware behavior — the frontend never loads Payload admin CSS, and the admin never loads site fonts.

### 2. Localization Strategy
`next-intl` with `localePrefix: "as-needed"` and `localeDetection: false` is a good choice — default-locale URLs stay clean (`/about` instead of `/en/about`), and `frontendPath()` correctly generates paths that respect this policy. The `messages/en.json` + `messages/sv.json` structure follows next-intl conventions.

### 3. Revalidation Design
The `unstable_cache` + tag-based revalidation pattern in `documents.ts` and `globals.ts` is the correct approach for Next.js App Router. Draft requests use `unstable_noStore()` to bypass cache, published data gets tagged (`"pages"`, `"page:${slug}"`, `"global:header"`, `"global:footer"`, `"redirects"`, `"sitemap-pages"`), and Payload hooks call `revalidateTag()` on content changes. This is the pattern the official Payload website template recommends.

### 4. Database-Ready Graceful Degradation
The `getPayloadDbReady()` check and the `PayloadDatabaseSetupBanner` / `PayloadAdminDatabaseSetupShell` / `PayloadDatabaseSetupMain` components handle the "empty DB" first-run experience well. Both the admin and the frontend show helpful instructions rather than raw error overlays.

### 5. Environment-Aware Config
`resolveEnv()` with `APP_ENV` suffices (`LOCAL`, `STAGING`, `PROD`) is a practical pattern for managing per-environment database URLs. The guard against `PAYLOAD_LOCAL_PUSH` on non-local hosts is a nice safety check.

### 6. Seeding
The `seedDefaultSiteIfEmpty()` function is idempotent, runs in `onInit`, and uses `context: { disableRevalidate: true }` to avoid cache purges during seeding. Good pattern.

### 7. Preview Flow
The preview route properly validates `PREVIEW_SECRET`, checks Payload auth, and enables draft mode. The exit-preview route correctly disables it. The `LivePreviewListener` component uses `@payloadcms/live-preview-react`.

### 8. Scaffolding CLI
The `sl-cli` generators for collections, globals, blocks, fields, components, contexts, APIs, and utilities provide a consistent DX for extending the boilerplate. The `registry.ts` pattern with `// sl-cli:array (do not remove)` sentinel comments allows the generators to inject new entries.

### 9. Docker Compose
Using host port `5434` instead of `5432` avoids clashes with system Postgres. The health check configuration is present.

### 10. Vercel CI Pipeline
`vercel.json` overrides the build command to run `payload migrate` before `next build`, which is the recommended approach. The docs clearly warn against pointing Preview and Production at the same DB.

---

## Issues & Concerns ⚠️

### Critical

#### C1. Mux API Routes Expose Mux Credentials to the Browser
**Files:** `src/app/(payload)/api/mux/*`

All four Mux API routes (`get-assets`, `upload-asset`, `delete-asset`, `asset-status`) make direct calls to the Mux REST API using server-side `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET`. While the credentials stay server-side, **none of these routes check whether the request is from an authenticated Payload user**. The `shared.ts` file imports `isAuthenticated` but never uses it. Any unauthenticated visitor can:

- List all Mux assets (`GET /api/mux/get-assets`)
- Upload videos to your Mux account (`POST /api/mux/upload-asset`)
- Delete Mux assets (`DELETE /api/mux/delete-asset`)

This is a **security vulnerability**. Every route should verify `req.user` via Payload auth before processing.

#### C2. Mux API Routes Have No Auth — Production Risk
Even the `asset-status` route is unauthenticated, allowing anyone to poll Mux asset status by ID. Combined with C1, this means the entire Mux integration is publicly accessible.

### High

#### H1. `unstable_cache` Locale Key May Cause Stale Content on Default Locale
**Files:** `documents.ts`, `globals.ts`

The cache keys include the locale string (e.g., `["page-by-slug", "home", "en"]`), which is correct for multi-locale. However, `unstable_cache` in Next.js is documented as unstable and subject to breaking changes. While this is the best available option today, it's worth noting that the Next.js team may change this API. Consider adding a comment or abstracting the caching layer so it can be swapped later.

#### H2. Revalidation Hooks Share Identical Function Name `revalidateGlobal`
**Files:** `src/payload/globals/Header/hooks/revalidate.ts`, `src/payload/globals/Footer/hooks/revalidate.ts`

Both Header and Footer export a function named `revalidateGlobal`, which is a naming collision risk. However, upon inspection, each file correctly revalidates its own tag (`"global:header"` vs `"global:footer"`), so there's no actual cache bug. The naming is confusing though — consider renaming to `revalidateHeader` and `revalidateFooter` respectively, or creating a factory function that takes the tag name as a parameter to reduce duplication.

#### H3. Media Collection `mimeTypes` Restricts to Images Only
**File:** `src/payload/collections/Media/config.ts`

```ts
mimeTypes: ["image/*"],
```

This prevents uploading video files, PDFs, or documents through the admin. Since the Mux integration exists for video, you likely want videos to go through the Mux field. But the `mimeTypes` restriction means you can't upload PDFs or other document types. If this is intentional, it should be documented. If not, the restriction should be broadened.

#### H4. No Rate Limiting or Brute-Force Protection on Auth
The `canCreateFirstUser` access control queries the database to check if any users exist before allowing creation. This is correct, but there's no rate limiting on the login endpoint. While Payload handles auth internally, you may want to add rate limiting at the Next.js middleware level for production.

#### H5. `getPayloadClient()` Creates a New Instance on Every Call
**File:** `src/payload/get-payload.ts`

```ts
export const getPayloadClient = () =>
  getPayload({
    config,
    importMap,
  });
```

This calls `getPayload()` from `payload` on every invocation. While Payload internally caches the initialized instance by config reference, this pattern creates unnecessary overhead from the config import on each call. The official pattern is to initialize Payload once (module-level) and export the result. Consider caching the result:

```ts
let cached = globalThis._payloadClient;
if (!cached) {
  cached = await getPayload({ config, importMap });
  globalThis._payloadClient = cached;
}
export const getPayloadClient = async () => cached ?? (cached = await getPayload({ config, importMap }));
```

#### H6. `localePrefix: "as-needed"` May Conflict with Payload Admin
There's a known issue ([payloadcms/payload#10675](https://github.com/payloadcms/payload/issues/10675)) where `[locale]` dynamic segments can interfere with Payload admin routing. The current middleware matcher excludes `/admin`, `/api`, `/graphql`, etc., which should work. However, the `(payload)` route group is outside the `[locale]` segment, which is the correct approach. This is working but should be monitored as Payload and next-intl evolve.

### Medium

#### M1. `.env.local` Is Not in `.gitignore` — But Should Be Verified
The `.gitignore` includes `.env.local`, which is correct. However, the repo currently has `.env.local` checked in (visible in the `ls -la` output). This file likely contains local development secrets (`PAYLOAD_SECRET`, database credentials). It should be removed from git tracking:

```bash
git rm --cached .env.local
```

#### M2. `PAYLOAD_SECRET` Uses Non-Null Assertion
**File:** `src/payload.config.ts`

```ts
secret: process.env.PAYLOAD_SECRET!,
```

The `!` assertion means a missing `PAYLOAD_SECRET` will silently be `undefined` at runtime, causing cryptic Payload initialization failures. Consider throwing a clear error:

```ts
secret: process.env.PAYLOAD_SECRET || (() => { throw new Error("PAYLOAD_SECRET is required") })(),
```

#### M3. `link` Field Type Doesn't Support Localized URLs
**File:** `src/payload/fields/link.ts`

The `link` group field doesn't localize the `label` or `url` fields. If the site needs localized navigation labels (which is common for multilingual sites), the `label` field should be `localized: true`. The `url` field might also need localization for external links targeting different regional sites.

#### M4. `formatSlug` Strips Non-Latin Characters
**File:** `src/payload/utilities/formatSlug.ts`

```ts
.replace(/[^a-z0-9]+/g, "-")
```

This regex strips all non-ASCII characters, which means localized pages targeting Swedish audiences (with characters like å, ä, ö) will have their slugs mangled. For example, "Om oss" becomes "om-oss" (which is actually fine), but "Ölprovning" becomes "-lprovning". Consider adding transliteration for common non-ASCII characters.

#### M5. Block Components Are Registered Via Satisfies but Not Type-Narrowed at Render Time
**File:** `src/payload/blocks/definitions.ts`

The `blockComponents` map uses `renderTypedBlock()` which narrows the block type before rendering. This is a good pattern. However, the `RenderBlocks` component casts to `Record<string, LayoutBlockRenderer>` which loses the type narrowing. This is fine at runtime but means TypeScript won't catch missing block registrations during compilation. Consider adding a compile-time check that all `layoutBlocks` entries have a corresponding `blockComponents` entry.

#### M6. SEO Plugin `generateURL` Doesn't Localize
**File:** `src/payload/plugins/index.ts`

The `generateURL` callback in the SEO plugin config uses `getDocumentURL(doc)` which returns a URL without locale prefix. Since the frontend uses `localePrefix: "as-needed"`, the default locale URL would be correct, but non-default locale canonical URLs would be wrong. This could cause SEO issues with search engines indexing the wrong canonical URL for localized pages.

#### M7. `next-sitemap` Runs in `postbuild` but May Not Have Correct Base URL
**File:** `next-sitemap.config.cjs`

The `SITE_URL` fallback chain uses `NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_SERVER_URL || VERCEL_PROJECT_PRODUCTION_URL || "https://example.com"`. The `"https://example.com"` default will generate sitemaps and robots.txt pointing to example.com during local builds, which could accidentally be deployed. Consider making this a hard requirement or at least warning during build.

#### M8. `pages` Collection Slug Is Unique but Not Localized
**File:** `src/payload/collections/Pages/config.ts`

The `slugField` has `localized: false`, which means the same slug is shared across all locales. This is intentional per the boilerplate contract, but it means you can't have locale-specific slugs (e.g., `/about` in English and `/om-oss` in Swedish). This is a design choice, but it limits future flexibility. If locale-specific slugs are ever needed, this will require a migration.

#### M9. `getPageSlugs` Hardcodes `limit: 1000`
**File:** `src/payload/data/documents.ts`

```ts
limit: 1000,
```

If the site grows beyond 1000 pages, `generateStaticParams` will miss pages. Consider using `pagination: false` (which it already does) and removing the `limit` cap, or implementing pagination.

#### M10. No Content Security Policy or Security Headers
The middleware in `src/proxy.ts` only handles next-intl locale routing. There are no security headers (CSP, X-Frame-Options, HSTS, etc.) configured. For a production boilerplate, consider adding security headers via `next.config.ts` or middleware.

### Low

#### L1. Duplicate `isAbortLikeError` and `getMuxErrorMessage` Functions
**Files:** `upload-asset/route.ts`, `delete-asset/route.ts`

These utility functions are duplicated across multiple Mux route files. They should be extracted into `shared.ts`.

#### L2. `MuxComponent.tsx` Is ~350 Lines and Very Complex
The Mux custom field component is substantial with inline styles, state management for polling, file uploads, delete confirmation, and error handling. Consider breaking it into smaller components (upload form, video grid, video card, etc.) for maintainability.

#### L3. `corHeaders` Function Name Typo
**File:** `src/app/(payload)/api/mux/shared.ts`

The function is named `corsHeaders()` in the return value but the function itself is `corsHeaders()` — this is correct, no typo. (Verified — the name is consistent.)

#### L4. Unused Default SVGs in `/public`
**Files:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

These are from the default `create-next-app` template and aren't referenced anywhere. They should be removed to keep the boilerplate clean.

#### L5. `Sharp` Is Listed as a Runtime Dependency
**File:** `package.json`

```json
"sharp": "^0.34.5"
```

While Payload requires `sharp` for image processing, the `pnpm-workspace.yaml` lists it under `ignoredBuiltDependencies`. This is fine for local dev but may cause issues in environments where `sharp` native bindings can't be built. The Vercel build should handle this, but it's worth documenting.

#### L6. `tsconfig.json` Uses `"target": "ES2017"`
This is quite old as a compile target. While Next.js handles transpilation, the tsconfig target could be bumped to `ES2020` or later to enable modern JS features in type checking.

#### L7. No Tests
There are no test files anywhere in the project. For a boilerplate meant for production use, having at least basic integration tests for data fetching, revalidation hooks, and access control would give users confidence. Consider adding a testing setup (Vitest + Testing Library) with a few representative tests.

#### L8. `revalidateGlobal` Naming Confusion
Both Header and Footer hooks export a function named `revalidateGlobal`, which can cause confusion during imports. Each correctly targets its own tag, but the identical name makes it easy to accidentally import the wrong one.

---

## Architecture Observations 🔍

### Positive Patterns Worth Highlighting

1. **Draft-aware data fetching**: Every data fetch function (`getPageBySlug`, `getHeader`, `getFooter`) accepts a `draft` parameter and correctly uses `unstable_noStore()` when in draft mode. This is exactly right.

2. **Payload redirects integration**: The `PayloadRedirects` component resolves redirects server-side before falling back to `notFound()`. This is the correct approach — no client-side redirect flash.

3. **Graceful degradation chain**: Page components check `getPayloadDbReady()` before trying to fetch, showing setup instructions if the DB is empty. This handles the common "forgot to run migrations" scenario elegantly.

4. **Block system extensibility**: The `definitions.ts` pattern with typed `LayoutBlockRenderer` and the `satisfies Record<string, LayoutBlockRenderer>` pattern provides good type safety while remaining extensible via `sl-cli`.

5. **Admin bar**: The `@payloadcms/admin-bar` integration with locale-aware preview/exit is well done.

6. **SEO metadata generation**: `buildPageMetadata()` correctly falls back from explicit meta fields to derived content, and generates proper Open Graph data.

### Areas for Improvement

1. **Consider a `src/payload/data/` layer abstraction**: Currently, data fetching is spread between `documents.ts`, `globals.ts`, `redirects.ts`, and `db-ready.ts`. Consider consolidating these into a more formal data access layer or repository pattern, which would make it easier to add caching strategies, error boundaries, or mock data for tests.

2. **Consider `dynamic = "force-dynamic"` on the locale layout**: The commented-out `// export const dynamic = "force-dynamic"` in `[locale]/layout.tsx` suggests this was considered and deferred. With `unstable_cache` + tags, static generation with revalidation should work, but you may want to enable ISR for pages that don't use draft mode.

3. **Media type handling**: The `PayloadMedia` component handles both images and Mux videos, but there's no fallback for PDFs, SVGs, or other file types that might be uploaded if `mimeTypes` is broadened.

4. **Error boundary for CMS fetches**: While `getPayloadDbReady()` catches the empty-DB case, there's no error boundary for transient database connection failures during normal operation. Consider adding a React error boundary around CMS-dependent content.

---

## Comparison with Official Payload Website Template

| Feature | This Boilerplate | Official Template |
|---------|-----------------|-------------------|
| Next.js | 16.2.1 (App Router) | 15.x (App Router) |
| Localization | next-intl (en, sv) | Not included |
| Route groups | (payload) + (frontend) | Single app/ |
| Revalidation | unstable_cache + tags | revalidatePath + tags |
| Draft mode | Custom implementation | Custom implementation |
| Seeding | onInit + disableRevalidate | Not included |
| DB setup guard | ✅ Full graceful UX | ❌ |
| Media storage | R2 (S3-compatible) | Vercel Blob |
| Video | Mux integration | Not included |
| Block system | Typed, extensible | Simpler |
| Redirects | Payload plugin + server-side | Payload plugin |
| Sitemap | Custom + next-sitemap | Not included |
| Custom admin bar | ✅ | ✅ |
| Preview | Custom route + live preview | Custom route + live preview |

The boilerplate is significantly more feature-rich than the official template, particularly around localization, the database setup guard, Mux integration, and the sitemap. The official template is simpler and easier to learn from, but this boilerplate covers more production concerns.

---

## Recommended Priority Actions

1. **🔴 Fix the Mux API auth issue (C1, C2)** — Add Payload auth checks to all Mux routes. This is a security vulnerability.
2. **🟡 Rename duplicate `revalidateGlobal` functions (H2)** — Both Header and Footer export `revalidateGlobal`; rename to `revalidateHeader`/`revalidateFooter` or extract a factory.
3. **🟡 Remove `.env.local` from git tracking (M1)**.
4. **🟢 Add `PAYLOAD_SECRET` validation (M2)** — ✅ Done (shopify boilerplate only; throws clear error if missing).
5. **🟢 Fix SEO `generateURL` for localized pages (M6)** — ✅ Done (`generateURL` now passes `routing.defaultLocale` and `collectionConfig?.slug`; `getDocumentURL()` uses `frontendPath()` for locale-aware URLs).
6. **🟡 Remove unused default SVGs from `public/` (L4)**.
7. **🟢 Extract duplicate Mux utilities to `shared.ts` (L1)**.
8. **🟢 Consider adding basic test infrastructure (L7)**.
9. **🟢 Bump `tsconfig.json` target to ES2020+ (L6)**.

---

## Post-Review Changes (2026-05-14)

The following items were addressed in the parity session after this review was written:

### Admin Bar Redesign
- Redesigned admin bar to a floating pill (`bottom-4 right-4`, iframe-aware) with glassmorphism menu panel.
- Uses unstyled `PayloadAdminBar` with fully custom `classNames`.
- **Fix introduced and resolved**: The initial redesign used `useEffect` + `setState` to detect iframe context, which triggered ESLint rule `react-hooks/set-state-in-effect`. This was refactored to `useSyncExternalStore` (the React-idiomatic API for one-time browser values).

### Lint/Typecheck Toolchain
- Added Biome (`biome.json`, `BIOME.md`, IDE settings, `quality` script).
- Ran full `pnpm check` + `pnpm typecheck` + `pnpm lint:eslint` across all three projects.
- **138 files** auto-fixed for formatting/import sorting.
- **ESLint config updated** in all projects to allow underscore-prefixed unused variables (`argsIgnorePattern: "^_"`, `varsIgnorePattern: "^_"`).
- **Key finding**: Biome does not implement `react-hooks/set-state-in-effect`; only `useExhaustiveDependencies` and `useHookAtTopLevel` are ported from `eslint-plugin-react-hooks`. ESLint remains required for complete hooks coverage.

### Database Setup & Migration Robustness
- Added `scripts/setup-local.mjs` with Docker detection, daemon checks, health polling, and per-error-type actionable messages.
- Regenerated baseline migrations with `blocksAsJSON: true` schema after discovering old migrations lacked the `layout jsonb` column.
- Added schema-mismatch detection (`42703` / `column ... does not exist`) distinct from connection errors, with a dedicated red-tinted UI component.

---

*This review was generated by analyzing every source file in the repository against current Payload CMS 3 and Next.js 16 App Router best practices.*