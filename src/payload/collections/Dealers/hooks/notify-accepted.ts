import type { CollectionAfterChangeHook } from "payload";
import { sendAcceptedEmail, siteOrigin } from "@/features/dealers/emails";
import type { Dealer } from "@/payload-types";

/** Mails the dealer when an editor accepts the application, so they know they can sign in. */
export const notifyAcceptedDealer: CollectionAfterChangeHook<Dealer> = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (doc.status === "accepted" && previousDoc?.status !== "accepted") {
    await sendAcceptedEmail(siteOrigin(req.headers), {
      email: doc.email,
      name: doc.name || undefined,
    }).catch((error) => req.payload.logger.error({ err: error }, "Dealer accepted email failed"));
  }
  return doc;
};
