"use client";

import { FieldLabel, useAllFormFields, useForm } from "@payloadcms/ui";
import type { UIFieldClientComponent } from "payload";
import { reduceFieldsToValues } from "payload/shared";
import { useState } from "react";
import { useFamilyModels } from "./useFamilyModels";

type Option = { label?: string; models?: Array<string | { id: string }> | null };

const plain = (value: unknown) => (typeof value === "string" ? value.replaceAll("|", "") : "");
const ids = (models: Option["models"]) =>
  (models ?? []).map((model) => (typeof model === "object" ? model.id : model));

/** The value at a dotted path in the form's data: `equipment.0` → the first group. */
function at(data: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object") return (value as Record<string, unknown>)[key];
    return undefined;
  }, data);
}

/**
 * "Modeller" on a group: which models have each option, as a matrix of the options by the models.
 * An option every model has stores no models; while all do, the matrix stays folded. An option
 * keeps one model at least: its last can't be unticked. Under Utrustning the cell of each model's
 * first option, its default, is marked.
 */
export const ModelMatrix: UIFieldClientComponent = ({ path }) => {
  const groupPath = path.replace(/\.modelMatrix$/, "");
  const [fields, dispatchFields] = useAllFormFields();
  const { setModified } = useForm();
  const models = useFamilyModels();
  const [open, setOpen] = useState(false);
  const group = at(reduceFieldsToValues(fields, true), groupPath) as
    | { options?: Option[] }
    | undefined;
  const options = group?.options ?? [];
  const forAll = options.every((option) => ids(option.models).length === 0);
  const single = groupPath.startsWith("equipment");

  if (models.length === 0 || options.length === 0) return null;

  const has = (option: Option, model: string) => {
    const list = ids(option.models);
    return list.length === 0 || list.includes(model);
  };
  const toggle = (index: number, model: string) => {
    const option = options[index];
    const current = ids(option.models).length ? ids(option.models) : models.map((m) => m.id);
    const next = current.includes(model)
      ? current.filter((id) => id !== model)
      : [...current, model];
    // An option is for one model at least; one no model has is removed instead.
    if (next.length === 0) return;
    // Every model ticked is stored as none, so models added later have it too.
    const value = models.every((m) => next.includes(m.id)) ? [] : next;
    dispatchFields({ type: "UPDATE", path: `${groupPath}.options.${index}.models`, value });
    setModified(true);
  };
  const firstFor = (model: string) => options.findIndex((option) => has(option, model));

  return (
    <div className="field-type" style={{ marginBottom: "var(--base)" }}>
      <FieldLabel label="Modeller" path={path} />
      {forAll && !open ? (
        <p style={{ margin: 0 }}>
          Finns för alla {models.length} modeller.{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Välj modeller
          </button>
        </p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "13px", width: "100%" }}>
              <thead>
                <tr>
                  <th />
                  {models.map((model) => (
                    <th
                      key={model.id}
                      style={{
                        padding: "6px 4px",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: 1.3,
                        color: "var(--theme-elevation-500)",
                        width: "56px",
                        verticalAlign: "bottom",
                      }}
                    >
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {options.map((option, index) => (
                  <tr key={`${index}-${option.label}`}>
                    <td style={{ padding: "6px 12px 6px 0", minWidth: "140px" }}>
                      {plain(option.label) || `Alternativ ${index + 1}`}
                    </td>
                    {models.map((model) => (
                      <td
                        key={model.id}
                        style={{
                          padding: "6px 4px",
                          textAlign: "center",
                          border: "1px solid var(--theme-elevation-150)",
                          background:
                            single && firstFor(model.id) === index
                              ? "var(--theme-success-100)"
                              : undefined,
                        }}
                      >
                        <input
                          type="checkbox"
                          aria-label={`${plain(option.label)}, ${model.name}`}
                          checked={has(option, model.id)}
                          onChange={() => toggle(index, model.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="field-description" style={{ margin: "6px 0 0" }}>
            {single ? "Markerat: förvalt för modellen, det första alternativet den har. " : ""}
            Ett alternativ som ingen modell har tar du bort under Alternativ.
          </p>
        </>
      )}
    </div>
  );
};
