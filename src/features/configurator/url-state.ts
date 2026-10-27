import { familySteps } from "./engine";
import type { ConfiguratorFamily, SelectionState } from "./types";

export type ParsedConfiguratorUrl = {
  familyKey?: string;
  financingKey?: string;
  /** The chosen term of a monthly way to pay. */
  months?: number;
  serviceAgreement: boolean;
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
  const rawMonths = Number.parseInt(params.get("months") ?? "", 10);
  return {
    familyKey: params.get("family") || undefined,
    financingKey: params.get("financing") || undefined,
    months: Number.isFinite(rawMonths) && rawMonths > 0 ? rawMonths : undefined,
    serviceAgreement: params.get("serviceAgreement") === "1",
    selections: parseSelectionReferences(params.getAll("selection")),
    step: Number.isFinite(rawStep) && rawStep >= 0 ? rawStep : undefined,
  };
}

export function buildConfiguratorSearchParams({
  family,
  selections,
  financingKey,
  months,
  serviceAgreement = false,
  step,
}: {
  family?: ConfiguratorFamily;
  selections: SelectionState;
  financingKey?: string;
  months?: number;
  serviceAgreement?: boolean;
  step?: number;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (family) {
    params.set("family", family.key);
    for (const choice of familySteps(family)) {
      for (const optionKey of selections[choice.key] ?? []) {
        params.append("selection", `${choice.key}.${optionKey}`);
      }
    }
  }
  if (financingKey) {
    params.set("financing", financingKey);
    if (months) params.set("months", String(months));
  }
  if (serviceAgreement) {
    params.set("serviceAgreement", "1");
  }
  if (typeof step === "number") {
    params.set("step", String(step));
  }
  return params;
}
