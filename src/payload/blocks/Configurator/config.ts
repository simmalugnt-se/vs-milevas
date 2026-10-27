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
              text: "Här finns inget att fylla i. Konfiguratorn byggs automatiskt av de publicerade trucktyperna (Konfigurator → Trucktyper): deras varianter, batterier, lyfthöjder, tillval och priser blir stegen och valen.\n\nStegens ordning och namn, finansiering, serviceavtal, garantins förklaring och stegen efter en beställning finns i Konfigurator → Konfiguratorinställningar.",
            },
          },
        },
      },
    },
  ],
};
