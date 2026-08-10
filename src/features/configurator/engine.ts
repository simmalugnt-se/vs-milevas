import type {
  ConfiguratorCatalog,
  ConfiguratorFamily,
  ConfiguratorOption,
  ConfiguratorQuote,
  ConfiguratorSpecification,
  FinancingMethod,
  SelectionState,
} from "./types";

const selectionReference = (groupKey: string, optionKey: string) => `${groupKey}.${optionKey}`;

function selectedReferences(selections: SelectionState): Set<string> {
  return new Set(
    Object.entries(selections).flatMap(([groupKey, optionKeys]) =>
      optionKeys.map((optionKey) => selectionReference(groupKey, optionKey)),
    ),
  );
}

export function isOptionAvailable(option: ConfiguratorOption, selections: SelectionState): boolean {
  const selected = selectedReferences(selections);
  const { allOf, anyOf, noneOf } = option.conditions;

  if (allOf.some((reference) => !selected.has(reference))) {
    return false;
  }
  if (anyOf.length > 0 && !anyOf.some((reference) => selected.has(reference))) {
    return false;
  }
  return noneOf.every((reference) => !selected.has(reference));
}

export function sanitizeSelections(
  family: ConfiguratorFamily,
  input: SelectionState,
  applyDefaults = true,
): SelectionState {
  const next: SelectionState = {};

  for (const step of family.steps) {
    for (const group of step.groups) {
      const requested = input[group.key] ?? [];
      const available = group.options.filter((option) => isOptionAvailable(option, next));
      const availableKeys = new Set(available.map((option) => option.key));
      const uniqueRequested = [...new Set(requested)].filter((key) => availableKeys.has(key));
      const accepted =
        group.selectionMode === "single" ? uniqueRequested.slice(0, 1) : uniqueRequested;

      if (accepted.length > 0) {
        next[group.key] = accepted;
        continue;
      }

      if (applyDefaults) {
        const defaults = available
          .filter((option) => option.defaultSelected)
          .map((option) => option.key);
        const selectedDefaults = group.selectionMode === "single" ? defaults.slice(0, 1) : defaults;
        if (selectedDefaults.length > 0) {
          next[group.key] = selectedDefaults;
        }
      }
    }
  }

  return next;
}

export function firstIncompleteStep(
  family: ConfiguratorFamily,
  selections: SelectionState,
): number | null {
  for (const [stepIndex, step] of family.steps.entries()) {
    const incomplete = step.groups.some(
      (group) => group.required && (selections[group.key]?.length ?? 0) === 0,
    );
    if (incomplete) {
      return stepIndex;
    }
  }
  return null;
}

export function firstInvalidSelectionStep(
  family: ConfiguratorFamily,
  input: SelectionState,
  sanitized: SelectionState,
): number | null {
  const groupSteps = new Map(
    family.steps.flatMap((step, stepIndex) => step.groups.map((group) => [group.key, stepIndex])),
  );
  let firstInvalid: number | null = null;

  for (const [groupKey, requestedOptions] of Object.entries(input)) {
    const stepIndex = groupSteps.get(groupKey);
    if (stepIndex === undefined) {
      return 0;
    }
    const accepted = new Set(sanitized[groupKey] ?? []);
    if (requestedOptions.some((optionKey) => !accepted.has(optionKey))) {
      firstInvalid = firstInvalid === null ? stepIndex : Math.min(firstInvalid, stepIndex);
    }
  }

  return firstInvalid;
}

export function calculateFinancingPrice(total: number, financing: FinancingMethod): number {
  if (financing.kind === "purchase") {
    return total;
  }
  return Math.round(total * (financing.monthlyFactor ?? 0));
}

export function buildQuote(
  catalog: ConfiguratorCatalog,
  familyKey: string,
  inputSelections: SelectionState,
  financingKey: string,
  includeServiceAgreement = false,
): ConfiguratorQuote | null {
  const family = catalog.families.find((candidate) => candidate.key === familyKey);
  const financing = catalog.financingMethods.find((candidate) => candidate.key === financingKey);
  if (!family || !financing) {
    return null;
  }

  const selections = sanitizeSelections(family, inputSelections, true);
  if (firstIncompleteStep(family, selections) !== null) {
    return null;
  }

  let basePrice = family.basePrice;
  let baseLabel = family.name;
  let sku = family.sku;
  const additions: Array<{ key: string; label: string; price: number }> = [];
  const optionLines: ConfiguratorQuote["lines"] = [];
  const selectedOptions: ConfiguratorQuote["selectedOptions"] = [];
  const specifications: ConfiguratorSpecification[] = [];

  for (const step of family.steps) {
    for (const group of step.groups) {
      for (const optionKey of selections[group.key] ?? []) {
        const option = group.options.find((candidate) => candidate.key === optionKey);
        if (!option || !isOptionAvailable(option, selections)) {
          return null;
        }

        if (option.priceMode === "replaceBase") {
          basePrice = option.price;
          baseLabel = option.label;
        } else {
          const price = option.priceMode === "included" ? 0 : option.price;
          optionLines.push({
            key: selectionReference(group.key, option.key),
            label: option.label,
            price,
            kind: "option",
          });
        }

        if (option.priceMode === "add") {
          additions.push({
            key: selectionReference(group.key, option.key),
            label: option.label,
            price: option.price,
          });
        }

        if (option.sku) {
          sku = option.sku;
        }
        specifications.push(...option.specifications);
        selectedOptions.push({
          groupKey: group.key,
          optionKey: option.key,
          label: option.label,
          price: option.priceMode === "included" ? 0 : option.price,
          priceMode: option.priceMode,
        });
      }
    }
  }

  const totalPrice = basePrice + additions.reduce((sum, addition) => sum + addition.price, 0);
  const serviceAgreement =
    includeServiceAgreement && financing.serviceAgreementEligible
      ? catalog.serviceAgreement
      : undefined;

  return {
    familyKey: family.key,
    familyName: family.name,
    sku,
    selections,
    selectedOptions,
    lines: [
      { key: "base", label: `${family.name} - bas (${baseLabel})`, price: basePrice, kind: "base" },
      ...optionLines,
      ...(serviceAgreement
        ? [
            {
              key: "service-agreement",
              label: serviceAgreement.label,
              price: serviceAgreement.annualPrice,
              kind: "service" as const,
            },
          ]
        : []),
    ],
    specifications,
    totalPrice,
    financing,
    financingPrice: calculateFinancingPrice(totalPrice, financing),
    serviceAgreement,
    deliveryTime: family.deliveryTime,
    warranty: family.warranty,
    quoteValidityDays: catalog.quoteValidityDays,
  };
}

export function familyGroups(family: ConfiguratorFamily) {
  return family.steps.flatMap((step) => step.groups);
}
