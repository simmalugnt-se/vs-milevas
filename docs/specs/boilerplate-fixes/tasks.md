# Tasks

## Sequencing Notes
- Treat `Status:` in each task as the source of truth for task progress.
- Order tasks by dependency (critical security fix first).
- Keep each task independently verifiable.
- Update task status and handoff notes as work progresses.

## Task List

- TASK-001: Add Payload auth to all Mux API routes
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Added requireMuxAuth() to shared.ts and called it in all 4 Mux routes. Also removed unused isAuthenticated import from shared.ts (partially addresses REQ-008).

- TASK-002: Rename duplicate revalidateGlobal functions + extract factory
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Created createRevalidateGlobalHook() factory in src/payload/hooks/revalidateGlobal.ts. Renamed exports to revalidateHeader/revalidateFooter. Updated config imports.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-002, DES-002
  - Deliverable: Export a shared `createRevalidateGlobalHook(tag)` factory. Header hook renamed to `revalidateHeader`, Footer to `revalidateFooter`. All imports updated.
  - Verification: `pnpm typecheck` passes.
  - Changed Files:
    - `src/payload/globals/Header/hooks/revalidate.ts`
    - `src/payload/globals/Footer/hooks/revalidate.ts`
    - `src/payload/globals/Header/config.ts`
    - `src/payload/globals/Footer/config.ts`
  - Handoff Notes:

- TASK-003: Remove .env.local from git tracking
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: .env.local was already not tracked by git. .gitignore already excludes it. No action needed.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-003, DES-003
  - Deliverable: `.env.local` removed from Git index (cache-only removal). `.gitignore` verified to already exclude it.
  - Verification: `git ls-files .env.local` returns empty.
  - Changed Files:
    - `.env.local` (unstaged — removed from index)
  - Handoff Notes:

- TASK-004: Add explicit PAYLOAD_SECRET validation
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Replaced PAYLOAD_SECRET! with explicit validation that throws a clear error. Stored validated value in payloadSecret const.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-004, DES-004
  - Deliverable: `payload.config.ts` throws a clear error when `PAYLOAD_SECRET` is not set, instead of using `!` non-null assertion.
  - Verification: `pnpm typecheck` passes. Start dev server without PAYLOAD_SECRET → clear error message.
  - Changed Files:
    - `src/payload.config.ts`
  - Handoff Notes:

- TASK-005: Use frontendPath in getDocumentURL for canonical URLs
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Updated getDocumentURL to use frontendPath() with default locale. Added imports for frontendPath, routing, and TypedLocale. Behavior unchanged for default locale.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-005, DES-005
  - Deliverable: `getDocumentURL` in `seo.ts` uses `frontendPath()` for path construction instead of manually building paths.
  - Verification: `pnpm typecheck` passes. Default-locale output unchanged. Non-default locale returns locale-prefixed URL.
  - Changed Files:
    - `src/payload/utilities/seo.ts`
  - Handoff Notes:

- TASK-006: Delete unused default SVGs
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Removed file.svg, globe.svg, next.svg, vercel.svg, window.svg from public/. No references found in codebase.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-006, DES-006
  - Deliverable: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` deleted from `public/`.
  - Verification: `pnpm build` succeeds without errors or missing-asset warnings.
  - Changed Files:
    - `public/file.svg` (deleted)
    - `public/globe.svg` (deleted)
    - `public/next.svg` (deleted)
    - `public/vercel.svg` (deleted)
    - `public/window.svg` (deleted)
  - Handoff Notes:

- TASK-007: Extract duplicate Mux utilities to shared.ts + remove unused import
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Moved isAbortLikeError, getMuxErrorMessage, and abortResponse to shared.ts. Removed local copies from all 4 route files. Removed unused req parameter from requireMuxCredentials. Zero lint warnings.
  - Last Updated: 2026-05-01
  - Depends on: TASK-001 (shared.ts already modified)
  - Maps to: REQ-007, REQ-008, DES-007, DES-008
  - Deliverable: `isAbortLikeError()` and `getMuxErrorMessage()` moved to `shared.ts` and imported by all route files. Unused `isAuthenticated` import removed. Lint warnings resolved.
  - Verification: `pnpm lint` shows no warnings for `shared.ts`. `pnpm typecheck` passes.
  - Changed Files:
    - `src/app/(payload)/api/mux/shared.ts`
    - `src/app/(payload)/api/mux/get-assets/route.ts`
    - `src/app/(payload)/api/mux/upload-asset/route.ts`
    - `src/app/(payload)/api/mux/delete-asset/route.ts`
    - `src/app/(payload)/api/mux/asset-status/route.ts`
  - Handoff Notes:

- TASK-008: Verify sitemap locale URLs (investigation)
  - Status: done
  - Last Updated: 2026-05-01
  - Handoff Notes: Confirmed sitemap-pages.xml/route.ts already uses frontendPath(path, locale) for all entries. No changes needed.
  - Last Updated: 2026-05-01
  - Depends on: none
  - Maps to: REQ-009, DES-009
  - Deliverable: Confirm `sitemap-pages.xml/route.ts` already uses `frontendPath()` correctly. If so, no code changes needed — document findings.
  - Verification: Read the route file and confirm `frontendPath(path, locale)` is used for every sitemap entry.
  - Changed Files:
    - (none expected — already correct per design review)
  - Handoff Notes:

## Blockers
- None.

## Rollout and Safety
- Feature flags: None needed. Each change is small and independently verifiable.
- Rollback plan: Revert specific commits per changed file. No cross-cutting changes.

## Done Criteria
- [ ] All task `Status` values are `done`
- [ ] All mapped requirements satisfied
- [ ] `pnpm typecheck` and `pnpm lint` pass with no errors
- [ ] BOILERPLATE_REVIEW.md updated to reflect completed fixes (optional)
- [ ] `status.md` marks the spec as done
