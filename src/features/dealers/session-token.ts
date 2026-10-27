import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A dealer's session on the site: the dealer's id and when it ends, signed with a key from
 * `PAYLOAD_SECRET`. Payload never reads it (its own cookie is `payload-token`), so a signed-in
 * dealer is never a user to Payload's API or Admin. Kept free of Next and Payload for the tests.
 */
export const DEALER_COOKIE = "milevas-dealer";
export const DEALER_SESSION_SECONDS = 60 * 60 * 24 * 7;

const signature = (secret: string, body: string) =>
  createHmac("sha256", `${secret}:dealer-session`).update(body).digest("base64url");

export function signDealerSession(
  secret: string,
  dealerId: string,
  now = Date.now(),
  seconds = DEALER_SESSION_SECONDS,
): string {
  const body = `${dealerId}.${Math.floor(now / 1000) + seconds}`;
  return `${body}.${signature(secret, body)}`;
}

/** The dealer's id, or null when the value is not one we signed or has run out. */
export function readDealerSession(
  secret: string,
  value: string | undefined,
  now = Date.now(),
): string | null {
  const parts = value?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [id, expires, given] = parts;
  const expected = Buffer.from(signature(secret, `${id}.${expires}`));
  const actual = Buffer.from(given);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (!id || Number(expires) * 1000 <= now) return null;
  return id;
}
