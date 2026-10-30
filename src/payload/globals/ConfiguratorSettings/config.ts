import type { GlobalConfig } from "payload";
import { DRIVE_HOUR_BANDS } from "@/features/configurator/service-rates.ts";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { isAuthenticated, isEditorUser } from "../../access/isAuthenticated.ts";
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
      type: "tabs",
      tabs: [
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
                  name: "interestRate",
                  label: "Årsränta (%)",
                  type: "number",
                  min: 0,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                    step: 0.01,
                    description: "Tomt: ingen ränta.",
                  },
                },
                {
                  name: "residualValues",
                  label: "Restvärde per avtalslängd",
                  labels: { singular: "Restvärde", plural: "Restvärden" },
                  type: "array",
                  // The table's full name passes Postgres' 63 characters in the versions.
                  dbName: "configurator_financing_residuals",
                  localized: false,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                    description: "Andel av totalpriset. Den första raden som passar gäller.",
                    components: {
                      RowLabel:
                        "/payload/globals/ConfiguratorSettings/RowLabels.tsx#ResidualValueRowLabel",
                    },
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "minMonths",
                          label: "Från (mån)",
                          type: "number",
                          required: true,
                          min: 0,
                          admin: { width: "33%" },
                        },
                        {
                          name: "maxMonths",
                          label: "Till och med (mån)",
                          type: "number",
                          required: true,
                          min: 0,
                          admin: { width: "33%" },
                        },
                        {
                          name: "percent",
                          label: "Restvärde (%)",
                          type: "number",
                          required: true,
                          min: 0,
                          max: 100,
                          admin: { width: "33%", step: 0.1 },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "residualPercent",
                  label: "Restvärde för övriga avtalslängder (%)",
                  type: "number",
                  min: 0,
                  max: 100,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                    step: 0.1,
                  },
                },
                {
                  name: "rental",
                  label: "Hyra: service och försäkring ingår",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                  },
                },
                {
                  type: "row",
                  admin: {
                    condition: (_, siblingData) =>
                      siblingData?.kind === "monthly" && siblingData?.rental === true,
                  },
                  fields: [
                    {
                      name: "driveHoursPerYear",
                      label: "Drifttimmar per år",
                      type: "number",
                      min: 0,
                      admin: { width: "50%" },
                    },
                    {
                      name: "insurancePercent",
                      label: "Försäkring (% av totalpriset per år)",
                      type: "number",
                      min: 0,
                      admin: { width: "50%", step: 0.01 },
                    },
                  ],
                },
                {
                  // VS Truck's service prices: kronor per drive hour by truck type, the model's lift
                  // capacity and the drive hours a year (`DRIVE_HOUR_BANDS`).
                  name: "serviceRates",
                  label: "Servicekostnad per drifttimme",
                  labels: { singular: "Rad", plural: "Rader" },
                  type: "array",
                  dbName: "cs_service_rates",
                  localized: false,
                  admin: {
                    condition: (_, siblingData) =>
                      siblingData?.kind === "monthly" && siblingData?.rental === true,
                    initCollapsed: true,
                    description:
                      "Den första raden som passar modellens trucktyp och lyftkapacitet gäller.",
                    components: {
                      RowLabel:
                        "/payload/globals/ConfiguratorSettings/RowLabels.tsx#ServiceRateRowLabel",
                    },
                  },
                  fields: [
                    {
                      name: "family",
                      label: "Trucktyp",
                      type: "relationship",
                      relationTo: "truck-families",
                      required: true,
                    },
                    {
                      type: "row",
                      fields: [
                        {
                          name: "minKg",
                          label: "Lyftkapacitet från (kg)",
                          type: "number",
                          required: true,
                          min: 0,
                          admin: { width: "50%" },
                        },
                        {
                          name: "maxKg",
                          label: "Till och med (kg)",
                          type: "number",
                          min: 0,
                          admin: { width: "50%", description: "Tomt: ingen övre gräns." },
                        },
                      ],
                    },
                    {
                      type: "row",
                      fields: DRIVE_HOUR_BANDS.map(({ key, label }) => ({
                        name: key,
                        label: `${label} (kr/h)`,
                        type: "number" as const,
                        min: 0,
                        admin: { width: "20%", step: 0.5 },
                      })),
                    },
                  ],
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
              label: "Gemensam ÅF-rabatt (%)",
              type: "number",
              min: 0,
              max: 100,
              defaultValue: 0,
              // The site reads it past access for signed-in dealers only; visitors never get it.
              access: { read: ({ req }) => isEditorUser(req.user) },
              admin: {
                step: 0.1,
                description: "Gäller modeller utan egen ÅF-rabatt. 0: inget ÅF-pris.",
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
