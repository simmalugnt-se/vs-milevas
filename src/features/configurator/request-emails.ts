import type { Payload } from "payload";
import { Resend } from "resend";
import type { ConfiguratorQuote } from "./types";

type EmailRequest = {
  id: string;
  reference: string;
  requestType: "order" | "call";
  contact: {
    company?: string;
    organizationNumber?: string;
    name: string;
    email?: string;
    phone: string;
  };
  callPreference?: "asap" | "specific";
  preferredTime?: string;
  message?: string;
  quote: ConfiguratorQuote;
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function quoteRows(quote: ConfiguratorQuote) {
  return quote.selectedOptions
    .map(
      (option) =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(option.label)}</td><td style="padding:4px 0;text-align:right">${escapeHtml(option.priceMode === "add" ? formatPrice(option.price) : "Ingår")}</td></tr>`,
    )
    .join("");
}

function emailDocument(title: string, content: string) {
  return `<!doctype html><html lang="sv"><body style="background:#f5f5f5;font-family:Arial,sans-serif;margin:0;padding:24px"><main style="background:#fff;border:1px solid #ddd;margin:auto;max-width:680px;padding:32px"><h1 style="font-size:24px">${escapeHtml(title)}</h1>${content}</main></body></html>`;
}

function salesEmail(request: EmailRequest) {
  const typeLabel = request.requestType === "order" ? "Orderförfrågan" : "Kontaktförfrågan";
  return emailDocument(
    `${typeLabel} ${request.reference}`,
    `<p><strong>${escapeHtml(request.contact.name)}</strong><br>${escapeHtml(request.contact.company)}<br>${escapeHtml(request.contact.organizationNumber)}<br><a href="mailto:${escapeHtml(request.contact.email)}">${escapeHtml(request.contact.email)}</a><br>${escapeHtml(request.contact.phone)}</p><h2>${escapeHtml(request.quote.familyName)}</h2><p>${escapeHtml(request.quote.sku)}</p><table style="border-collapse:collapse;width:100%">${quoteRows(request.quote)}<tr><td style="border-top:1px solid #ddd;padding:8px 12px 4px 0"><strong>Totalpris</strong></td><td style="border-top:1px solid #ddd;padding:8px 0 4px;text-align:right"><strong>${escapeHtml(formatPrice(request.quote.totalPrice))}</strong></td></tr></table><p><strong>Finansiering:</strong> ${escapeHtml(request.quote.financing.label)} – ${escapeHtml(formatPrice(request.quote.financingPrice))}${request.quote.financing.kind === "monthly" ? "/månad" : ""}</p>${request.preferredTime ? `<p><strong>Önskad tid:</strong> ${escapeHtml(request.preferredTime)}</p>` : ""}${request.message ? `<p><strong>Meddelande:</strong><br>${escapeHtml(request.message)}</p>` : ""}`,
  );
}

function customerEmail(request: EmailRequest) {
  const heading =
    request.requestType === "order"
      ? "Vi har tagit emot din orderförfrågan"
      : "Vi har tagit emot din kontaktförfrågan";
  return emailDocument(
    heading,
    `<p>Hej ${escapeHtml(request.contact.name)},</p><p>Tack för din förfrågan. Din referens är <strong>${escapeHtml(request.reference)}</strong>. En specialist återkommer till dig.</p><h2>${escapeHtml(request.quote.familyName)}</h2><p>Totalpris: <strong>${escapeHtml(formatPrice(request.quote.totalPrice))}</strong></p><p>Detta är en mottagningsbekräftelse, inte ett bindande avtal.</p>`,
  );
}

export async function sendConfiguratorRequestEmails(
  payload: Payload,
  request: EmailRequest,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const salesEmailAddress = process.env.CONFIGURATOR_SALES_EMAIL;

  if (!apiKey || !from || !salesEmailAddress) {
    await payload.update({
      collection: "configurator-requests",
      id: request.id,
      overrideAccess: true,
      data: {
        emailStatus: "notConfigured",
        emailError: "Resend environment variables are not configured.",
      },
    });
    return;
  }

  const resend = new Resend(apiKey);
  let salesEmailId: string | undefined;
  let customerEmailId: string | undefined;

  try {
    const salesResult = await resend.emails.send(
      {
        from,
        to: salesEmailAddress,
        replyTo: request.contact.email,
        subject: `${request.requestType === "order" ? "Orderförfrågan" : "Kontaktförfrågan"} ${request.reference}`,
        html: salesEmail(request),
      },
      { headers: { "Idempotency-Key": `configurator-sales-${request.reference}` } },
    );
    if (salesResult.error) {
      throw new Error(salesResult.error.message);
    }
    salesEmailId = salesResult.data?.id;

    if (request.contact.email) {
      const customerResult = await resend.emails.send(
        {
          from,
          to: request.contact.email,
          subject: `Vi har tagit emot din förfrågan – ${request.reference}`,
          html: customerEmail(request),
        },
        { headers: { "Idempotency-Key": `configurator-customer-${request.reference}` } },
      );
      if (customerResult.error) {
        throw new Error(customerResult.error.message);
      }
      customerEmailId = customerResult.data?.id;
    }

    await payload.update({
      collection: "configurator-requests",
      id: request.id,
      overrideAccess: true,
      data: { emailStatus: "sent", salesEmailId, customerEmailId, emailError: null },
    });
  } catch (error) {
    await payload.update({
      collection: "configurator-requests",
      id: request.id,
      overrideAccess: true,
      data: {
        emailStatus: "failed",
        salesEmailId,
        customerEmailId,
        emailError: error instanceof Error ? error.message : "Unknown email error",
      },
    });
  }
}
