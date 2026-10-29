import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished.ts";
import { isAuthenticated, isEditorUser } from "../../access/isAuthenticated.ts";
import { specsField } from "../TruckFamilies/fields.ts";
import {
  revalidateTruckFamily,
  revalidateTruckFamilyDelete,
} from "../TruckFamilies/hooks/revalidate.ts";

const ADMIN = "/payload/collections/TruckModels";

/**
 * A model of a truck type, as Baoli's price list has them: "KBET 15 G1" in the series "KBET G1",
 * with its own lift capacity, price, dealer discount and specifications, and its photos with an
 * option chosen (with a cab). Which options it has is set on its truck type, under Utrustning; the
 * model shows them. See `docs/truck-data-schema.md`, section 14.
 */
export const TruckModels: CollectionConfig = {
  slug: "truck-models",
  labels: { singular: "Modell", plural: "Modeller" },
  access: {
    create: isAuthenticated,
    delete: isAuthenticated,
    read: authenticatedOrPublished,
    update: isAuthenticated,
  },
  admin: {
    group: ADMIN_GROUPS.configurator,
    useAsTitle: "name",
    defaultColumns: ["name", "family", "series", "capacityKg", "price", "dealerDiscountPercent"],
    listSearchableFields: ["name", "sku", "series"],
    components: {
      // Over the list only: the collection's description would show on every model too.
      beforeListTable: [
        {
          path: "/payload/components/Note.tsx#Note",
          clientProps: {
            text: "En rad per modell, som i Baolis prislista.",
          },
        },
      ],
    },
  },
  defaultSort: "capacityKg",
  fields: [
    {
      name: "family",
      label: "Trucktyp",
      type: "relationship",
      relationTo: "truck-families",
      required: true,
      index: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "name",
          label: "Namn",
          type: "text",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "sku",
          label: "Artikelnummer",
          type: "text",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "series",
          label: "Serie",
          type: "text",
          admin: {
            width: "33%",
            components: { Field: `${ADMIN}/SeriesSelect.tsx#SeriesSelect` },
          },
        },
        {
          name: "capacityKg",
          label: "Lyftkapacitet (kg)",
          type: "number",
          required: true,
          min: 0,
          admin: { width: "33%" },
        },
        {
          name: "wheels",
          label: "Hjulantal",
          type: "select",
          options: [
            { label: "3 hjul", value: "3" },
            { label: "4 hjul", value: "4" },
          ],
          admin: { width: "33%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "price",
          label: "Pris",
          type: "number",
          required: true,
          min: 0,
          admin: { width: "50%", description: "Exklusive moms." },
        },
        {
          name: "dealerDiscountPercent",
          label: "ÅF-rabatt (%)",
          type: "number",
          min: 0,
          max: 100,
          // The site reads it past access for signed-in dealers only; visitors never get it.
          access: { read: ({ req }) => isEditorUser(req.user) },
          admin: {
            width: "50%",
            step: 0.1,
            description: "Lämna tomt för den gemensamma rabatten.",
          },
        },
      ],
    },
    { name: "description", label: "Beskrivning", type: "textarea", localized: true },
    {
      type: "row",
      fields: [
        {
          name: "image",
          label: "Bild",
          type: "upload",
          relationTo: "images",
          admin: { width: "50%", description: "Frilagd bild på trucken." },
        },
        {
          name: "brochure",
          label: "Broschyr",
          type: "upload",
          relationTo: "documents",
          admin: { width: "50%", description: "Lämna tomt för trucktypens broschyr." },
        },
      ],
    },
    specsField({ dbName: "truck_model_specs", description: "Visas i offerten för modellen." }),
    {
      name: "equipmentSummary",
      type: "ui",
      admin: { components: { Field: `${ADMIN}/EquipmentSummary.tsx#EquipmentSummary` } },
    },
    {
      name: "optionImages",
      label: "Bilder med tillval",
      labels: { singular: "Bild", plural: "Bilder" },
      type: "array",
      dbName: "truck_model_option_images",
      localized: false,
      admin: {
        initCollapsed: true,
        description: "Bilden på trucken när kunden valt alternativet, till exempel med hytt.",
        components: { RowLabel: `${ADMIN}/RowLabels.tsx#OptionImageRowLabel` },
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "option",
              label: "Alternativ",
              type: "text",
              required: true,
              admin: {
                width: "50%",
                components: { Field: `${ADMIN}/OptionSelect.tsx#OptionSelect` },
              },
            },
            {
              name: "image",
              label: "Bild",
              type: "upload",
              relationTo: "images",
              required: true,
              admin: { width: "50%" },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateTruckFamily],
    afterDelete: [revalidateTruckFamilyDelete],
  },
  versions: {
    drafts: { autosave: { interval: 300 }, schedulePublish: true },
    maxPerDoc: 50,
  },
};
