import type { CollectionConfig, Field } from "payload";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";
import { populatePublishedAt } from "../../hooks/populatePublishedAt.ts";
import { revalidateTruckFamily, revalidateTruckFamilyDelete } from "./hooks/revalidate.ts";

const keyField = (name = "key", label = "Stabil nyckel"): Field => ({
  name,
  label,
  type: "text",
  required: true,
  localized: false,
  validate: (value: unknown) =>
    typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : "Använd endast gemener, siffror och bindestreck.",
});

const conditionReferenceArray = (name: "allOf" | "anyOf" | "noneOf"): Field => ({
  name,
  dbName:
    name === "allOf" ? "truck_cfg_all" : name === "anyOf" ? "truck_cfg_any" : "truck_cfg_none",
  type: "array",
  localized: false,
  fields: [
    {
      name: "reference",
      type: "text",
      required: true,
      localized: false,
      admin: { description: "Format: grupp-nyckel.alternativ-nyckel" },
    },
  ],
});

export const TruckFamilies: CollectionConfig = {
  slug: "truck-families",
  labels: { singular: "Truckfamilj", plural: "Truckfamiljer" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    defaultColumns: ["name", "key", "sortOrder", "basePrice", "updatedAt"],
    group: "Configurator",
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", localized: true, required: true },
    keyField(),
    { name: "sortOrder", type: "number", required: true, defaultValue: 0, localized: false },
    { name: "description", type: "textarea", localized: true },
    { name: "basePrice", type: "number", required: true, min: 0, localized: false },
    { name: "sku", type: "text", localized: false },
    { name: "image", type: "upload", relationTo: "media", localized: false },
    { name: "brochure", type: "upload", relationTo: "documents", localized: false },
    { name: "deliveryTime", type: "text", localized: true, required: true },
    { name: "warranty", type: "textarea", localized: true, required: true },
    {
      name: "steps",
      dbName: "truck_cfg_steps",
      type: "array",
      localized: false,
      required: true,
      minRows: 1,
      fields: [
        keyField(),
        { name: "label", type: "text", localized: true, required: true },
        { name: "heading", type: "text", localized: true, required: true },
        { name: "description", type: "textarea", localized: true },
        {
          name: "groups",
          dbName: "truck_cfg_groups",
          type: "array",
          localized: false,
          required: true,
          minRows: 1,
          fields: [
            keyField(),
            { name: "label", type: "text", localized: true, required: true },
            { name: "description", type: "textarea", localized: true },
            {
              name: "selectionMode",
              type: "select",
              required: true,
              defaultValue: "single",
              options: [
                { label: "Enkelval", value: "single" },
                { label: "Flerval", value: "multiple" },
              ],
            },
            { name: "required", type: "checkbox", defaultValue: true },
            {
              name: "options",
              dbName: "truck_cfg_options",
              type: "array",
              localized: false,
              required: true,
              minRows: 1,
              fields: [
                keyField(),
                { name: "label", type: "text", localized: true, required: true },
                { name: "description", type: "textarea", localized: true },
                {
                  name: "priceMode",
                  type: "select",
                  required: true,
                  defaultValue: "included",
                  options: [
                    { label: "Ingår", value: "included" },
                    { label: "Pristillägg", value: "add" },
                    { label: "Ersätt baspris", value: "replaceBase" },
                  ],
                },
                { name: "price", type: "number", min: 0, defaultValue: 0, required: true },
                { name: "defaultSelected", type: "checkbox", defaultValue: false },
                { name: "sku", type: "text", localized: false },
                {
                  name: "conditions",
                  type: "group",
                  localized: false,
                  fields: [
                    conditionReferenceArray("allOf"),
                    conditionReferenceArray("anyOf"),
                    conditionReferenceArray("noneOf"),
                  ],
                },
                {
                  name: "specifications",
                  dbName: "truck_cfg_specs",
                  type: "array",
                  localized: false,
                  fields: [
                    { name: "label", type: "text", localized: true, required: true },
                    { name: "value", type: "text", localized: true, required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      localized: false,
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    afterChange: [revalidateTruckFamily],
    afterDelete: [revalidateTruckFamilyDelete],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: { autosave: { interval: 300 }, schedulePublish: true },
    maxPerDoc: 50,
  },
};
