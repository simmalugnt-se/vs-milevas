import type {
  ChoiceDisplay,
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorQuote,
  ConfiguratorSpecification,
  FinancingMethod,
  SelectionState,
  SpecValue,
} from "./types";

/** The model is the first step; its selection is kept under this key, like a choice's. */
export const MODEL_CHOICE = "model";

const selectionReference = (choiceKey: string, optionKey: string) => `${choiceKey}.${optionKey}`;

/**
 * The configurator's steps for a family: the models as the first choice, then the family's
 * choices in order. A model's option carries its price, which the choices add to.
 */
export function familySteps(family: ConfiguratorFamily): ConfiguratorChoice[] {
  if (!family.configurable || family.models.length === 0) return [];
  const modelChoice: ConfiguratorChoice = {
    key: MODEL_CHOICE,
    label: family.modelChoice.label,
    heading: family.modelChoice.heading,
    selectionMode: "single",
    required: true,
    options: family.models.map((model) => ({
      key: model.key,
      label: model.label,
      description: model.sku,
      price: model.price,
      default: model.default,
      sku: model.sku,
      specs: model.specs,
    })),
  };
  return [modelChoice, ...family.choices];
}

/** The step type: the choice's own, or one the content suggests. */
export function choiceDisplay(choice: ConfiguratorChoice): ChoiceDisplay {
  if (choice.display) return choice.display;
  if (choice.options.some((option) => option.image)) {
    return choice.options.length > 3 ? "images" : "imageRows";
  }
  if (choice.options.length > 2) {
    return choice.options.some((option) => option.description) ? "grid" : "prices";
  }
  return "stack";
}

export function sanitizeSelections(
  family: ConfiguratorFamily,
  input: SelectionState,
  applyDefaults = true,
): SelectionState {
  const next: SelectionState = {};

  for (const choice of familySteps(family)) {
    const requested = input[choice.key] ?? [];
    const keys = new Set(choice.options.map((option) => option.key));
    const uniqueRequested = [...new Set(requested)].filter((key) => keys.has(key));
    const accepted =
      choice.selectionMode === "single" ? uniqueRequested.slice(0, 1) : uniqueRequested;

    if (accepted.length > 0) {
      next[choice.key] = accepted;
      continue;
    }

    if (applyDefaults) {
      const defaults = choice.options
        .filter((option) => option.default)
        .map((option) => option.key);
      const selectedDefaults = choice.selectionMode === "single" ? defaults.slice(0, 1) : defaults;
      if (selectedDefaults.length > 0) {
        next[choice.key] = selectedDefaults;
      }
    }
  }

  return next;
}

/** Whether a step is done: it is optional or something is chosen. */
export function choiceSatisfied(choice: ConfiguratorChoice, selections: SelectionState): boolean {
  return !choice.required || (selections[choice.key]?.length ?? 0) > 0;
}

export function firstIncompleteStep(
  family: ConfiguratorFamily,
  selections: SelectionState,
): number | null {
  for (const [stepIndex, choice] of familySteps(family).entries()) {
    if (!choiceSatisfied(choice, selections)) {
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
  const stepOf = new Map(familySteps(family).map((choice, stepIndex) => [choice.key, stepIndex]));
  let firstInvalid: number | null = null;

  for (const [choiceKey, requestedOptions] of Object.entries(input)) {
    const stepIndex = stepOf.get(choiceKey);
    if (stepIndex === undefined) {
      return 0;
    }
    const accepted = new Set(sanitized[choiceKey] ?? []);
    if (requestedOptions.some((optionKey) => !accepted.has(optionKey))) {
      firstInvalid = firstInvalid === null ? stepIndex : Math.min(firstInvalid, stepIndex);
    }
  }

  return firstInvalid;
}

/** Each chosen option, step by step. */
function chosenOptions(family: ConfiguratorFamily, selections: SelectionState) {
  return familySteps(family).flatMap((choice) =>
    (selections[choice.key] ?? []).flatMap((optionKey) => {
      const option = choice.options.find((candidate) => candidate.key === optionKey);
      return option ? [{ choice, option }] : [];
    }),
  );
}

/**
 * The price of what is chosen so far, for the total shown while configuring: the model plus the
 * options. Unlike `buildQuote` it does not need every step complete.
 */
export function estimateTotal(family: ConfiguratorFamily, selections: SelectionState): number {
  return chosenOptions(family, selections).reduce((sum, { option }) => sum + option.price, 0);
}

export function calculateFinancingPrice(total: number, financing: FinancingMethod): number {
  if (financing.kind === "purchase") {
    return total;
  }
  return Math.round(total * (financing.monthlyFactor ?? 0));
}

/**
 * The specifications as the quote lists them: the family's, overridden by the model's and then by
 * the options', in the order of `TRUCK_SPECS`, each value with its unit.
 */
export function resolveSpecifications(
  catalog: Pick<ConfiguratorCatalog, "specs">,
  layers: SpecValue[][],
): ConfiguratorSpecification[] {
  const values = new Map<string, string>();
  for (const layer of layers) {
    for (const { spec, value } of layer) values.set(spec, value);
  }
  return [...catalog.specs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((spec) => {
      const value = values.get(spec.key);
      if (!value) return [];
      const withUnit = spec.unit && !value.endsWith(spec.unit) ? `${value} ${spec.unit}` : value;
      return [{ label: spec.label, value: withUnit }];
    });
}

export function buildQuote(
  catalog: ConfiguratorCatalog,
  familyKey: string,
  inputSelections: SelectionState,
  financingKey: string,
  includeServiceAgreement = false,
  /** A call request may carry what is chosen so far; an order needs every step. */
  { allowIncomplete = false }: { allowIncomplete?: boolean } = {},
): ConfiguratorQuote | null {
  const family = catalog.families.find((candidate) => candidate.key === familyKey);
  const financing = catalog.financingMethods.find((candidate) => candidate.key === financingKey);
  if (!family || !financing || familySteps(family).length === 0) {
    return null;
  }

  const selections = sanitizeSelections(family, inputSelections, true);
  const complete = firstIncompleteStep(family, selections) === null;
  if (!complete && !allowIncomplete) {
    return null;
  }

  const chosen = chosenOptions(family, selections);
  const model = family.models.find((candidate) => candidate.key === selections[MODEL_CHOICE]?.[0]);
  const options = chosen.filter(({ choice }) => choice.key !== MODEL_CHOICE);
  const sku = [...options].reverse().find(({ option }) => option.sku)?.option.sku ?? model?.sku;
  const totalPrice = chosen.reduce((sum, { option }) => sum + option.price, 0);
  const serviceAgreement =
    includeServiceAgreement && financing.serviceAgreementEligible
      ? catalog.serviceAgreement
      : undefined;

  return {
    complete,
    familyKey: family.key,
    familyName: family.name,
    familySingularName: family.singularName,
    modelKey: model?.key,
    sku,
    selections,
    selectedOptions: chosen.map(({ choice, option }) => ({
      groupKey: choice.key,
      optionKey: option.key,
      label: option.label,
      price: option.price,
    })),
    lines: [
      ...(model
        ? [
            {
              key: "base",
              label: `${family.name} – bas (${model.label})`,
              price: model.price,
              kind: "base" as const,
            },
          ]
        : []),
      ...options.map(({ choice, option }) => ({
        key: selectionReference(choice.key, option.key),
        label: option.label,
        price: option.price,
        kind: "option" as const,
      })),
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
    specifications: resolveSpecifications({ specs: catalog.specs.filter((spec) => spec.inQuote) }, [
      family.specs,
      ...chosen.map(({ option }) => option.specs),
    ]),
    totalPrice,
    financing,
    financingPrice: calculateFinancingPrice(totalPrice, financing),
    serviceAgreement,
    deliveryTime: family.deliveryTime,
    warranty: family.warranty,
    quoteValidityDays: catalog.quoteValidityDays,
  };
}
