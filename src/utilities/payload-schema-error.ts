/**
 * Detects Postgres "schema not migrated yet" and "Postgres not reachable" errors.
 * Used to show setup instructions instead of a raw Next.js error overlay.
 */
function errorChain(error: unknown): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    out.push(current);
    const next = (current as { cause?: unknown }).cause;
    if (next === undefined) break;
    current = next;
  }
  return out;
}

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EPIPE",
]);

const SCHEMA_MISMATCH_MESSAGES = [
  "column",
  "does not exist",
  "does not match",
  "relation does not exist",
];

/** For client `error.tsx` where only `Error.message` is available. */
export function isUninitializedPayloadDatabaseErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes("cannot connect to postgres")) return true;
  if (m.includes("connect econnrefused")) return true;
  if (m.includes("connection refused")) return true;
  if (!m.includes("does not exist")) return false;
  if (m.includes("relation") || m.includes("table ")) return true;
  return m.includes("failed query");
}

/** For client `error.tsx` to detect schema mismatch from `Error.message` alone. */
export function isSchemaMismatchErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  return SCHEMA_MISMATCH_MESSAGES.every((phrase) => m.includes(phrase));
}

/**
 * Detects schema mismatch errors (e.g. column missing, type mismatch).
 * These mean the DB was initialized with an older or incompatible migration.
 */
export function isSchemaMismatchError(error: unknown): boolean {
  if (typeof error === "string") {
    const m = error.toLowerCase();
    return SCHEMA_MISMATCH_MESSAGES.every((phrase) => m.includes(phrase));
  }

  for (const item of errorChain(error)) {
    if (item instanceof Error) {
      const m = item.message.toLowerCase();
      if (SCHEMA_MISMATCH_MESSAGES.every((phrase) => m.includes(phrase))) {
        return true;
      }
    }
  }

  return false;
}

export function isUninitializedPayloadDatabaseError(error: unknown): boolean {
  if (typeof error === "string") {
    return isUninitializedPayloadDatabaseErrorMessage(error);
  }

  for (const item of errorChain(error)) {
    if (item && typeof item === "object" && "code" in item) {
      const code = (item as { code?: string }).code;
      if (code === "42P01") return true;
      if (code === "42703") return true; // undefined_column
      if (typeof code === "string" && CONNECTION_ERROR_CODES.has(code)) return true;
    }
    if (item instanceof Error) {
      if (isUninitializedPayloadDatabaseErrorMessage(item.message)) return true;
    }
  }

  return false;
}
