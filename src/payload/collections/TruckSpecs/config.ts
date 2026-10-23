import type { CollectionConfig } from "payload";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { revalidateTruckSpec } from "./hooks/revalidate.ts";

/**
 * The specification types the truck families give values for (Vändradie, Batterikapacitet …):
 * their name, unit and order, so the quote, the product cards and the emails list them alike.
 */
export const TruckSpecs: CollectionConfig = {
  slug: "truck-specs",
  labels: { singular: "Specifikation", plural: "Specifikationer" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["label", "unit", "sortOrder", "onCard", "inQuote"],
    group: "Configurator",
    useAsTitle: "label",
  },
  defaultSort: "sortOrder",
  fields: [
    { name: "label", label: "Namn", type: "text", localized: true, required: true },
    {
      name: "key",
      label: "Stabil nyckel",
      type: "text",
      required: true,
      unique: true,
      validate: (value: unknown) =>
        typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : "Använd endast gemener, siffror och bindestreck.",
    },
    {
      name: "unit",
      label: "Enhet",
      type: "text",
      admin: { description: 'Läggs efter värdet om det inte redan slutar med den. Exempel: "mm".' },
    },
    { name: "sortOrder", label: "Ordning", type: "number", required: true, defaultValue: 0 },
    {
      name: "onCard",
      label: "Visas på produktkortet",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Efter lyftkapaciteten, som batteriet i Figma." },
    },
    {
      name: "inQuote",
      label: "Visas i offerten",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Under Tekniska specifikationer i offerten och i mejlen." },
    },
  ],
  hooks: { afterChange: [revalidateTruckSpec] },
};
