import net from "node:net";
import { cache } from "react";
import { getPayloadClient } from "@/payload/get-payload";
import { classifyDatabaseError, type DatabaseProblem } from "@/utilities/payload-schema-error";
import { databaseUrls } from "@/utilities/services.mjs";

export type DbReadyResult = { ready: true } | { ready: false; problem: DatabaseProblem };

/** Set once Payload has read from the database; after that the socket check is skipped. */
let connected = false;

/**
 * Whether Payload can read from Postgres, and if not, why (see `DatabaseProblem`). Reading covers
 * all three: the connection, the tables and their columns. `users` is in the first migration;
 * `images` is read too because upload collections gain columns from plugins (storage) in later
 * ones, which a site otherwise only notices when an image fails to load. Cached per request.
 */
export const getPayloadDbReady = cache(async (): Promise<DbReadyResult> => {
  if (!connected && !(await databaseAnswers())) {
    return { ready: false, problem: "unreachable" };
  }
  try {
    const payload = await getPayloadClient();
    await Promise.all(
      (["users", "images"] as const).map((collection) =>
        payload.find({ collection, depth: 0, limit: 1, overrideAccess: true, pagination: false }),
      ),
    );
    connected = true;
    return { ready: true };
  } catch (error) {
    const problem = classifyDatabaseError(error);
    if (problem) {
      return { ready: false, problem };
    }
    throw error;
  }
});

/**
 * Whether anything answers on the database's host and port. Checked before Payload first connects:
 * when Postgres is down, starting Payload anyway takes seconds, logs the failure and leaves an
 * unhandled rejection behind in Next's dev overlay. Unparsable URLs are left to Payload.
 */
async function databaseAnswers(timeoutMs = 1500): Promise<boolean> {
  const url = databaseUrls().runtime;
  let host: string;
  let port: number;
  try {
    const parsed = new URL(url ?? "");
    host = parsed.hostname;
    port = Number(parsed.port) || 5432;
  } catch {
    return true;
  }
  if (!host) {
    return true;
  }
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (answers: boolean) => {
      socket.destroy();
      resolve(answers);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}
