import { Link } from "@/i18n/navigation";
import { getPayloadDbReady } from "@/payload/data/db-ready";

const STEPS = (
  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
    <li>
      Ensure Postgres is running, for example:{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        pnpm db:local:up
      </code>
    </li>
    <li>
      Apply Payload migrations:{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        pnpm setup:local
      </code>{" "}
      or{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        pnpm db:migrate
      </code>
    </li>
    <li>
      Reload this page. On the first app start after migrations, Payload seeds published{" "}
      <strong>home</strong> and <strong>test</strong> pages (hero only) and adds a{" "}
      <strong>Test</strong> link in the header.
    </li>
  </ol>
);

const SCHEMA_MISMATCH_STEPS = (
  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
    <li>
      <strong>Reset</strong> the local database:{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        pnpm db:local:reset
      </code>
    </li>
    <li>
      Re-apply migrations:{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        pnpm setup:local
      </code>
    </li>
    <li>
      If this keeps happening, the baseline migration may be out of sync with the code. Ask a
      maintainer to regenerate it with:{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-900">
        rm src/payload/migrations/20*.ts src/payload/migrations/20*.json && pnpm db:local:reset &&
        pnpm exec payload migrate:create && pnpm db:migrate
      </code>
    </li>
  </ol>
);

/** Sticky banner when the CMS database has no tables yet. */
export async function PayloadDatabaseSetupBanner() {
  if ((await getPayloadDbReady()).ready) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">
            Database schema is not initialized yet
          </p>
          <p className="mt-1 text-sm text-amber-950/85">
            Payload tables are missing or out of date. Run migrations, then refresh.
          </p>
        </div>
        <div className="shrink-0 text-xs text-amber-900/90">
          <code className="block border border-amber-200 bg-amber-100 px-3 py-2 font-mono">
            pnpm setup:local
          </code>
        </div>
      </div>
    </div>
  );
}

/** Main-column message when a CMS route cannot load until migrations run. */
export function PayloadDatabaseSetupMain() {
  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-site-accent">Setup</p>
      <div className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          Initialize the CMS database
        </h1>
        <p className="text-base leading-7 text-neutral-600">
          This page reads from Payload in Postgres. Your database is reachable but the Payload
          tables do not exist yet.
        </p>
      </div>
      {STEPS}
      <p className="text-sm text-stone-500">
        After migrations, start or reload the dev server once so the default pages can be created,
        then open{" "}
        <Link href="/admin" className="font-medium text-stone-800 underline">
          the admin
        </Link>{" "}
        to register the first user.
      </p>
    </section>
  );
}

/** Main-column message for schema mismatch (tables exist but wrong columns). */
export function PayloadSchemaMismatchMain() {
  return (
    <section className="surface flex flex-1 flex-col items-start justify-center gap-5 px-6 py-10 sm:px-10">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-red-600">
        Schema Mismatch
      </p>
      <div className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          Database schema is out of date
        </h1>
        <p className="text-base leading-7 text-neutral-600">
          The database was initialized with an older or incompatible migration. A column or table
          that the current code expects is missing.
        </p>
      </div>
      {SCHEMA_MISMATCH_STEPS}
      <p className="text-sm text-stone-500">
        After resetting, re-run{" "}
        <code className="rounded bg-stone-100 px-1 py-0.5 font-mono">pnpm setup:local</code> and
        refresh this page.
      </p>
    </section>
  );
}

/** Admin UI when Payload RootLayout is skipped (no full admin shell). */
export function PayloadAdminDatabaseSetupContent() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">Payload CMS</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
        Run database migrations first
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        The admin UI needs Payload tables in Postgres. Start the database, then apply migrations
        from the project root.
      </p>
      <div className="surface mt-6 p-4 text-sm text-neutral-800">{STEPS}</div>
      <p className="mt-6 text-xs text-stone-500">
        After <code className="rounded bg-stone-100 px-1 py-0.5 font-mono">pnpm db:migrate</code>{" "}
        completes, reload this page to open the admin.
      </p>
    </div>
  );
}
