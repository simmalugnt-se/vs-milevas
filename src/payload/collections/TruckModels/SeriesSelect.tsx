"use client";

import { SelectInput, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useFamily } from "./useFamily";

/** "Serie": one of the truck type's series, so it is written the same on every model. */
export const SeriesSelect: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path });
  const family = useFamily();
  const series = family?.series ?? [];
  const options = series.map((name) => ({ label: name, value: name }));
  if (value && !series.includes(value)) options.push({ label: value, value });
  return (
    <SelectInput
      path={path}
      name={field.name}
      label={field.label}
      description={series.length ? undefined : "Lägg till serier under trucktypens Modeller."}
      options={options}
      value={value ?? undefined}
      showError={showError}
      onChange={(option) => {
        const next = Array.isArray(option) ? option[0] : option;
        setValue(next && typeof next === "object" && "value" in next ? String(next.value) : null);
      }}
    />
  );
};
