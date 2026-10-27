import type { ArrayField, GlobalConfig } from "payload";
import { CHOICE_STEPS, MODEL_STEP, orderedSteps } from "@/features/configurator/steps.ts";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated, isEditorUser } from "../../access/isAuthenticated.ts";
import { revalidateConfiguratorSettings } from "./hooks/revalidate.ts";

/**
 * The steps after the variants, one row each, dragged into the order the configurator shows them in.
 * A row read without the steps (before any is saved, or after one is removed) gets the missing ones
 * back, so the list always shows every step.
 */
const stepsField: ArrayField = {
  name: "steps",
  label: "Övriga steg",
  labels: { singular: "Steg", plural: "Steg" },
  type: "array",
  localized: false,
  maxRows: CHOICE_STEPS.length,
  admin: {
    initCollapsed: true,
    description:
      "Dra raderna för att ändra ordningen. En trucktyp hoppar över ett steg den inte har något att välja i: ett batteri eller en mast som är ensam ingår i trucken.",
    components: {
      RowLabel: "/payload/globals/ConfiguratorSettings/RowLabels.tsx#StepRowLabel",
    },
  },
  hooks: {
    afterRead: [
      ({ value, req }) => {
        // Read in every locale at once (as when a version is saved), the rows stay as they are.
        if (req.locale === "all") return value;
        const rows = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
        return orderedSteps(rows as Array<{ step?: string; label?: unknown }>).map(
          // A row added here keeps the step as its id, so it stays collapsed or open between reads.
          (step) => rows.find((row) => row.step === step.step) ?? { ...step, id: step.step },
        );
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "step",
          label: "Steg",
          type: "select",
          required: true,
          options: CHOICE_STEPS.map((step) => ({ label: step.label, value: step.key })),
          admin: { readOnly: true, width: "50%" },
        },
        {
          name: "label",
          label: "Namn i konfiguratorn",
          type: "text",
          localized: true,
          required: true,
          admin: { width: "50%" },
        },
      ],
    },
  ],
};

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
      type: "tabs",
      tabs: [
        {
          label: "Steg",
          fields: [
            {
              name: "modelStepLabel",
              label: "Namn på steg 2",
              type: "text",
              localized: true,
              required: true,
              defaultValue: MODEL_STEP.label,
              hooks: { afterRead: [({ value }) => value || MODEL_STEP.label] },
              admin: {
                description:
                  "Steg 1 är valet av trucktyp. Steg 2 är alltid trucktypens varianter (lyftkapacitet): grundpriset sitter på varianten och allt annat läggs till det.",
              },
            },
            stepsField,
          ],
        },
        {
          label: "Offert och finansiering",
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
              admin: {
                components: {
                  RowLabel: "/payload/globals/ConfiguratorSettings/RowLabels.tsx#FinancingRowLabel",
                },
              },
              fields: [
                { name: "key", label: "Nyckel", type: "text", required: true, localized: false },
                {
                  name: "label",
                  label: "Benämning",
                  type: "text",
                  localized: true,
                  required: true,
                },
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
                {
                  type: "row",
                  admin: { condition: (_, siblingData) => siblingData?.kind === "monthly" },
                  fields: [
                    {
                      name: "minMonths",
                      label: "Kortaste avtalslängd (mån)",
                      type: "number",
                      min: 1,
                      admin: { width: "25%" },
                    },
                    {
                      name: "maxMonths",
                      label: "Längsta avtalslängd (mån)",
                      type: "number",
                      min: 1,
                      admin: { width: "25%" },
                    },
                    {
                      name: "monthsStep",
                      label: "Steg (mån)",
                      type: "number",
                      min: 1,
                      admin: { width: "25%" },
                    },
                    {
                      name: "months",
                      label: "Förvald avtalslängd (mån)",
                      type: "number",
                      min: 1,
                      admin: { width: "25%" },
                    },
                  ],
                },
                {
                  name: "residualPercent",
                  label: "Restvärde (% av totalpriset)",
                  type: "number",
                  min: 0,
                  max: 100,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                    step: 0.1,
                    description:
                      "Bara för leasing; lämnas tomt för hyra, som inte har något restvärde. Kunden väljer avtalslängd med ett reglage mellan kortaste och längsta. Månadskostnaden räknas tills vidare som (totalpris − restvärde) / antal månader.",
                  },
                },
                {
                  name: "serviceAgreementEligible",
                  label: "Serviceavtal går att välja",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    description: "Visar serviceavtal som ett val för denna finansieringsform.",
                  },
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
          ],
        },
        {
          label: "Återförsäljare",
          fields: [
            {
              name: "dealerDiscountPercent",
              label: "ÅF-rabatt (%)",
              type: "number",
              min: 0,
              max: 100,
              defaultValue: 0,
              // The site reads it past access for signed-in dealers only; visitors never get it.
              access: { read: ({ req }) => isEditorUser(req.user) },
              admin: {
                step: 0.1,
                description:
                  "Dras av från alla priser för inloggade återförsäljare, som ser sitt ÅF-pris bredvid kundpriset. 0 visar inget ÅF-pris. Godkänn återförsäljare under Förfrågningar → Återförsäljare.",
              },
            },
          ],
        },
        {
          label: "Tacksidan",
          fields: [
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
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateConfiguratorSettings] },
  versions: { drafts: { autosave: { interval: 300 }, schedulePublish: true }, max: 50 },
};
