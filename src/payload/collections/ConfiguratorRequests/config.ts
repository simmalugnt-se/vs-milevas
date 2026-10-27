import type { CollectionConfig, Field } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

/** What the visitor sent; editors change the status only. */
const sent = { readOnly: true } as const;

/** In the database and the API, not in the form: `RequestSummary` shows them. */
const hidden = { hidden: true } as const;

const ADMIN = "/payload/collections/ConfiguratorRequests";

const price = (name: string, label: string, admin: Field["admin"] = {}): Field =>
  ({ name, label, type: "number", admin: { ...sent, ...admin } }) as Field;

/**
 * Orders and call requests from the configurator. The server action creates them with the
 * configuration as fields (`quoteFields`) and the whole quote in `snapshot`. The form shows them as
 * one summary (`RequestSummary`); editors change the status only.
 */
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
    defaultColumns: ["reference", "requestType", "familyName", "totalPrice", "status", "createdAt"],
    group: ADMIN_GROUPS.requests,
    useAsTitle: "reference",
  },
  fields: [
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
      admin: { position: "sidebar" },
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
      admin: { ...sent, position: "sidebar" },
    },
    {
      name: "reference",
      label: "Referens",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { ...sent, position: "sidebar" },
    },
    // Shown in the sidebar and as list columns.
    {
      name: "familyName",
      label: "Trucktyp",
      type: "text",
      admin: { ...sent, position: "sidebar" },
    },
    price("totalPrice", "Totalpris", { position: "sidebar" }),
    {
      name: "summary",
      type: "ui",
      admin: { components: { Field: `${ADMIN}/RequestSummary.tsx#RequestSummary` } },
    },
    // What the summary shows: kept as fields for the list and filters, not in the form.
    {
      name: "contact",
      type: "group",
      admin: hidden,
      fields: [
        { name: "company", label: "Företag", type: "text" },
        { name: "organizationNumber", label: "Organisationsnummer", type: "text" },
        { name: "name", label: "Namn", type: "text" },
        { name: "email", label: "E-post", type: "email" },
        { name: "phone", label: "Telefon", type: "text", required: true },
      ],
    },
    {
      name: "dealer",
      label: "Återförsäljare",
      type: "relationship",
      relationTo: "dealers",
      admin: hidden,
    },
    {
      name: "callPreference",
      label: "När vi ska ringa",
      type: "select",
      options: [
        { label: "Så snart som möjligt", value: "asap" },
        { label: "Önskad tid", value: "specific" },
      ],
      admin: hidden,
    },
    { name: "preferredTime", label: "Önskad tid", type: "text", admin: hidden },
    { name: "message", label: "Meddelande", type: "textarea", admin: hidden },
    { name: "model", label: "Variant", type: "text", admin: hidden },
    { name: "sku", label: "Artikelnummer", type: "text", admin: hidden },
    { name: "complete", label: "Alla steg valda", type: "checkbox", admin: hidden },
    {
      name: "lines",
      label: "Rader",
      type: "array",
      admin: hidden,
      fields: [
        { name: "label", type: "text" },
        { name: "price", type: "number" },
        { name: "dealerPrice", type: "number" },
        {
          name: "kind",
          type: "select",
          options: [
            { label: "Grund", value: "base" },
            { label: "Val", value: "option" },
            { label: "Serviceavtal", value: "service" },
          ],
        },
      ],
    },
    price("dealerTotalPrice", "ÅF-pris totalt", hidden),
    {
      name: "financing",
      type: "group",
      admin: hidden,
      fields: [
        { name: "label", type: "text" },
        { name: "price", type: "number" },
        { name: "monthly", type: "checkbox" },
      ],
    },
    {
      name: "serviceAgreement",
      type: "group",
      admin: hidden,
      fields: [
        { name: "selected", type: "checkbox", defaultValue: false },
        { name: "annualPrice", type: "number", min: 0 },
      ],
    },
    {
      name: "specifications",
      type: "array",
      admin: hidden,
      fields: [
        { name: "label", type: "text" },
        { name: "value", type: "text" },
      ],
    },
    { name: "deliveryTime", type: "text", admin: hidden },
    { name: "warranty", type: "text", admin: hidden },
    // Shown in the summary as one line on the emails, and a link to the quote.
    {
      name: "locale",
      type: "select",
      required: true,
      options: [
        { label: "Svenska", value: "sv" },
        { label: "Engelska", value: "en" },
      ],
      admin: hidden,
    },
    { name: "sourceUrl", type: "text", admin: hidden },
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
      admin: hidden,
    },
    { name: "salesEmailId", type: "text", admin: hidden },
    { name: "customerEmailId", type: "text", admin: hidden },
    { name: "emailError", type: "textarea", admin: hidden },
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: hidden,
    },
    // The whole quote as it was counted, for the emails and for checking afterwards.
    { name: "snapshot", type: "json", required: true, admin: hidden },
  ],
};
