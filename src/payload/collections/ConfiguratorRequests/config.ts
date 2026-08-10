import type { CollectionConfig } from "payload";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

export const ConfiguratorRequests: CollectionConfig = {
  slug: "configurator-requests",
  labels: { singular: "Konfiguratorförfrågan", plural: "Konfiguratorförfrågningar" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["reference", "requestType", "status", "emailStatus", "createdAt"],
    group: "Configurator",
    useAsTitle: "reference",
  },
  fields: [
    { name: "reference", type: "text", required: true, unique: true, index: true },
    { name: "idempotencyKey", type: "text", required: true, unique: true, index: true },
    {
      name: "requestType",
      type: "select",
      required: true,
      options: [
        { label: "Orderförfrågan", value: "order" },
        { label: "Kontaktförfrågan", value: "call" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "Ny", value: "new" },
        { label: "Kontaktad", value: "contacted" },
        { label: "Pågående", value: "processing" },
        { label: "Slutförd", value: "completed" },
        { label: "Avvisad", value: "rejected" },
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
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "company", type: "text" },
        { name: "organizationNumber", type: "text" },
        { name: "name", type: "text", required: true },
        { name: "email", type: "email" },
        { name: "phone", type: "text", required: true },
      ],
    },
    {
      name: "callPreference",
      type: "select",
      options: [
        { label: "Så snart som möjligt", value: "asap" },
        { label: "Önskad tid", value: "specific" },
      ],
    },
    { name: "preferredTime", type: "text" },
    { name: "message", type: "textarea" },
    {
      name: "serviceAgreement",
      type: "group",
      fields: [
        { name: "selected", type: "checkbox", defaultValue: false },
        { name: "annualPrice", type: "number", min: 0 },
      ],
    },
    { name: "snapshot", type: "json", required: true },
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
    { name: "salesEmailId", type: "text" },
    { name: "customerEmailId", type: "text" },
    { name: "emailError", type: "textarea" },
  ],
};
