import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

/** What the Contact block's form sends; the server action creates them, editors follow them up. */
export const ContactRequests: CollectionConfig = {
  slug: "contact-requests",
  labels: { singular: "Meddelande", plural: "Meddelanden" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["reference", "name", "email", "status", "emailStatus", "createdAt"],
    group: ADMIN_GROUPS.requests,
    useAsTitle: "reference",
  },
  fields: [
    {
      name: "reference",
      label: "Referens",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "idempotencyKey",
      label: "Dubblettspärr",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "Ny", value: "new" },
        { label: "Besvarad", value: "answered" },
        { label: "Avslutad", value: "closed" },
      ],
    },
    {
      name: "locale",
      label: "Språk",
      type: "select",
      required: true,
      options: [
        { label: "Svenska", value: "sv" },
        { label: "Engelska", value: "en" },
      ],
    },
    { name: "sourceUrl", label: "Skickad från", type: "text" },
    { name: "name", label: "Namn", type: "text", required: true },
    { name: "company", label: "Företag", type: "text" },
    { name: "email", label: "E-post", type: "email", required: true },
    { name: "phone", label: "Telefon", type: "text" },
    { name: "message", label: "Meddelande", type: "textarea", required: true },
    {
      name: "emailStatus",
      label: "E-poststatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Väntar", value: "pending" },
        { label: "Skickad", value: "sent" },
        { label: "Misslyckad", value: "failed" },
        { label: "Ej konfigurerad", value: "notConfigured" },
      ],
    },
    { name: "emailId", label: "Mejlets id", type: "text" },
    { name: "emailError", label: "E-postfel", type: "textarea" },
  ],
};
