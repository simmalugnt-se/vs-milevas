import type { Field } from "payload";
import { formatSlug } from "../utilities/formatSlug.ts";

type SlugSource = {
  fallbackField?: string;
  localized?: boolean;
};

export const slugField = ({
  fallbackField = "title",
  localized = false,
}: SlugSource = {}): Field => ({
  name: "slug",
  type: "text",
  localized,
  admin: {
    description:
      "Auto-generated from the title on first save. Change it manually only when you intentionally want a new URL.",
    position: "sidebar",
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, value }) => {
        const fallbackValue =
          data && typeof data[fallbackField] === "string" ? data[fallbackField] : "";

        const nextValue = typeof value === "string" && value.length > 0 ? formatSlug(value) : "";

        if (nextValue) {
          return nextValue;
        }

        const existingValue =
          originalDoc && typeof originalDoc.slug === "string" ? formatSlug(originalDoc.slug) : "";

        if (existingValue) {
          return existingValue;
        }

        return formatSlug(fallbackValue);
      },
    ],
  },
  index: true,
  required: true,
  unique: true,
});
