# Design

## Summary
- Add Payload auth checks to all Mux API routes (critical security fix).
- Rename duplicate `revalidateGlobal` functions for clarity.
- Remove `.env.local` from git tracking.
- Add explicit `PAYLOAD_SECRET` validation.
- Minor improvements: use `frontendPath()` in `getDocumentURL` for consistency, remove unused SVGs and imports, extract duplicate Mux utilities, verify sitemap locale correctness.
- All changes are small, targeted edits — no architecture changes.

## Requirement Mapping
- REQ-001 -> DES-001: Add Payload auth check to Mux API routes
- REQ-002 -> DES-002: Rename Header/Footer revalidate hooks
- REQ-003 -> DES-003: Un-track .env.local from git
- REQ-004 -> DES-004: Validate PAYLOAD_SECRET explicitly
- REQ-005 -> DES-005: Use `frontendPath()` in `getDocumentURL` for consistency
- REQ-006 -> DES-006: Delete unused default SVGs
- REQ-007 -> DES-007: Extract duplicate Mux utility functions to shared.ts
- REQ-008 -> DES-008: Remove unused `isAuthenticated` import from shared.ts
- REQ-009 -> DES-009: Verify sitemap locale URLs (already correct — no change needed)

## Design Decisions

- DES-001: Payload auth on Mux routes
  - Decision: Use `payload.auth()` with request headers in each Mux route handler, returning 403 on failure.
  - Why: This is the standard Payload pattern for authenticating API requests. The `preview` route already does this.
  - Tradeoffs: Adds a DB round-trip on each Mux API call. Acceptable since Mux calls are infrequent and user-initiated.

- DES-002: Rename revalidate hooks
  - Decision: Rename Header's `revalidateGlobal` to `revalidateHeader`, Footer's to `revalidateFooter`. Export a shared factory function `createRevalidateGlobalHook(tag)` to reduce duplication.
  - Why: Prevents import confusion — both files currently export identically named functions. A factory eliminates repetition.
  - Tradeoffs: Slightly more abstract, but the factory is tiny and keeps each hook consistent.

- DES-003: Un-track .env.local
  - Decision: Run `git rm --cached .env.local` and confirm `.gitignore` already has the entry.
  - Why: Standard Git hygiene for env files.
  - Tradeoffs: None.

- DES-004: Validate PAYLOAD_SECRET
  - Decision: Replace the `!` assertion with an explicit check that throws a descriptive error.
  - Why: Prevents silent `undefined` passing into Payload's initialization.
  - Tradeoffs: None.

- DES-005: Use frontendPath in getDocumentURL
  - Decision: Update `getDocumentURL` in `seo.ts` to use `frontendPath()` for path construction.
  - Why: Consistency with the rest of the codebase. The actual canonical URLs are already correct via `buildPageMetadata` in the frontend; this just makes the admin "view page" link consistent.
  - Tradeoffs: None — `frontendPath("/", "en")` produces `/`, and `frontendPath("/test", "en")` produces `/test`, so default-locale behavior is identical.

- DES-006: Delete unused SVGs
  - Decision: Remove `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` from `public/`.
  - Why: Cleanup from `create-next-app` template.
  - Tradeoffs: None.

- DES-007: Extract Mux utilities
  - Decision: Move `isAbortLikeError()` and `getMuxErrorMessage()` into `shared.ts`. Remove local copies from each route file.
  - Why: DRY — the same functions are duplicated across all four Mux route files.
  - Tradeoffs: None; the shared module already exists.

- DES-008: Remove unused import
  - Decision: Remove the `isAuthenticated` import from `shared.ts`.
  - Why: It's never used and the linter warns about it.
  - Tradeoffs: None.

- DES-009: Sitemap URLs verified
  - Decision: The sitemap at `sitemap-pages.xml/route.ts` already calls `frontendPath(path, locale)` for every entry. No change needed.
  - Why: Code is already correct per the requirement.
  - Tradeoffs: N/A

## Architecture and Components
No new components. All changes are within existing files:
- `src/app/(payload)/api/mux/shared.ts` — add auth helper + extracted utilities
- `src/app/(payload)/api/mux/*/route.ts` — add auth check, import utilities from shared
- `src/payload/globals/Header/hooks/revalidate.ts` — rename function
- `src/payload/globals/Footer/hooks/revalidate.ts` — rename function + use factory
- `src/payload/globals/Header/config.ts` — update import
- `src/payload/globals/Footer/config.ts` — update import
- `src/payload.config.ts` — validate PAYLOAD_SECRET
- `src/payload/utilities/seo.ts` — use frontendPath()
- `public/*.svg` — delete unused files

## Data Model
No data model changes.

## Interfaces and Contracts

### New/Modified exports from `shared.ts`
```
// New
function requireMuxAuth(req: NextRequest): Promise<Response | null>
  - Returns null if authenticated, or a 403 Response if not.

// Moved from route files (already in shared.ts)
function isAbortLikeError(error: unknown): boolean
function getMuxErrorMessage(errorText: string): string | null
```

### Modified Header/Footer hooks
```
// Header hooks
export const revalidateHeader: GlobalAfterChangeHook = ...

// Footer hooks  
export const revalidateFooter: GlobalAfterChangeHook = ...
```

## Flows and States
- Mux API auth check (happy path): Request comes in → `requireMuxAuth()` calls `payload.auth()` → user is authenticated → handler runs normally.
- Mux API auth check (error): Request comes in → `requireMuxAuth()` calls `payload.auth()` → user is not authenticated → return 403 response.
- Payload config startup: `PAYLOAD_SECRET` missing → throw `Error("PAYLOAD_SECRET is required")`.

## Risks and Tradeoffs
- Risk 1: Mux auth check adds latency to each Mux API call.
  - Impact: ~10-50ms per request for the `payload.auth()` call.
  - Mitigation: Acceptable — Mux operations are infrequent and user-initiated.
- Risk 2: Renaming exports may break external consumers if anyone imports those functions.
  - Impact: TypeScript compilation error on stale imports.
  - Mitigation: Rename + update all imports in the same commit. The functions are internal to the boilerplate and not a public API.

## Validation Plan
- REQ-001 -> Manual: Send unauthenticated request to any Mux route → 403. Send authenticated admin request → success.
- REQ-002 -> `pnpm typecheck` passes after rename.
- REQ-003 -> `git ls-files .env.local` returns empty.
- REQ-004 -> Start dev server without `PAYLOAD_SECRET` → clear error message.
- REQ-005 -> `pnpm typecheck` passes. Verify `getDocumentURL` output unchanged for default locale.
- REQ-006 -> `pnpm build` succeeds without errors.
- REQ-007 -> `pnpm lint` shows no unused-variable warnings.
- REQ-008 -> `pnpm lint` shows no unused-variable warnings in `shared.ts`.
- REQ-009 -> Visual inspection of sitemap output confirms locale-prefixed URLs.

## Question References
- None.
