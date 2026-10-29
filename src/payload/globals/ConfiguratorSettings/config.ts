import type { GlobalConfig } from "payload";
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
                    description:
                      "Månadskostnaden är en annuitet som betalas i början av varje månad, som VS Truck räknar: totalpriset lånas till årsräntan / 12 över avtalslängden och restvärdet står kvar i slutet. Tomt: ingen ränta.",
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
                    description:
                      "Restvärdet för de avtalslängder som ligger i ett spann; den första raden som passar gäller.",
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
                    description:
                      "Andel av totalpriset som står kvar i slutet, för de avtalslängder tabellen ovan inte tar upp. Kunden väljer avtalslängd med ett reglage mellan kortaste och längsta.",
                  },
                },
                {
                  name: "rental",
                  label: "Hyra: service och försäkring ingår",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    condition: (_, siblingData) => siblingData?.kind === "monthly",
                    description:
                      "Som långtidshyran hos VS Truck: månadskostnaden får service efter drifttimmar (timpriset står på trucktypen, under Långtidshyra) och försäkring, och kunden ser inget restvärde.",
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
                      admin: {
                        width: "50%",
                        description: "Servicen räknas på dem: drifttimmar × timpris / 12 i månaden.",
                      },
                    },
                    {
                      name: "insurancePercent",
                      label: "Försäkring (% av totalpriset per år)",
                      type: "number",
                      min: 0,
                      admin: {
                        width: "50%",
                        step: 0.01,
                        description: "Totalpris × procent / 12 i månaden.",
                      },
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
                description:
                  "Gäller modellerna utan egen ÅF-rabatt: dras av från modellens pris och tillvalen för inloggade återförsäljare, som ser sitt ÅF-pris bredvid kundpriset. 0 visar inget ÅF-pris. Godkänn återförsäljare under Förfrågningar → Återförsäljare.",
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
