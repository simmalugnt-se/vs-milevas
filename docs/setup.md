# Setup guide

After `pnpm install`, run `pnpm setup`. It asks a few questions, shows a summary, and only when
you confirm saves the answers in `.env.local` and prepares the database. Stop with Ctrl+C at any
point before that and your choices are not saved. (For the cloud, the guide asks you to paste
values into `.env.local` yourself; it creates the file first if there is none.) Run it again later
to change a choice: every question starts from what is saved, and keys are kept when you press Enter.

It does not create accounts or deploy anything, and it never resets or copies a database. When
`.env.local` already exists it keeps the previous version in `.env.local.setup-backup` (ignored by
git). Delete that file once you no longer need the old values.

For a non-interactive local setup, `pnpm setup:local` still works on its own.

## This computer or the cloud

One line in `.env.local` decides where the database and uploaded files are:

```bash
SERVICES=local   # Postgres in this project's Docker container, files in the project folder
SERVICES=cloud   # the Neon project (and R2 for files, if you chose it)
```

Switch whenever you like and restart `pnpm dev`; the log says which database and storage it uses.
The two are separate: pages and images made in one do not show up in the other. Each database
needs its tables once, so after switching to a database that has none, run `pnpm db:migrate`. To
move content between them, use the `pnpm db:copy*` scripts.

### On this computer

Needs Docker Desktop. Nothing else to fill in: the connection is derived from `POSTGRES_HOST_PORT`,
5434 or the next free port if another project already uses it. Local files suit trying things out;
a live site on hosting without a permanent disk needs cloud storage.

### Neon

Create a project in the [Neon console](https://console.neon.tech) with **Postgres** and
**Storage**, or open the one you have, and pick a development branch rather than your live site's.
Set the bucket's access to **public read**: images on the site must be visible to everyone. Neon then
shows a block of environment variables; paste it at the end of `.env.local` as it is:

```bash
DATABASE_URL="…"          # direct connection, used for migrations
DATABASE_URL_POOLED="…"   # pooled connection, used by the site
AWS_ENDPOINT_URL_S3="…"
AWS_ACCESS_KEY_ID="…"
AWS_SECRET_ACCESS_KEY="…"
AWS_REGION="…"
S3_BUCKET="…"
```

The guide checks the values and creates the tables. Files are served from the endpoint followed by
the bucket name. Uploads go straight from the browser to the bucket, past Vercel's ~4.5 MB request
limit, so the bucket needs a CORS rule for each address Admin runs on (`PutBucketCors` through any S3
tool; the rule is the same as R2's below, with `https://*.vercel.app` for preview deployments). See
[Neon storage](https://neon.com/docs/storage/get-started),
[bucket access](https://neon.com/docs/storage/buckets) and
[S3 compatibility](https://neon.com/docs/storage/s3-compatibility).

### Neon and Cloudflare R2

The database comes from Neon as above (`DATABASE_URL` and `DATABASE_URL_POOLED`). For files, in
Cloudflare R2:

1. Create a bucket and turn on public access: an `r2.dev` address for trying things out, a custom
   domain for a live site.
2. Create an API token with **Object Read & Write** for that bucket.
3. Add the same names Neon uses, plus the public address:

   ```bash
   AWS_ENDPOINT_URL_S3=https://<account-id>.r2.cloudflarestorage.com
   AWS_ACCESS_KEY_ID=…
   AWS_SECRET_ACCESS_KEY=…
   AWS_REGION=auto
   S3_BUCKET=<bucket name>
   S3_PUBLIC_URL=https://pub-….r2.dev
   ```

Uploads go straight from the browser to R2, so the bucket needs a CORS rule for your site's address:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Add your live site's address when you deploy. See
[R2 tokens](https://developers.cloudflare.com/r2/api/tokens/),
[public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/) and
[CORS](https://developers.cloudflare.com/r2/buckets/cors/).

Both cloud options make uploaded files public, documents included. Do not use them for private files.
Switching storage does not move files that are already uploaded.

### Deploying

On Vercel, add `SERVICES=cloud` and the cloud values as environment variables, per environment:
Production gets the production database, Preview a development branch. Local development uses
Docker or a Neon branch of its own, never the production branch: migrations and test edits would
land on the live site.

To copy databases and files between environments from this computer (`pnpm db:copy*`,
`pnpm assets:sync*`), keep each environment's values in a file of its own, with the same names as on
Vercel: `.env.remote.prod` and `.env.remote.staging`. Paste Neon's block for that branch, plus
`SERVICES=cloud` and `S3_BUCKET`, and paste the whole file into Vercel for that environment. The app never reads these files, and Next does not load them (unlike
`.env.production`, which `next build` would use). See
[the database workflow](./readme/DATABASE_WORKFLOW.md).

### Projects from before SERVICES

Without `SERVICES`, the older names are still read: `DATABASE_URI`, `DATABASE_URI_DIRECT` and
`DATABASE_SSL` for the database, and `STORAGE_PROVIDER` with `R2_*` for files. Running `pnpm setup`
moves a project over to `SERVICES`.

## Optional features

- **AI assistant:** helps editors write and change content. It reaches its model through
  **Vercel AI Gateway**: one key for models from many companies. The model must read images, since
  the assistant will write alt texts, so the guide suggests GPT-6 Luna, which does
  the job at the lowest cost. Any other model from [the model list](https://vercel.com/ai-gateway/models)
  that reads images can be typed in instead.
  Create the key in the Vercel dashboard under AI Gateway. A site deployed on Vercel signs in to the
  gateway by itself and needs no key.

  To switch model later, change `AI_MODEL` in `.env.local` and restart. Turning the assistant off
  keeps the keys, and the plugin stays installed so the database tables stay the same.

  Projects set up with DeepSeek (`AI_PROVIDER=deepseek`, or a `deepseek/` model through the gateway)
  keep working for text, but DeepSeek cannot read images, and the server warns about it at start.
  Running `pnpm setup` again moves the project to a gateway model that reads images.
- **Mux:** video for the `videos` collection: uploads go from Admin straight to Mux, and the site
  plays them. Needs an access token from the Mux dashboard (Settings > Access Tokens). Turning it off
  stops uploads; the collection and saved videos stay. Optionally, add a webhook in Mux (Settings >
  Webhooks) to `<site>/api/videos/mux-webhook` and put its signing secret in
  `MUX_WEBHOOK_SECRET`, so videos update in Payload when Mux finishes or deletes them.
- **MCP:** lets AI tools such as Claude read and edit content. You create a key for each tool in
  Admin and choose what it may do. Turning it off hides the keys and closes the endpoint.

## What is saved

| Choice     | Variables                                                                  |
| ---------- | -------------------------------------------------------------------------- |
| Database and files | `SERVICES`, and for the cloud the values you paste (see above)   |
| Assistant  | `AI_PROVIDER`, `AI_MODEL`, `AI_GATEWAY_API_KEY`                             |
| Mux        | `PAYLOAD_MUX_ENABLED`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, and `MUX_WEBHOOK_SECRET` by hand |
| MCP        | `PAYLOAD_MCP_ENABLED`                                                      |

Missing placeholder secrets (`PAYLOAD_SECRET`, `PREVIEW_SECRET`) are generated; real ones are kept.
The database schema is the same whichever options you pick, so changing them never needs a migration.

After setup, run `pnpm dev`, open http://localhost:3000/admin and create the first user. On an empty
site the first start adds a home page with example content.
