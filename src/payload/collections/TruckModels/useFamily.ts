"use client";

import { useFormFields } from "@payloadcms/ui";
import { useEffect, useState } from "react";

export type FamilyOption = { id: string; label: string; models: string[] };
export type FamilyGroup = { id: string; label: string; options: FamilyOption[] };
export type Family = { id: string; series: string[]; groups: FamilyGroup[] };

type Saved = {
  id: string;
  series?: Array<{ name?: string }>;
  choices?: SavedGroup[];
};
type SavedGroup = {
  id?: string;
  /** "own" or none for a group; a step from the models' fields has no options. */
  kind?: string | null;
  label?: string;
  options?: Array<{
    id?: string;
    label?: string;
    models?: Array<string | { id: string }> | null;
    specs?: Array<{ value?: string }> | null;
  }>;
};

const plain = (value: unknown) => (typeof value === "string" ? value.replaceAll("|", "") : "");

/** One request per truck type for every field that asks at once, kept a moment. */
const requests = new Map<string, Promise<Family | null>>();

function fetchFamily(id: string): Promise<Family | null> {
  const pending = requests.get(id);
  if (pending) return pending;
  // The whole document: `select` leaves out relationships inside arrays (the options' models).
  const query = new URLSearchParams({ depth: "0", draft: "true" });
  const groups = (list: SavedGroup[] | undefined) =>
    (list ?? []).flatMap((group) =>
      group.id && (!group.kind || group.kind === "own")
        ? [
            {
              id: group.id,
              label: plain(group.label) || "Val",
              options: (group.options ?? []).flatMap((option) => {
                if (!option.id) return [];
                // Options of the same name are told apart by their values ("150 Ah").
                const values = (option.specs ?? []).map((spec) => spec.value).filter(Boolean);
                const twin = (group.options ?? []).some(
                  (other) => other !== option && other.label === option.label,
                );
                return [
                  {
                    id: option.id,
                    label: [plain(option.label), twin && values.join(", ")]
                      .filter(Boolean)
                      .join(" · "),
                    models: (option.models ?? []).map((m) => (typeof m === "object" ? m.id : m)),
                  },
                ];
              }),
            },
          ]
        : [],
    );
  const request = fetch(`/api/truck-families/${id}?${query}`, { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .then((doc: Saved | null) =>
      doc
        ? {
            id: doc.id,
            series: (doc.series ?? []).map((row) => row.name ?? "").filter(Boolean),
            groups: groups(doc.choices),
          }
        : null,
    )
    .catch(() => null)
    .finally(() => setTimeout(() => requests.delete(id), 2000));
  requests.set(id, request);
  return request;
}

/** The model's truck type, as saved: its series and its groups with the models of each option. */
export function useFamily() {
  const value = useFormFields(([fields]) => fields.family?.value);
  const id = typeof value === "object" && value ? (value as { id?: string }).id : value;
  const [family, setFamily] = useState<Family | null>(null);
  useEffect(() => {
    if (typeof id !== "string" || !id) return;
    let current = true;
    void fetchFamily(id).then((found) => {
      if (current) setFamily(found);
    });
    return () => {
      current = false;
    };
  }, [id]);
  return family;
}

/** Whether a model has an option: every model has one that lists none. */
export const hasOption = (option: FamilyOption, model: string | undefined) =>
  option.models.length === 0 || (model !== undefined && option.models.includes(model));
