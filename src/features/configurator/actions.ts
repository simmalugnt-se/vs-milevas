"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import type { TypedLocale } from "payload";
import { getPayloadClient } from "@/payload/get-payload";
import { getConfiguratorCatalog } from "./data";
import { buildQuote } from "./engine";
import { takeRateLimit } from "./rate-limit";
import { sendConfiguratorRequestEmails, sendQuoteCopyEmail } from "./request-emails";
import type {
  ConfiguratorActionState,
  ConfiguratorRequestSnapshot,
  QuoteCopyState,
  SelectionState,
} from "./types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const organizationNumberPattern = /^\d{6}-?\d{4}$/;

function textValue(formData: FormData, key: string, maxLength = 500) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function submittedFormValues(formData: FormData) {
  return {
    company: textValue(formData, "company", 200),
    organizationNumber: textValue(formData, "organizationNumber", 20),
    name: textValue(formData, "name", 200),
    email: textValue(formData, "email", 320),
    phone: textValue(formData, "phone", 100),
    message: textValue(formData, "message", 3000),
    callPreference:
      textValue(formData, "callPreference", 20) === "specific"
        ? ("specific" as const)
        : ("asap" as const),
    preferredTime: textValue(formData, "preferredTime", 200),
  };
}

function parseSelections(value: string): SelectionState | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const selections: SelectionState = {};
    for (const [groupKey, optionKeys] of Object.entries(parsed)) {
      if (!/^[a-z0-9-]+$/.test(groupKey) || !Array.isArray(optionKeys)) {
        return null;
      }
      const validKeys = optionKeys.filter(
        (item): item is string => typeof item === "string" && /^[a-z0-9-]+$/.test(item),
      );
      selections[groupKey] = [...new Set(validKeys)];
    }
    return selections;
  } catch {
    return null;
  }
}

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `MVS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function validateBaseForm(formData: FormData) {
  const locale = textValue(formData, "locale", 2) === "sv" ? "sv" : "en";
  const familyKey = textValue(formData, "familyKey", 100);
  const financingKey = textValue(formData, "financingKey", 100);
  const selections = parseSelections(textValue(formData, "selections", 10000));
  const submissionKey = textValue(formData, "submissionKey", 100);
  const serviceAgreement = textValue(formData, "serviceAgreement", 1) === "1";

  if (!familyKey || !financingKey || !selections || !submissionKey) {
    return null;
  }
  return {
    locale: locale as TypedLocale,
    familyKey,
    financingKey,
    selections,
    serviceAgreement,
    submissionKey,
  };
}

async function existingRequest(idempotencyKey: string) {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "configurator-requests",
    overrideAccess: true,
    limit: 1,
    where: { idempotencyKey: { equals: idempotencyKey } },
  });
  return existing.docs[0] ?? null;
}

async function submitRequest(
  formData: FormData,
  requestType: "order" | "call",
): Promise<ConfiguratorActionState> {
  if (textValue(formData, "website", 200)) {
    return { ok: false, message: "Förfrågan kunde inte skickas." };
  }

  const formValues = submittedFormValues(formData);
  const base = validateBaseForm(formData);
  if (!base) {
    return {
      ok: false,
      formValues,
      message: "Konfigurationen är ofullständig eller inte längre giltig.",
    };
  }

  const idempotencyKey = `${requestType}:${base.submissionKey}`;
  const existing = await existingRequest(idempotencyKey);
  if (existing) {
    return { ok: true, reference: existing.reference };
  }

  const catalog = await getConfiguratorCatalog(base.locale, false);
  const quote = buildQuote(
    catalog,
    base.familyKey,
    base.selections,
    base.financingKey,
    base.serviceAgreement,
    // "Boka samtal" is on every step, so a call carries what is chosen so far.
    { allowIncomplete: requestType === "call" },
  );
  if (!quote) {
    return { ok: false, message: "Konfigurationen är ofullständig eller inte längre giltig." };
  }

  const { name, phone, company, organizationNumber, email, preferredTime } = formValues;
  const fieldErrors: Record<string, string> = {};

  // Figma's forms ask for a name only in the call, and there it is optional.
  if (phone.length < 6) fieldErrors.phone = "Ange ett giltigt telefonnummer.";
  if (requestType === "order" && !company) fieldErrors.company = "Ange företagsnamn.";
  if (requestType === "order" && !organizationNumberPattern.test(organizationNumber)) {
    fieldErrors.organizationNumber = "Ange organisationsnummer med tio siffror.";
  }
  if (requestType === "order" && !emailPattern.test(email)) {
    fieldErrors.email = "Ange en giltig e-postadress.";
  }
  if (requestType === "call" && email && !emailPattern.test(email)) {
    fieldErrors.email = "Ange en giltig e-postadress.";
  }

  // A chosen time means a specific call; without one, as soon as possible.
  const callPreference = preferredTime ? ("specific" as const) : ("asap" as const);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
      formValues,
      message: "Kontrollera de markerade fälten.",
    };
  }

  const snapshot: ConfiguratorRequestSnapshot = {
    createdAt: new Date().toISOString(),
    locale: base.locale,
    quote,
  };
  const reference = createReference();
  const requestHeaders = await headers();
  const sourceUrl = textValue(formData, "sourceUrl", 2048) || requestHeaders.get("referer") || "";
  const payload = await getPayloadClient();
  let request;
  try {
    request = await payload.create({
      collection: "configurator-requests",
      overrideAccess: true,
      data: {
        reference,
        idempotencyKey,
        requestType,
        status: "new",
        locale: base.locale,
        sourceUrl: sourceUrl.slice(0, 2048),
        contact: {
          company: company || undefined,
          organizationNumber: organizationNumber || undefined,
          name: name || undefined,
          email: email || undefined,
          phone,
        },
        callPreference: requestType === "call" ? callPreference : undefined,
        preferredTime: requestType === "call" ? preferredTime || undefined : undefined,
        message: textValue(formData, "message", 3000) || undefined,
        serviceAgreement: {
          selected: Boolean(quote.serviceAgreement),
          annualPrice: quote.serviceAgreement?.annualPrice,
        },
        snapshot,
        emailStatus: "pending",
      },
    });
  } catch (error) {
    const duplicate = await existingRequest(idempotencyKey);
    if (duplicate) {
      return { ok: true, reference: duplicate.reference };
    }
    throw error;
  }

  await sendConfiguratorRequestEmails(payload, {
    id: request.id,
    reference,
    requestType,
    contact: {
      company: company || undefined,
      organizationNumber: organizationNumber || undefined,
      name: name || undefined,
      email: email || undefined,
      phone,
    },
    callPreference: requestType === "call" ? callPreference : undefined,
    preferredTime: requestType === "call" ? preferredTime || undefined : undefined,
    message: textValue(formData, "message", 3000) || undefined,
    quote,
  });

  return { ok: true, reference, formValues: { ...formValues, callPreference } };
}

export async function submitOrderRequest(
  _previousState: ConfiguratorActionState,
  formData: FormData,
): Promise<ConfiguratorActionState> {
  return submitRequest(formData, "order");
}

export async function submitCallRequest(
  _previousState: ConfiguratorActionState,
  formData: FormData,
): Promise<ConfiguratorActionState> {
  return submitRequest(formData, "call");
}

const HOUR = 60 * 60 * 1000;

/**
 * "Skicka kopia till mig": mails the quote to the address given. Anyone can give any address, so
 * a hidden field stops bots, and each address gets at most 3 copies and each visitor's IP address
 * 10 an hour, against using the form to flood someone's inbox.
 */
export async function sendQuoteCopy(
  _previousState: QuoteCopyState,
  formData: FormData,
): Promise<QuoteCopyState> {
  const email = textValue(formData, "copyEmail", 320).toLowerCase();
  if (textValue(formData, "website", 200)) {
    return { ok: false, email, message: "Kopian kunde inte skickas." };
  }
  if (!emailPattern.test(email)) {
    return { ok: false, email, message: "Ange en giltig e-postadress." };
  }

  const base = validateBaseForm(formData);
  const quote = base
    ? buildQuote(
        await getConfiguratorCatalog(base.locale, false),
        base.familyKey,
        base.selections,
        base.financingKey,
        base.serviceAgreement,
      )
    : null;
  if (!quote) {
    return {
      ok: false,
      email,
      message: "Konfigurationen är ofullständig eller inte längre giltig.",
    };
  }

  const payload = await getPayloadClient();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed =
    (await takeRateLimit(payload, `quote-copy-ip:${ip}`, 10, HOUR)) &&
    (await takeRateLimit(payload, `quote-copy-email:${email}`, 3, HOUR));
  if (!allowed) {
    return { ok: false, email, message: "För många kopior har skickats. Försök igen om en timme." };
  }

  if (!(await sendQuoteCopyEmail(email, quote))) {
    return { ok: false, email, message: "Kopian kunde inte skickas just nu. Försök igen senare." };
  }
  return { ok: true, email };
}
