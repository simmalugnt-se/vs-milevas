# Payload website boilerplate

Next.js 16 + Payload 3 starter for a **content-managed marketing site** (localized pages, admin, R2-ready media).

## Included

- Localized frontend (`en`, `sv`) with CMS-driven **home** and **`/[slug]`** pages from the `pages` collection
- Payload admin at `/admin`, REST at `/api`, GraphQL at `/graphql`
- SEO plugin on `pages`, `images` and Mux `videos` collections, optional Cloudflare R2 for uploads
- Draftable `header` / `footer` globals with scheduled publishing
- Payload-managed redirects through `@payloadcms/plugin-redirects` (permanent, also for deeper paths),
  and one from the old address whenever a published page is published under a new slug
- Local Postgres 18 in Docker (the version new Neon projects get), one database per project
- Hero, rich text, media, gallery, card list, FAQ, call to action and columns blocks, with
  click-to-edit fields in Live Preview, and an optional announcement bar in the header
- The `@simmalugnt-se` plugins: visual editing (click-to-edit in Live Preview), the editor assistant
  (AI help in Admin) and content health (a dashboard widget and a work list of content issues). Each
  works without the others; see [Removing a plugin](#removing-a-plugin)
  - In Milevas only visual editing is on for now; content health and the editor assistant are
    commented out in `src/payload/plugins/index.ts`.

## Local setup

Requires Node 22+ and pnpm, plus Docker Desktop for a database on your own computer.

1. `pnpm install`
2. `pnpm setup`. A few questions: whether the database and uploaded files live on this computer
   (Docker) or in the cloud (Neon, optionally Cloudflare R2 for files), and whether to turn on the
   AI assistant, Mux and MCP. Then it saves `.env.local` and prepares the database. Later,
   `SERVICES=local` or `SERVICES=cloud` in `.env.local` switches between the two. See
   [the setup guide](./docs/setup.md).
3. `pnpm dev`, then open [http://localhost:3000/admin](http://localhost:3000/admin) and create the
   first user. On an empty site the first start adds a home page with example content.

Without questions, `pnpm setup:local` sets up the Docker database on its own: it creates
`.env.local` from `.env.example` (with generated secrets) if there is none, starts Postgres and runs
the migrations. Postgres listens on port 5434, or the next free port if another project uses it.

Each project gets its own Docker container and data volume, named after the project folder (set
`COMPOSE_PROJECT_NAME` in `.env.local` to choose the name). Use `pnpm db:local:up`, `db:local:down`
and `db:local:reset` rather than plain `docker compose`: they read `.env.local`, which plain
`docker compose` does not.

If the database is not running, has no tables yet or is older than the code, the site and Admin
say which, and what to run.

An empty site is seeded with a home page containing a hero, three cards, an FAQ, two columns of
text and a call to action, plus a test page linked from the first card and the call to action. Existing sites are left unchanged; add the new blocks in Admin
to try them there. The card list includes grouped internal/external links, and the FAQ uses native
accordions that can be opened with a mouse or keyboard, including in Live Preview.

To temporarily show only the Milevas logo on a lime background, set `MILEVAS_LANDING_ONLY=true` in the environment and restart or redeploy. Public page URLs redirect to `/`; `/admin` and API routes remain available. Set it to `false` or remove it to restore the site.

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

With the local Docker database running, `pnpm test:example-blocks` creates a separate temporary
database, applies the existing migrations and checks the seed, localized content, links and rendered
block markers. It drops its temporary database afterward. It finds this project's Postgres
container through Compose; set `EXAMPLE_BLOCKS_TEST_CONTAINER` to use another one.
`pnpm test:slug-redirects` does the same for the redirects made when a published page changes its
slug.

## Preview and revalidation

Draft preview uses `GET /[locale]/next/preview` with `PREVIEW_SECRET`. Set `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_SERVER_URL`) to the origin you open in the browser. Published `pages`, `header`, `footer`, and `redirects` changes trigger cache revalidation via Payload hooks.

## Removing a plugin

The three `@simmalugnt-se` plugins do not depend on each other: content health offers "Fix with the
assistant" only when the assistant is installed, and marks fields itself without visual editing.
To remove one, take it out of `src/payload/plugins/index.ts`, then:

- **Content health** — nothing else. It has no tables. Editors who saved their own dashboard layout
  see "Widget not found" in its place until they remove it in the dashboard's edit mode.
- **Visual editing** — removing the plugin is enough; the frontend markers then do nothing. To also
  uninstall the package, remove the `@simmalugnt-se/payload-visual-editing/frontend` helpers from the
  blocks in `src/payload/blocks/` and `VisualEditingPreview` from
  `src/components/cms/live-preview-listener.tsx`.
- **Editor assistant** — also remove `src/payload/plugins/assistant-model.ts`, the assistant question
  in `scripts/setup.mjs` and its keys in `.env.example`. Its audit and approval collections have
  tables, so create a migration that drops them (`pnpm db:migrate:create`) and regenerate the types
  (`pnpm generate:types`). To only turn the assistant off, answer no in `pnpm setup` instead: the
  plugin stays installed without a model and keeps its tables.

Then uninstall the package and run `pnpm generate:importmap`; `src/app/(payload)/importMap.js`
still imports the package's Admin components until it is regenerated, and the build fails without
it.

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

### Environment variables

Set these in Vercel for `Production` and `Preview` separately. Point Preview at its own Neon branch,
since every deploy runs migrations.

| Variable | Value |
| --- | --- |
| `APP_ENV` | `production` or `preview` |
| `SERVICES` | `cloud` |
| `PAYLOAD_SECRET`, `PREVIEW_SECRET` | random strings |
| `DATABASE_URL` | Neon's direct connection (the build needs it for migrations) |
| `DATABASE_URL_POOLED` | Neon's pooled connection |
| `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` | Neon Storage, as Neon shows them |
| `AI_PROVIDER`, `AI_MODEL` | `gateway` and a gateway model that reads images. No `AI_GATEWAY_API_KEY` is needed on Vercel, but the team needs AI Gateway credits. |
| `NEXT_PUBLIC_SITE_URL` | optional, the public origin |
| `ENABLE_SEARCH_INDEXING` | optional, opt in to indexing |
| `PAYLOAD_MUX_ENABLED`, `PAYLOAD_MCP_ENABLED` | `false` when you don't use them |

Content health needs no variables of its own.

### Moving local content to the cloud

Upload the local `media/` folder to the bucket, using the cloud storage values in `.env.local`. This
needs the AWS CLI. Payload keeps the files in the bucket's root.

```bash
pnpm assets:upload
```

`pnpm assets:sync` only copies between buckets.

## Debugging the editor assistant

After installing a plugin release that supports debug traces, set `DEBUG_ASSISTANT=true` in the
Vercel environment you test and redeploy. Run your tests in Admin, then download the logs locally:

```sh
pnpm assistant:logs --deployment https://your-deployment.vercel.app --since 1h
```

The Vercel CLI must be installed and signed in (`vercel login`). Use the specific deployment URL
or ID; without one the command uses the linked Vercel project across branches. The export keeps
raw request logs plus reconstructed assistant JSONL in `.assistant-debug/` (ignored by Git).
Each run has a `traceId`, ordered events, conversation/context, tool inputs/results, usage, model
text and provider-exposed reasoning. Use `approvalId` to match a proposal to its later decision.
Reasoning only appears when the provider returns it. Image bytes use metadata/hash entries.

Export promptly: [Vercel runtime log retention](https://vercel.com/docs/logs/runtime) depends on
the plan. Server log budgets can truncate very large runs; the export marks missing chunks and
budget truncation. `--since`, `--until`, `--limit`, `--environment`, `--project` and `--scope`
control the [Vercel CLI export](https://vercel.com/docs/cli/logs). The default fetches at most
1000 matching requests from the last hour and reports reaching that limit. A host log drain is
needed for automatic retention beyond Vercel's window.

For local testing, add these server-only values to `.env.local` and restart dev:

```dotenv
DEBUG_ASSISTANT=true
DEBUG_ASSISTANT_LOG_DIR=.assistant-debug
```

The local JSONL files contain complete diagnostic text/tool data even when the server log budget
is reached. Debugging is off by default and intentionally records conversation and CMS values;
keep the traces out of Git. Leave `DEBUG_ASSISTANT_LOG_DIR` unset on Vercel. A previously downloaded
raw export can be reconstructed offline with `pnpm assistant:logs --input path/to/raw.jsonl`.

The assistant also accepts reference images via **Add images**, drag-and-drop and clipboard paste.
Use an image-capable model; the default Gateway model supports this. Attachments supply chat
context and do not become CMS uploads. These changes require editor-assistant 0.13.0 or later.
