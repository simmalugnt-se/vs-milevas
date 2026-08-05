import { cache } from "react";
import { getPayloadClient } from "@/payload/get-payload";
import {
  isSchemaMismatchError,
  isUninitializedPayloadDatabaseError,
} from "@/utilities/payload-schema-error";

export type DbReadyResult =
  | { ready: true; mismatch: false }
  | { ready: false; mismatch: true }
  | { ready: false; mismatch: false };

/**
 * True when Payload's Postgres schema exists (at least the `users` table).
 * Cached per request via React `cache`.
 *
 * Returns `{ ready: false, mismatch: true }` when the schema is partially
 * present but incompatible (e.g. missing columns from an outdated migration).
 */
export const getPayloadDbReady = cache(async (): Promise<DbReadyResult> => {
  try {
    const payload = await getPayloadClient();
    await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    });
    return { ready: true, mismatch: false };
  } catch (error) {
    if (isSchemaMismatchError(error)) {
      return { ready: false, mismatch: true };
    }
    if (isUninitializedPayloadDatabaseError(error)) {
      return { ready: false, mismatch: false };
    }
    throw error;
  }
});
