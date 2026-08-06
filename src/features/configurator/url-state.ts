import type { ConfiguratorFamily, SelectionState } from "./types";

export type ParsedConfiguratorUrl = {
  familyKey?: string;
  financingKey?: string;
  selections: SelectionState;
  step?: number;
};

export function parseSelectionReferences(references: string[]): SelectionState {
  const selections: SelectionState = {};
  for (const reference of references) {
    const separator = reference.indexOf(".");
    if (separator <= 0 || separator === reference.length - 1) {
      continue;
    }
    const groupKey = reference.slice(0, separator);
    const optionKey = reference.slice(separator + 1);
    selections[groupKey] = [...new Set([...(selections[groupKey] ?? []), optionKey])];
  }
  return selections;
}

export function parseConfiguratorSearchParams(params: URLSearchParams): ParsedConfiguratorUrl {
  const rawStep = Number.parseInt(params.get("step") ?? "", 10);
  return {
    familyKey: params.get("family") || undefined,
    financingKey: params.get("financing") || undefined,
    selections: parseSelectionReferences(params.getAll("selection")),
    step: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : undefined,
  };
}

export function buildConfiguratorSearchParams({
  family,
  selections,
  financingKey,
  step,
}: {
  family?: ConfiguratorFamily;
  selections: SelectionState;
  financingKey?: string;
  step?: number;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (family) {
    params.set("family", family.key);
    for (const configStep of family.steps) {
      for (const group of configStep.groups) {
        for (const optionKey of selections[group.key] ?? []) {
          params.append("selection", `${group.key}.${optionKey}`);
        }
      }
    }
  }
  if (financingKey) {
    params.set("financing", financingKey);
  }
  if (typeof step === "number") {
    params.set("step", String(step));
  }
  return params;
}
