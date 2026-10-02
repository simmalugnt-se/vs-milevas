<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Milevas

Milevas' website: Payload 3 + Next.js 16, started from `payload-boilerplate-v2` and last brought up
to date with it at commit `ed9d953` (2026-10-01). `README.md` has setup, scripts and how to remove
a plugin.

- Milevas' own parts: the truck configurator (`src/features/configurator`, `TruckFamilies`,
  `ConfiguratorRequests`, `ConfiguratorSettings`, the `configurator` block), the temporary landing
  page (`MILEVAS_LANDING_ONLY` in `src/proxy.ts`) and Swedish as the default locale. Everything else
  follows the boilerplate; keep it close so later updates merge cleanly.
- Design system from Figma "Milevas — Website": tokens in `src/styles/site-theme.css`, components in
  `src/components/ui`, all shown on `/kitchensink`. Record every deviation from Figma, and every gap
  in Figma the code fills, in `docs/figma-deviations.md`.
- Plugins: visual editing is on. Content health and the editor assistant are installed but commented
  out in `src/payload/plugins/index.ts`; the assistant needs a migration for its tables when it is
  turned on.
- `pnpm typecheck`, `pnpm lint` and `pnpm test` pass before a commit.
- Production and staging each have a Neon branch with its own database and bucket; Vercel's
  Production and Preview use them through `SERVICES=cloud`. Migrations run on deploy (`ci:build`).
  Test a new migration against a database at the current production state, never against
  production itself.
- Local development uses `SERVICES=local` (Docker, files in `images/` and `documents/`). The copy
  scripts read production and staging from `.env.remote.prod` and `.env.remote.staging`.
