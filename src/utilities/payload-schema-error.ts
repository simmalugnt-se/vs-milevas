/**
 * Tells apart the three ways the CMS database can be unusable, so the setup screens can say what to
 * do instead of showing a raw error:
 *
 * - `unreachable`: Postgres is not running, or the configured database URL points somewhere wrong.
 * - `not-migrated`: Postgres answers but has no Payload tables yet.
 * - `mismatch`: the tables are there but older than the code (a column or type is missing).
 */
export type DatabaseProblem = "unreachable" | "not-migrated" | "mismatch";

/** Postgres SQLSTATE codes and Node socket codes, by what they mean for setup. */
const CODES: Record<string, DatabaseProblem> = {
  ECONNREFUSED: "unreachable",
  ECONNRESET: "unreachable",
  ENOTFOUND: "unreachable",
  ETIMEDOUT: "unreachable",
  EPIPE: "unreachable",
  EAI_AGAIN: "unreachable",
  "3D000": "unreachable", // database does not exist
  "28P01": "unreachable", // password authentication failed
  "57P03": "unreachable", // cannot connect now (starting up)
  "42P01": "not-migrated", // undefined table
  "42703": "mismatch", // undefined column
  "42704": "mismatch", // undefined object, e.g. an enum type
};

/** For client error boundaries, where only `Error.message` survives. */
const MESSAGES: Array<[RegExp, DatabaseProblem]> = [
  [
    /cannot connect to postgres|econnrefused|connection refused|getaddrinfo|connection terminated|timeout expired|password authentication failed|database "[^"]+" does not exist/i,
    "unreachable",
  ],
  [/relation "[^"]+" does not exist/i, "not-migrated"],
  [/column "[^"]+" (of relation "[^"]+" )?does not exist|type "[^"]+" does not exist/i, "mismatch"],
];

export function classifyDatabaseErrorMessage(message: string): DatabaseProblem | null {
  for (const [pattern, problem] of MESSAGES) {
    if (pattern.test(message)) {
      return problem;
    }
  }
  return null;
}

/** Walks the error and its `cause` chain (drizzle wraps the Postgres error). */
export function classifyDatabaseError(error: unknown): DatabaseProblem | null {
  if (typeof error === "string") {
    return classifyDatabaseErrorMessage(error);
  }
  const seen = new Set<unknown>();
  let current: unknown = error;
  let fromMessage: DatabaseProblem | null = null;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && CODES[code]) {
      return CODES[code];
    }
    if (current instanceof Error) {
      fromMessage ??= classifyDatabaseErrorMessage(current.message);
    }
    current = (current as { cause?: unknown }).cause;
  }
  return fromMessage;
}

/** True when the database cannot be used yet for any of the reasons above. */
export function isUninitializedPayloadDatabaseError(error: unknown): boolean {
  return classifyDatabaseError(error) !== null;
}
