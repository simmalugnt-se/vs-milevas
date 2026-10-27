"use client";

import { CheckboxInput, FieldLabel, useAllFormFields, useField } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";
import { reduceFieldsToValues } from "payload/shared";
import { CHOICE_STEPS, MODEL_STEP } from "@/features/configurator/steps";
import {
  type AvailableFor as AvailableForValue,
  CONDITION_LISTS,
  type ConditionList,
  type ConditionRow,
  conditionRowLabel,
  readAvailableFor,
} from "./conditions";
import { useStepOrder } from "./useStepOrder";

/**
 * "Visas för" on a battery, mast or extra: a checkbox per lift capacity, battery and mast the
 * customer chooses before this step, in the settings' order, read from the form as it is edited.
 * All checked in a list is no condition, so rows added there later are included; unchecking one
 * stores the ids still checked. Lists with a single row are part of the truck and set none.
 */
export const AvailableFor: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<AvailableForValue | null>({ path });
  const [fields] = useAllFormFields();
  const data = reduceFieldsToValues(fields, true) as Record<string, unknown>;
  const order = useStepOrder();

  const ownList = path.split(".")[0];
  const ownStep = [MODEL_STEP, ...CHOICE_STEPS].find((step) => step.list === ownList)?.key;
  const ownIndex = order.findIndex((step) => step.step === ownStep);
  const rows = (list: ConditionList) =>
    (Array.isArray(data[list]) ? (data[list] as ConditionRow[]) : []).filter(
      (row): row is ConditionRow & { id: string } => typeof row.id === "string",
    );
  const sources = CONDITION_LISTS.filter((source) => {
    const index = order.findIndex((step) => step.step === source.step);
    return (
      source.list !== ownList && index !== -1 && index < ownIndex && rows(source.list).length > 1
    );
  });
  if (sources.length === 0) return null;

  const conditions = readAvailableFor(value);
  const toggle = (list: ConditionList, id: string) => {
    const all = rows(list).map((row) => row.id);
    const checked = conditions[list] ?? all;
    const next = checked.includes(id) ? checked.filter((key) => key !== id) : [...checked, id];
    const updated: AvailableForValue = { ...conditions, [list]: next };
    if (all.every((key) => next.includes(key))) delete updated[list];
    setValue(Object.keys(updated).length > 0 ? updated : null);
  };

  return (
    <div className="field-type" style={{ marginBottom: "var(--base)" }}>
      <FieldLabel label="Visas för" path={path} />
      {sources.map((source) => {
        const label = order.find((step) => step.step === source.step)?.label ?? source.label;
        const checked = conditions[source.list];
        return (
          <fieldset
            key={source.list}
            style={{ border: 0, margin: "0 0 calc(var(--base) * 0.4)", padding: 0 }}
          >
            <legend style={{ color: "var(--theme-elevation-500)", padding: 0 }}>{label}</legend>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "calc(var(--base) * 0.4) var(--base)",
              }}
            >
              {rows(source.list).map((row) => (
                <CheckboxInput
                  key={row.id}
                  id={`${path}-${source.list}-${row.id}`}
                  label={conditionRowLabel(source.list, row)}
                  checked={!checked || checked.includes(row.id)}
                  onToggle={() => toggle(source.list, row.id)}
                />
              ))}
            </div>
          </fieldset>
        );
      })}
      <p className="field-description" style={{ margin: 0 }}>
        Raden visas bara när kunden valt något som är ikryssat. Allt ikryssat i en grupp är inget
        villkor, och rader som läggs till där senare kommer med.
      </p>
    </div>
  );
};
