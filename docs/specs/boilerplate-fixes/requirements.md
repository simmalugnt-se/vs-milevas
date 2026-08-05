# Requirements

## Summary
Address the issues identified in BOILERPLATE_REVIEW.md across the payload-boilerplate-v2 repo. Fixes span a critical security vulnerability (Mux API routes unauthenticated), high/medium priority code quality issues, and low-priority cleanup, following the priority order established in the review.

## Problem Statement
- What problem is being solved?
  The boilerplate has been reviewed and several issues were identified — from a security vulnerability (Mux routes have no auth) to code quality concerns (unused SVGs, duplicate code, non-localized SEO URLs). These should be fixed to make the boilerplate production-ready.
- Why now?
  The fixes are incremental and independent; addressing them early prevents accumulating tech debt and avoids shipping a public-facing Mux API with no auth checks.

## Goals
- G1: Fix the Mux API security vulnerability (unauthenticated access to Mux routes).
- G2: Fix code quality and correctness issues (SEO URLs, unused imports, naming collisions, stale files).
- G3: Improve DX by adding explicit validation for required env vars and removing tracking of .env.local.

## Non-Goals
- NG1: Do not rewrite existing architecture or change the caching/revalidation approach.
- NG2: Do not change the i18n strategy, block system, or data layer abstraction.

## Users and Key Flows
- Primary user: Developer using this boilerplate for a Payload CMS + Next.js project.
- Primary flow: Clone repo → set up env → run migrations → develop → deploy.
- Secondary flow: Developer inspects the codebase to understand Payload + Next.js patterns.

## Functional Requirements

- REQ-001: Mux API routes require Payload authentication
  - Priority: Must
  - Rationale: All Mux routes (`/api/mux/get-assets`, `/api/mux/upload-asset`, `/api/mux/delete-asset`, `/api/mux/asset-status`) are publicly accessible. Any unauthenticated visitor can list, upload, or delete Mux assets. This is a security vulnerability.

- REQ-002: Rename duplicate `revalidateGlobal` functions to avoid confusion
  - Priority: Should
  - Rationale: Both Header and Footer hooks export `revalidateGlobal`. While each correctly targets its own tag, the identical name is error-prone during imports.

- REQ-003: Remove `.env.local` from git tracking
  - Priority: Must
  - Rationale: `.env.local` may contain development secrets and should not be checked in. The `.gitignore` already excludes it, but it may be tracked in the index.

- REQ-004: Add `PAYLOAD_SECRET` validation with a clear error message
  - Priority: Should
  - Rationale: The current non-null assertion (`!`) silently passes `undefined` if the variable is missing, causing cryptic Payload initialization failures.

- REQ-005: Fix SEO `generateURL` to produce locale-aware canonical URLs
  - Priority: Should
  - Rationale: The SEO plugin's `generateURL` everywhere returns a URL without locale prefix. For non-default locales, canonical URLs will point to the wrong page, harming SEO.

- REQ-006: Remove unused default SVGs from `public/`
  - Priority: Could
  - Rationale: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are leftover from `create-next-app` and are not used anywhere.

- REQ-007: Extract duplicate Mux utilities into `shared.ts`
  - Priority: Could
  - Rationale: `isAbortLikeError()` and `getMuxErrorMessage()` are duplicated across multiple Mux route files. Extract to `shared.ts` for maintainability.

- REQ-008: Remove unused `isAuthenticated` import from Mux `shared.ts`
  - Priority: Should
  - Rationale: `isAuthenticated` is imported but never used in `shared.ts`. Clean up dead imports.

- REQ-009: Add locale-aware canonical URL to sitemap generation
  - Priority: Could
  - Rationale: The sitemap already generates per-locale entries with `frontendPath`. Confirm this is correct; if not, fix the URL construction.

## Acceptance Criteria

- REQ-001 (Mux auth)
  - [ ] AC-001: Each Mux route verifies the request is from an authenticated Payload user before processing.
  - [ ] AC-002: Unauthenticated requests receive a 403 response.
  - [ ] AC-003: Authorized requests continue to work as before.

- REQ-002 (rename revalidateGlobal)
  - [ ] AC-004: Header hook exports `revalidateHeader` (or similar unique name).
  - [ ] AC-005: Footer hook exports `revalidateFooter` (or similar unique name).
  - [ ] AC-006: Both hooks are imported correctly in their respective global configs.
  - [ ] AC-007: `status.md` is updated to reflect completion.

- REQ-003 (remove .env.local)
  - [ ] AC-008: `.env.local` is no longer tracked by git (`git rm --cached .env.local`).
  - [ ] AC-009: The `.gitignore` already excludes `.env.local` — verified.

- REQ-004 (PAYLOAD_SECRET validation)
  - [ ] AC-010: A clear error is thrown when `PAYLOAD_SECRET` is not set.
  - [ ] AC-011: The error message includes the missing variable name.

- REQ-005 (SEO locale-aware URLs)
  - [ ] AC-012: SEO plugin `generateURL` returns a localized URL when the document locale is non-default.
  - [ ] AC-013: Default-locale URLs remain unchanged.

- REQ-006 (remove unused SVGs)
  - [ ] AC-014: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are deleted.
  - [ ] AC-015: No build errors or missing-asset errors after removal.

- REQ-007 (extract Mux utilities)
  - [ ] AC-016: `isAbortLikeError` and `getMuxErrorMessage` are defined in `shared.ts` and exported.
  - [ ] AC-017: All Mux route files import from `shared.ts` instead of defining them locally.

- REQ-008 (remove unused import)
  - [ ] AC-018: `isAuthenticated` import is removed from `shared.ts`.
  - [ ] AC-019: No unused-variable lint warnings for `shared.ts`.

- REQ-009 (sitemap locale URLs)
  - [ ] AC-020: Sitemap entries use `frontendPath()` for locale-aware URLs (verify existing code is correct; fix if not).

## Constraints and Dependencies
- Technical: All changes are within the existing file structure. No external dependencies.
- Product: The security fix (REQ-001) is critical and must be done first.
- External dependencies: None.
- Timeline: Incremental — each requirement is independently verifiable.

## Question References
- None.
