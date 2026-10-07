import type { Field, GroupField } from "payload";
import { link } from "../fields/link";

/** A family supplies the name, image, prices and configurator link; editorial overrides are optional. */
export const familyField: Field = {
  name: "family",
  label: "Truckfamilj",
  type: "relationship",
  relationTo: "truck-families",
  admin: { description: "Valfritt. Hämtar namn, bild och priser från konfiguratorn." },
};

export const editorialLink = (): GroupField => ({
  ...(link() as GroupField),
  admin: { hideGutter: true, condition: (_, siblingData) => !siblingData?.family },
});

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
