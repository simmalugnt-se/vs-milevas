"use server";

import { headers } from "next/headers";
import { AuthenticationError, LockedAuth, ValidationError } from "payload";
import { takeRateLimit } from "@/features/configurator/rate-limit";
import { getPayloadClient } from "@/payload/get-payload";
import { sendApplicationEmail, sendResetEmail, siteOrigin } from "./emails";
import type { DealerSession } from "./pricing";
import { currentDealerSession, endDealerSession, startDealerSession } from "./session";

export type DealerFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"company" | "name" | "email" | "password", string>>;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINUTE = 60 * 1000;

const text = (formData: FormData, key: string, maxLength = 320) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
};

/** The password as typed: spaces count. */
const password = (formData: FormData) => {
  const value = formData.get("password");
  return typeof value === "string" ? value.slice(0, 200) : "";
};

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const TOO_MANY = "För många försök. Vänta en stund och försök igen.";

/** The signed-in dealer and their discount, for prices in the browser; null when signed out. */
export async function getDealerSession(): Promise<DealerSession | null> {
  return currentDealerSession();
}

export async function loginDealer(
  _previous: DealerFormState,
  formData: FormData,
): Promise<DealerFormState> {
  const email = text(formData, "email").toLowerCase();
  const secret = password(formData);
  const fieldErrors: DealerFormState["fieldErrors"] = {};
  if (!emailPattern.test(email)) fieldErrors.email = "Ange en giltig e-postadress.";
  if (!secret) fieldErrors.password = "Ange ditt lösenord.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const payload = await getPayloadClient();
  if (!(await takeRateLimit(payload, `dealer-login:${await clientIp()}`, 30, 10 * MINUTE))) {
    return { ok: false, message: TOO_MANY };
  }
  try {
    // Payload checks the password and locks the account after five wrong ones; its token is not
    // used, the site keeps its own session.
    const { user } = await payload.login({
      collection: "dealers",
      data: { email, password: secret },
      depth: 0,
    });
    if (!user) return { ok: false, message: "E-postadressen eller lösenordet stämmer inte." };
    if (user.status === "pending") {
      return { ok: false, message: "Din ansökan väntar fortfarande på godkännande." };
    }
    if (user.status !== "accepted") {
      return { ok: false, message: "Kontot har inte tillgång. Kontakta oss om du har frågor." };
    }
    await startDealerSession(user.id);
    return { ok: true };
  } catch (error) {
    if (error instanceof LockedAuth) {
      return { ok: false, message: "För många felaktiga försök. Försök igen om tio minuter." };
    }
    if (error instanceof AuthenticationError) {
      return { ok: false, message: "E-postadressen eller lösenordet stämmer inte." };
    }
    throw error;
  }
}

export async function applyForDealerAccount(
  _previous: DealerFormState,
  formData: FormData,
): Promise<DealerFormState> {
  // A field people never see; a bot fills it.
  if (text(formData, "website")) return { ok: true };
  const company = text(formData, "company", 200);
  const name = text(formData, "name", 200);
  const email = text(formData, "email").toLowerCase();
  const secret = password(formData);
  const fieldErrors: DealerFormState["fieldErrors"] = {};
  if (!company) fieldErrors.company = "Ange företagsnamn.";
  if (!name) fieldErrors.name = "Ange ditt namn.";
  if (!emailPattern.test(email)) fieldErrors.email = "Ange en giltig e-postadress.";
  if (secret.length < 8) fieldErrors.password = "Lösenordet behöver minst 8 tecken.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const payload = await getPayloadClient();
  if (!(await takeRateLimit(payload, `dealer-apply:${await clientIp()}`, 5, 60 * MINUTE))) {
    return { ok: false, message: TOO_MANY };
  }
  try {
    const dealer = await payload.create({
      collection: "dealers",
      overrideAccess: true,
      data: { email, password: secret, company, name, status: "pending" },
    });
    await sendApplicationEmail(siteOrigin(await headers()), {
      id: dealer.id,
      email,
      company,
      name,
    }).catch((error) => payload.logger.error({ err: error }, "Dealer application email failed"));
    return { ok: true };
  } catch (error) {
    if (error instanceof ValidationError && error.data.errors.some((e) => e.path === "email")) {
      return {
        ok: false,
        fieldErrors: {
          email: "Det finns redan ett konto med adressen. Logga in eller återställ lösenordet.",
        },
      };
    }
    throw error;
  }
}

export async function requestDealerPasswordReset(
  _previous: DealerFormState,
  formData: FormData,
): Promise<DealerFormState> {
  const email = text(formData, "email").toLowerCase();
  if (!emailPattern.test(email)) {
    return { ok: false, fieldErrors: { email: "Ange en giltig e-postadress." } };
  }
  const payload = await getPayloadClient();
  const allowed =
    (await takeRateLimit(payload, `dealer-reset-ip:${await clientIp()}`, 10, 60 * MINUTE)) &&
    (await takeRateLimit(payload, `dealer-reset-email:${email}`, 3, 60 * MINUTE));
  if (!allowed) return { ok: false, message: TOO_MANY };

  // Payload makes the token; the site sends the email, with a link to the site rather than Admin.
  const token = await payload.forgotPassword({
    collection: "dealers",
    data: { email },
    disableEmail: true,
  });
  if (token) await sendResetEmail(siteOrigin(await headers()), email, token);
  // The same answer whether or not there is an account, so the form does not reveal who has one.
  return { ok: true };
}

export async function resetDealerPassword(
  _previous: DealerFormState,
  formData: FormData,
): Promise<DealerFormState> {
  const token = text(formData, "token", 200);
  const secret = password(formData);
  if (secret.length < 8) {
    return { ok: false, fieldErrors: { password: "Lösenordet behöver minst 8 tecken." } };
  }
  const payload = await getPayloadClient();
  try {
    const { user } = await payload.resetPassword({
      collection: "dealers",
      data: { token, password: secret },
      overrideAccess: true,
    });
    if (user?.status === "accepted" && typeof user.id === "string") {
      await startDealerSession(user.id);
      return { ok: true };
    }
    return { ok: true, message: "Lösenordet är bytt. Kontot väntar på godkännande." };
  } catch {
    return {
      ok: false,
      message: "Länken gäller inte längre. Be om en ny med Jag har glömt mitt lösenord.",
    };
  }
}

export async function logoutDealer(): Promise<void> {
  await endDealerSession();
}
