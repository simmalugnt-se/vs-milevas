import { APIError, type CollectionConfig, Forbidden } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { notifyAcceptedDealer } from "./hooks/notify-accepted.ts";

export const DEALER_STATUSES = [
  { label: "Väntar på godkännande", value: "pending" },
  { label: "Godkänd", value: "accepted" },
  { label: "Nekad", value: "rejected" },
] as const;

/**
 * Dealers (återförsäljare): accounts on the site, not in Admin. Anyone can apply on /login; an
 * application waits as `pending` until an editor sets `accepted`, and only then can the dealer sign
 * in and see dealer prices. Admin's users edit them here; dealers never use Payload's API.
 *
 * Payload keeps the password, the reset tokens and the lockout after failed attempts. The site signs
 * dealers in through the Local API and keeps a session of its own (`src/features/dealers`), so a
 * dealer never holds a Payload token: the REST login, password reset and refresh are refused below.
 */
export const Dealers: CollectionConfig = {
  slug: "dealers",
  labels: { singular: "Återförsäljare", plural: "Återförsäljare" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["email", "company", "name", "status", "createdAt"],
    group: ADMIN_GROUPS.requests,
    useAsTitle: "email",
    components: {
      beforeListTable: [
        {
          path: "/payload/components/Note.tsx#Note",
          clientProps: {
            text: "Ansökningar från sidan väntar på godkännande. Sätt status Godkänd för att ge återförsäljaren tillgång till ÅF-priserna; de får ett mejl om det. Nekad eller Väntar loggar ut dem.",
          },
        },
      ],
    },
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    useSessions: false,
  },
  fields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [...DEALER_STATUSES],
      admin: { position: "sidebar" },
    },
    {
      type: "row",
      fields: [
        { name: "company", label: "Företag", type: "text", required: true },
        { name: "name", label: "Namn", type: "text" },
      ],
    },
    {
      name: "note",
      label: "Intern anteckning",
      type: "textarea",
      admin: { description: "Syns bara här." },
    },
  ],
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        // The site signs dealers in through the Local API; over REST and GraphQL these would hand
        // out a Payload token or Payload's reset email, which points at Admin.
        if (
          (operation === "login" || operation === "forgotPassword" || operation === "refresh") &&
          req.payloadAPI !== "local"
        ) {
          throw new Forbidden(req.t);
        }
        return args;
      },
    ],
    beforeLogin: [
      ({ req, user }) => {
        // Also covers the REST password reset, which signs in without `beforeOperation`.
        if (req.payloadAPI !== "local") {
          throw new APIError("Logga in på sidan.", 403);
        }
        return user;
      },
    ],
    afterChange: [notifyAcceptedDealer],
  },
};
