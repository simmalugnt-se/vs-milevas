"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import type { Payload } from "payload";
import { Resend } from "resend";
import { getPayloadClient } from "@/payload/get-payload";

export type ContactActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  formValues?: { name: string; company: string; email: string; phone: string; message: string };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textValue(formData: FormData, key: string, maxLength = 500) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `KON-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function existingRequest(idempotencyKey: string) {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: "contact-requests",
    overrideAccess: true,
    limit: 1,
    where: { idempotencyKey: { equals: idempotencyKey } },
  });
  return existing.docs[0] ?? null;
}

/**
 * Mails the request to Milevas, with the sender as reply-to. Nothing goes to the address in the
 * form, so the form cannot be used to send mail to someone else.
 */
async function sendContactEmail(
  payload: Payload,
  request: { id: string; reference: string } & NonNullable<ContactActionState["formValues"]>,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_REQUEST_EMAIL || process.env.CONFIGURATOR_SALES_EMAIL;
  const update = (data: Record<string, unknown>) =>
    payload.update({ collection: "contact-requests", id: request.id, overrideAccess: true, data });

  if (!apiKey || !from || !to) {
    await update({
      emailStatus: "notConfigured",
      emailError: "Resend environment variables are not configured.",
    });
    return;
  }

  const rows = [request.name, request.company, request.email, request.phone]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
  const html = `<!doctype html><html lang="sv"><body style="background:#f5f5f5;font-family:Arial,sans-serif;margin:0;padding:24px"><main style="background:#fff;border:1px solid #ddd;margin:auto;max-width:680px;padding:32px"><h1 style="font-size:24px">Kontaktförfrågan ${escapeHtml(request.reference)}</h1><p>${rows}</p><p style="white-space:pre-line">${escapeHtml(request.message)}</p></main></body></html>`;

  try {
    const result = await new Resend(apiKey).emails.send(
      {
        from,
        to,
        replyTo: request.email,
        subject: `Kontaktförfrågan ${request.reference}`,
        html,
      },
      { headers: { "Idempotency-Key": `contact-${request.reference}` } },
    );
    if (result.error) throw new Error(result.error.message);
    await update({ emailStatus: "sent", emailId: result.data?.id, emailError: null });
  } catch (error) {
    await update({
      emailStatus: "failed",
      emailError: error instanceof Error ? error.message : "Unknown email error",
    });
  }
}

/** The Contact block's form: saves a contact request and mails it to Milevas. */
export async function submitContactRequest(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  // The hidden field only bots fill in.
  if (textValue(formData, "website", 200)) {
    return { ok: false, message: "Meddelandet kunde inte skickas." };
  }

  const formValues = {
    name: textValue(formData, "name", 200),
    company: textValue(formData, "company", 200),
    email: textValue(formData, "email", 320),
    phone: textValue(formData, "phone", 100),
    message: textValue(formData, "message", 3000),
  };
  const fieldErrors: Record<string, string> = {};
  if (!formValues.name) fieldErrors.name = "Ange ditt namn.";
  if (!emailPattern.test(formValues.email)) fieldErrors.email = "Ange en giltig e-postadress.";
  if (!formValues.message) fieldErrors.message = "Skriv ett meddelande.";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, formValues, message: "Kontrollera de markerade fälten." };
  }

  const submissionKey = textValue(formData, "submissionKey", 100);
  if (!submissionKey) {
    return { ok: false, formValues, message: "Meddelandet kunde inte skickas." };
  }
  const idempotencyKey = `contact:${submissionKey}`;
  if (await existingRequest(idempotencyKey)) {
    return { ok: true, formValues };
  }

  const reference = createReference();
  const sourceUrl =
    textValue(formData, "sourceUrl", 2048) || (await headers()).get("referer") || "";
  const payload = await getPayloadClient();
  let request;
  try {
    request = await payload.create({
      collection: "contact-requests",
      overrideAccess: true,
      data: {
        reference,
        idempotencyKey,
        status: "new",
        locale: textValue(formData, "locale", 2) === "en" ? "en" : "sv",
        sourceUrl: sourceUrl.slice(0, 2048),
        name: formValues.name,
        company: formValues.company || undefined,
        email: formValues.email,
        phone: formValues.phone || undefined,
        message: formValues.message,
        emailStatus: "pending",
      },
    });
  } catch (error) {
    if (await existingRequest(idempotencyKey)) {
      return { ok: true, formValues };
    }
    throw error;
  }

  await sendContactEmail(payload, { id: String(request.id), reference, ...formValues });
  return { ok: true, formValues };
}
