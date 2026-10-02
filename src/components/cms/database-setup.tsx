import type { ReactNode } from "react";
import type { DatabaseProblem } from "@/utilities/payload-schema-error";
import styles from "./database-setup.module.css";

/**
 * What to do when the CMS database cannot be used, one screen per problem. Developer facing, so
 * English only. Styled by its own CSS module rather than the site's Tailwind, because Admin shows
 * it without the site's styles. Imports nothing server-only, so client error boundaries can use it.
 */
const CONTENT: Record<
  DatabaseProblem,
  { label: string; title: string; description: ReactNode; steps: ReactNode[] }
> = {
  unreachable: {
    label: "Database not reachable",
    title: "Start the database",
    description: (
      <>
        Payload could not connect to Postgres. With <Code>SERVICES=local</Code> that usually means
        Docker is not running; with <Code>SERVICES=cloud</Code>, check <Code>DATABASE_URL</Code> in{" "}
        <Code>.env.local</Code>.
      </>
    ),
    steps: [
      <>Start Docker Desktop.</>,
      <>
        Start the local database with <Code>pnpm db:local:up</Code>, or run{" "}
        <Code>pnpm setup:local</Code> the first time: it also creates the tables.
      </>,
      <>Reload this page.</>,
    ],
  },
  "not-migrated": {
    label: "Database not set up",
    title: "Create the tables",
    description: <>Postgres is running but has no Payload tables yet.</>,
    steps: [
      <>
        Run <Code>pnpm db:migrate</Code>. It creates the tables in the database{" "}
        <Code>SERVICES</Code> points at. The first time, <Code>pnpm setup</Code> does this for you.
      </>,
      <>
        Reload this page. The first start after that creates the start page, and Admin asks you to
        create the first user.
      </>,
    ],
  },
  mismatch: {
    label: "Database out of date",
    title: "Run the new migrations",
    description: (
      <>
        The tables are older than the code: a column or type the code expects is missing, usually
        after pulling changes that came with a migration.
      </>
    ),
    steps: [
      <>
        Run <Code>pnpm db:migrate</Code>.
      </>,
      <>
        If a local database still does not match, start it over with{" "}
        <Code>pnpm db:local:reset</Code> and <Code>pnpm setup:local</Code>. That deletes its data.
      </>,
      <>Reload this page.</>,
    ],
  },
};

export function DatabaseSetup({
  problem,
  onRetry,
}: {
  problem: DatabaseProblem;
  /** Client error boundaries pass their reset; elsewhere a reload link is shown. */
  onRetry?: () => void;
}) {
  const content = CONTENT[problem];
  return (
    <section className={styles.panel} aria-labelledby="database-setup-title">
      <p className={styles.label}>{content.label}</p>
      <h1 className={styles.title} id="database-setup-title">
        {content.title}
      </h1>
      <p className={styles.description}>{content.description}</p>
      <ol className={styles.steps}>
        {content.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      {onRetry ? (
        <button className={styles.action} onClick={onRetry} type="button">
          Try again
        </button>
      ) : (
        <a className={styles.action} href="">
          Reload
        </a>
      )}
    </section>
  );
}

/** Full page for Admin, which renders without Payload's layout while the database is unusable. */
export function DatabaseSetupPage({ problem }: { problem: DatabaseProblem }) {
  return (
    <div className={styles.page}>
      <p className={styles.product}>Payload CMS</p>
      <DatabaseSetup problem={problem} />
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}
