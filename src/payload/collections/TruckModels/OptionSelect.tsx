"use client";

import { SelectInput, useDocumentInfo, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { hasOption, useFamily } from "./useFamily";

/** "Alternativ" in Bilder med tillval: one of the options this model has, as "Hytt: Med hytt". */
export const OptionSelect: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path });
  const { id } = useDocumentInfo();
  const family = useFamily();
  const options = (family?.groups ?? []).flatMap((group) =>
    group.options
      .filter((option) => hasOption(option, id ? String(id) : undefined))
      .map((option) => ({ label: `${group.label}: ${option.label}`, value: option.id })),
  );
  if (value && family && !options.some((option) => option.value === value)) {
    options.push({ label: "Alternativ som modellen inte har", value });
  }
  return (
    <SelectInput
      path={path}
      name={field.name}
      label={field.label}
      required={field.required}
      options={options}
      value={value ?? undefined}
      showError={showError}
      isClearable={false}
      onChange={(option) => {
        const next = Array.isArray(option) ? option[0] : option;
        setValue(next && typeof next === "object" && "value" in next ? String(next.value) : null);
      }}
    />
  );
};
