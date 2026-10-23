import type { Field, RelationshipField } from "payload";

/** The truck family a block shows: its name, image, specifications, prices and link. */
export const familyField: RelationshipField = {
  name: "family",
  label: "Truckfamilj",
  type: "relationship",
  relationTo: "truck-families",
  admin: { description: "Namn, bild och priser ändras i truckfamiljen." },
};

export const sectionID: Field = {
  name: "anchor",
  label: "Ankare",
  type: "text",
  admin: { description: "Valfritt, för länkar inom sidan. Exempel: modeller (utan #)." },
  validate: (value: unknown) =>
    !value || (typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value))
      ? true
      : "Använd gemener, siffror och bindestreck; börja med en bokstav.",
};
