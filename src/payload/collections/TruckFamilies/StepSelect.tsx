"use client";

import { SelectInput, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useStepChoices } from "./useStepChoices";

/** A step in "Steg i konfiguratorn": a field of the models, or a group under Utrustning. */
export const StepSelect: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path });
  const choices = useStepChoices();
  const options = choices.map(({ value: key, label, source }) => ({
    label: `${label} (${source})`,
    value: key,
  }));
  if (value && !choices.some((choice) => choice.value === value)) {
    options.push({ label: "Borttagen grupp", value });
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
