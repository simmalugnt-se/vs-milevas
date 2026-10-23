import type { GlobalConfig } from "payload";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { revalidateConfiguratorSettings } from "./hooks/revalidate.ts";

export const ConfiguratorSettings: GlobalConfig = {
  slug: "configurator-settings",
  label: "Konfiguratorinställningar",
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  admin: { group: "Configurator" },
  fields: [
    { name: "quoteValidityDays", type: "number", required: true, min: 1, defaultValue: 14 },
    {
      name: "financingMethods",
      type: "array",
      localized: false,
      required: true,
      minRows: 1,
      fields: [
        { name: "key", type: "text", required: true, localized: false },
        { name: "label", type: "text", localized: true, required: true },
        { name: "description", type: "textarea", localized: true },
        {
          name: "kind",
          type: "select",
          required: true,
          options: [
            { label: "Engångsbelopp", value: "purchase" },
            { label: "Månadskostnad", value: "monthly" },
          ],
        },
        { name: "months", type: "number", min: 1 },
        {
          name: "monthlyFactor",
          type: "number",
          min: 0,
          admin: { description: "Exempel: 0.01875 motsvarar 1,875 % av totalpriset." },
        },
        {
          name: "serviceAgreementEligible",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Visar serviceavtal som ett val för denna finansieringsmetod." },
        },
      ],
    },
    {
      name: "serviceAgreement",
      type: "group",
      fields: [
        {
          name: "label",
          type: "text",
          localized: true,
          required: true,
          defaultValue: "Serviceavtal",
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          defaultValue: "Årlig kostnad. Faktureras separat.",
        },
        { name: "annualPrice", type: "number", required: true, min: 0, defaultValue: 2856 },
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
