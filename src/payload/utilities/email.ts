import { resendAdapter } from "@payloadcms/email-resend";
import type { EmailAdapter } from "payload";

export const getPayloadEmailAdapter = (): EmailAdapter | undefined => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const sender = process.env.EMAIL_SENDER?.trim() || process.env.RESEND_FROM?.trim();

  if (!apiKey || !sender) {
    return undefined;
  }

  // A bare address or "Name <address>"; without EMAIL_SENDER, the same sender as RESEND_FROM.
  const senderParts = sender.match(/^(.*?)\s*<([^<>]+)>$/);
  const defaultFromAddress = senderParts ? senderParts[2].trim() : sender;
  const defaultFromName = senderParts
    ? senderParts[1].trim().replace(/^"(.*)"$/, "$1") || "Milevas"
    : "Milevas";

  return resendAdapter({
    apiKey,
    defaultFromAddress,
    defaultFromName,
  });
};
