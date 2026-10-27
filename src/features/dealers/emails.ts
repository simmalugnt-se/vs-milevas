import { Resend } from "resend";
import { emailDocument, escapeHtml } from "@/features/configurator/request-emails";
import { getServerSideURL } from "@/utilities/getURL";
import { trustedOrigins } from "@/utilities/trusted-origins";

/**
 * The address links in dealer emails start with: the one the request came to when it is a trusted
 * origin (so staging links to staging), or on a local machine; otherwise the site's own. A Host
 * header that is not ours never decides where a reset link points.
 */
export function siteOrigin(headers: Headers | undefined): string {
  const host = headers?.get("x-forwarded-host") ?? headers?.get("host");
  if (host) {
    const protocol = headers?.get("x-forwarded-proto") ?? "https";
    const origin = `${protocol.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
    const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
    if (trustedOrigins().includes(origin) || (local && !process.env.VERCEL)) return origin;
  }
  return getServerSideURL();
}

/**
 * Sends with Resend. Without it the email is not sent; in development its link is logged instead,
 * so applying, accepting and resetting a password can be tried locally. Never in production, where
 * the link of a reset email would let anyone reading the logs sign in.
 */
async function send(to: string, subject: string, html: string, replyTo?: string, link?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    const shown = link && process.env.NODE_ENV !== "production" ? ` Link: ${link}` : "";
    console.warn(`[dealers] Resend is not configured; "${subject}" to ${to} was not sent.${shown}`);
    return false;
  }
  const result = await new Resend(apiKey).emails.send({ from, to, subject, html, replyTo });
  if (result.error) console.error(`[dealers] "${subject}" to ${to}: ${result.error.message}`);
  return !result.error;
}

/** Who hears of new applications. */
const staffAddress = () =>
  process.env.DEALER_APPLICATION_EMAIL ||
  process.env.CONTACT_REQUEST_EMAIL ||
  process.env.CONFIGURATOR_SALES_EMAIL;

export async function sendApplicationEmail(
  origin: string,
  dealer: { id: string; email: string; company: string; name?: string },
) {
  const to = staffAddress();
  if (!to) return false;
  const link = `${origin}/admin/collections/dealers/${dealer.id}`;
  return send(
    to,
    `Ny ansökan om ÅF-konto: ${dealer.company}`,
    emailDocument(
      "Ny ansökan om ÅF-konto",
      `<p><strong>${escapeHtml(dealer.company)}</strong><br>${escapeHtml(dealer.name)}<br><a href="mailto:${escapeHtml(dealer.email)}">${escapeHtml(dealer.email)}</a></p><p>Ansökan väntar på godkännande. <a href="${escapeHtml(link)}">Öppna den i Payload</a> och sätt status Godkänd för att ge tillgång till ÅF-priserna.</p>`,
    ),
    dealer.email,
  );
}

export async function sendAcceptedEmail(origin: string, dealer: { email: string; name?: string }) {
  const link = `${origin}/login`;
  return send(
    dealer.email,
    "Ditt ÅF-konto hos Milevas är godkänt",
    emailDocument(
      "Ditt ÅF-konto är godkänt",
      `<p>${dealer.name ? `Hej ${escapeHtml(dealer.name)},` : "Hej,"}</p><p>Nu kan du logga in och se dina ÅF-priser bredvid kundpriserna.</p><p><a href="${escapeHtml(link)}">Logga in</a></p>`,
    ),
  );
}

export async function sendResetEmail(origin: string, email: string, token: string) {
  const link = `${origin}/login?reset=${encodeURIComponent(token)}`;
  return send(
    email,
    "Återställ ditt lösenord hos Milevas",
    emailDocument(
      "Återställ ditt lösenord",
      `<p>Någon, förhoppningsvis du, bad om att få återställa lösenordet till ditt ÅF-konto.</p><p><a href="${escapeHtml(link)}">Välj ett nytt lösenord</a></p><p>Länken gäller i en timme. Har du inte bett om det kan du strunta i mejlet.</p>`,
    ),
    undefined,
    link,
  );
}
