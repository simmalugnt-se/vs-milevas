import type { Block } from "payload";

export const ConfiguratorBlock: Block = {
  slug: "configurator",
  labels: { singular: "Truckkonfigurator", plural: "Truckkonfiguratorer" },
  fields: [
    { name: "heading", type: "text", localized: true, defaultValue: "Bygg din truck" },
    { name: "intro", type: "textarea", localized: true },
  ],
};
