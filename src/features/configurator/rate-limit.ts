import type { Payload } from "payload";

/**
 * Takes one use of `key` if fewer than `limit` were taken in the last `windowMs`, kept in Payload's
 * key-value store so every server instance counts the same uses. Two requests at the same moment
 * can both pass; the limit is against floods, not exact.
 */
export async function takeRateLimit(
  payload: Payload,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<boolean> {
  const stored = await payload.kv.get<number[]>(`rate-limit:${key}`);
  const recent = (Array.isArray(stored) ? stored : []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) return false;
  await payload.kv.set(`rate-limit:${key}`, [...recent, now]);
  return true;
}
