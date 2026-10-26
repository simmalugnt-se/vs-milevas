import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

export const ConfiguratorRequests: CollectionConfig = {
  slug: "configurator-requests",
  labels: { singular: "Beställning", plural: "Beställningar" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["reference", "requestType", "status", "emailStatus", "createdAt"],
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
      name: "requestType",
      label: "Typ",
      type: "select",
      required: true,
      options: [
        { label: "Beställning", value: "order" },
        { label: "Samtal", value: "call" },
      ],
    },
    {
      name: "status",
      label: "Status",
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
      label: "Språk",
      type: "select",
      required: true,
      options: [
        { label: "Svenska", value: "sv" },
        { label: "Engelska", value: "en" },
      ],
    },
    { name: "sourceUrl", label: "Skickad från", type: "text" },
    {
      name: "contact",
      label: "Kontaktuppgifter",
      type: "group",
      fields: [
        { name: "company", label: "Företag", type: "text" },
        { name: "organizationNumber", label: "Organisationsnummer", type: "text" },
        { name: "name", label: "Namn", type: "text" },
        { name: "email", label: "E-post", type: "email" },
        { name: "phone", label: "Telefon", type: "text", required: true },
      ],
    },
    {
      name: "callPreference",
      label: "När vi ska ringa",
      type: "select",
      options: [
        { label: "Så snart som möjligt", value: "asap" },
        { label: "Önskad tid", value: "specific" },
      ],
    },
    { name: "preferredTime", label: "Önskad tid", type: "text" },
    { name: "message", label: "Meddelande", type: "textarea" },
    {
      name: "serviceAgreement",
      label: "Serviceavtal",
      type: "group",
      fields: [
        { name: "selected", label: "Valt", type: "checkbox", defaultValue: false },
        { name: "annualPrice", label: "Årspris", type: "number", min: 0 },
      ],
    },
    { name: "snapshot", label: "Konfiguration", type: "json", required: true },
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
    { name: "salesEmailId", label: "Säljmejlets id", type: "text" },
    { name: "customerEmailId", label: "Kundmejlets id", type: "text" },
    { name: "emailError", label: "E-postfel", type: "textarea" },
  ],
};
