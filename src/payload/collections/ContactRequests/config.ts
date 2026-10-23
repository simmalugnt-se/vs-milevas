import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

/** What the Contact block's form sends; the server action creates them, editors follow them up. */
export const ContactRequests: CollectionConfig = {
  slug: "contact-requests",
  labels: { singular: "Kontaktförfrågan", plural: "Kontaktförfrågningar" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["reference", "name", "email", "status", "emailStatus", "createdAt"],
    group: ADMIN_GROUPS.content,
    useAsTitle: "reference",
  },
  fields: [
    { name: "reference", type: "text", required: true, unique: true, index: true },
    { name: "idempotencyKey", type: "text", required: true, unique: true, index: true },
    {
      name: "status",
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
      type: "select",
      required: true,
      options: [
        { label: "Svenska", value: "sv" },
        { label: "English", value: "en" },
      ],
    },
    { name: "sourceUrl", type: "text" },
    { name: "name", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "emailStatus",
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
    { name: "emailId", type: "text" },
    { name: "emailError", type: "textarea" },
  ],
};
