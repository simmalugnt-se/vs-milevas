import type { GlobalConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { revalidateConfiguratorSettings } from "./hooks/revalidate.ts";

export const ConfiguratorSettings: GlobalConfig = {
  slug: "configurator-settings",
  label: "Konfiguratorinställningar",
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  admin: { group: ADMIN_GROUPS.configurator },
  fields: [
    {
      name: "quoteValidityDays",
      label: "Offertens giltighet (dagar)",
      type: "number",
      required: true,
      min: 1,
      defaultValue: 14,
    },
    {
      name: "financingMethods",
      label: "Finansieringsformer",
      labels: { singular: "Finansieringsform", plural: "Finansieringsformer" },
      type: "array",
      localized: false,
      required: true,
      minRows: 1,
      fields: [
        { name: "key", label: "Nyckel", type: "text", required: true, localized: false },
        { name: "label", label: "Benämning", type: "text", localized: true, required: true },
        { name: "description", label: "Beskrivning", type: "textarea", localized: true },
        {
          name: "kind",
          label: "Typ av pris",
          type: "select",
          required: true,
          options: [
            { label: "Engångsbelopp", value: "purchase" },
            { label: "Månadskostnad", value: "monthly" },
          ],
        },
        { name: "months", label: "Antal månader", type: "number", min: 1 },
        {
          name: "monthlyPercent",
          label: "Månadskostnad (% av totalpriset)",
          type: "number",
          min: 0,
          admin: {
            step: 0.001,
            description:
              "Till exempel 1,875: en truck för 200 000 kr kostar då 3 750 kr i månaden.",
          },
        },
        {
          name: "serviceAgreementEligible",
          label: "Serviceavtal går att välja",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Visar serviceavtal som ett val för denna finansieringsform." },
        },
      ],
    },
    {
      name: "serviceAgreement",
      label: "Serviceavtal",
      type: "group",
      fields: [
        {
          name: "label",
          label: "Benämning",
          type: "text",
          localized: true,
          required: true,
          defaultValue: "Serviceavtal",
        },
        {
          name: "description",
          label: "Beskrivning",
          type: "textarea",
          localized: true,
          defaultValue: "Årlig kostnad. Faktureras separat.",
        },
        {
          name: "annualPrice",
          label: "Årspris",
          type: "number",
          required: true,
          min: 0,
          defaultValue: 2856,
        },
      ],
    },
    {
      name: "warrantyNote",
      label: "Garantins förklaring",
      type: "textarea",
      localized: true,
      admin: {
        description:
          'Under garantin i offertens prisruta. Exempel: "Omfattar fabrikationsfel på drivlina, elsystem och chassi."',
      },
    },
    {
      name: "nextSteps",
      label: "Vad händer nu?",
      labels: { singular: "Steg", plural: "Steg" },
      type: "array",
      localized: false,
      admin: { description: "Stegen på tacksidan efter en beställning." },
      fields: [
        { name: "heading", label: "Rubrik", type: "text", localized: true, required: true },
        { name: "text", label: "Text", type: "textarea", localized: true },
      ],
    },
  ],
  hooks: { afterChange: [revalidateConfiguratorSettings] },
  versions: { drafts: { autosave: { interval: 300 }, schedulePublish: true }, max: 50 },
};
