import type { Block } from "payload";

/** The truck configurator: the families, steps and prices come from `TruckFamilies` and settings. */
export const ConfiguratorBlock: Block = {
  slug: "configurator",
  labels: { singular: "Truckkonfigurator", plural: "Truckkonfiguratorer" },
  fields: [
    {
      name: "about",
      type: "ui",
      admin: {
        components: {
          Field: {
            path: "/payload/components/Note.tsx#Note",
            clientProps: {
              text: "Här fylls bara rubriken i. Konfiguratorn byggs automatiskt av de publicerade trucktyperna (Konfigurator → Trucktyper): deras varianter, batterier, lyfthöjder, tillval och priser blir stegen och valen.\n\nStegens ordning och namn, finansiering, serviceavtal, garantins förklaring och stegen efter en beställning finns i Konfigurator → Konfiguratorinställningar.",
            },
          },
        },
      },
    },
    {
      name: "heading",
      label: "Rubrik",
      type: "text",
      localized: true,
      required: true,
      defaultValue: "Bygg din truck",
      admin: {
        description: "Syns inte på sidan, men läses av skärmläsare och sökmotorer.",
      },
    },
  ],
};
