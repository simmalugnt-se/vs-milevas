import { cookies } from "next/headers";
import { getPayloadClient } from "@/payload/get-payload";
import type { Dealer } from "@/payload-types";
import type { DealerSession } from "./pricing";
import { DEALER_HINT_COOKIE } from "./session-hint";
import {
  DEALER_COOKIE,
  DEALER_SESSION_SECONDS,
  readDealerSession,
  signDealerSession,
} from "./session-token";

const secret = () => {
  const value = process.env.PAYLOAD_SECRET;
  if (!value) throw new Error("PAYLOAD_SECRET is not set.");
  return value;
};

const cookieOptions = {
  maxAge: DEALER_SESSION_SECONDS,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

export async function startDealerSession(dealerId: string) {
  const store = await cookies();
  store.set(DEALER_COOKIE, signDealerSession(secret(), dealerId), {
    ...cookieOptions,
    httpOnly: true,
  });
  store.set(DEALER_HINT_COOKIE, "1", cookieOptions);
}

export async function endDealerSession() {
  const store = await cookies();
  store.delete(DEALER_COOKIE);
  store.delete(DEALER_HINT_COOKIE);
}

/** The dealer discount from the configurator settings; editors only, so read past access. */
export async function dealerDiscountPercent(): Promise<number> {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({
    slug: "configurator-settings",
    depth: 0,
    overrideAccess: true,
  });
  return settings?.dealerDiscountPercent ?? 0;
}

/**
 * The signed-in dealer, read again on every call so a dealer set back to pending or rejected, or
 * deleted, is signed out at once.
 */
export async function currentDealer(): Promise<Dealer | null> {
  const id = readDealerSession(secret(), (await cookies()).get(DEALER_COOKIE)?.value);
  if (!id) return null;
  const payload = await getPayloadClient();
  const dealer = await payload
    .findByID({ collection: "dealers", id, depth: 0, overrideAccess: true })
    .catch(() => null);
  return dealer?.status === "accepted" ? dealer : null;
}

export async function currentDealerSession(): Promise<DealerSession | null> {
  const dealer = await currentDealer();
  if (!dealer) return null;
  return {
    email: dealer.email,
    company: dealer.company,
    name: dealer.name || undefined,
    discountPercent: await dealerDiscountPercent(),
  };
}
