import type {
  ChoiceDisplay,
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorOption,
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
    selectionMode: "single",
    required: true,
    options: family.models.map((model) => ({
      key: model.key,
      label: model.label,
      description: model.sku,
      image: model.image,
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

/**
 * Whether an option can be chosen after what is chosen so far: for each step it sets a condition
 * on, the option chosen there is one it allows. `chosen` holds the earlier steps only, so a
 * condition on a later step, or on a step not chosen yet, holds.
 */
function conditionsHold(option: ConfiguratorOption, chosen: SelectionState): boolean {
  return Object.entries(option.availableFor ?? {}).every(([stepKey, allowed]) => {
    const picked = chosen[stepKey] ?? [];
    return picked.length === 0 || picked.some((key) => allowed.includes(key));
  });
}

/** The steps before `choice`, with what is chosen in them. */
function earlierSelections(
  family: ConfiguratorFamily,
  choice: ConfiguratorChoice,
  selections: SelectionState,
): SelectionState {
  const earlier: SelectionState = {};
  for (const step of familySteps(family)) {
    if (step.key === choice.key) break;
    if (selections[step.key]) earlier[step.key] = selections[step.key];
  }
  return earlier;
}

/** The options of a step the customer can choose from, after what is chosen in the steps before. */
export function availableOptions(
  family: ConfiguratorFamily,
  choice: ConfiguratorChoice,
  selections: SelectionState,
): ConfiguratorOption[] {
  const earlier = earlierSelections(family, choice, selections);
  return choice.options.filter((option) => conditionsHold(option, earlier));
}

/**
 * The selections as they can be: step by step, only options the steps before allow. A step with
 * nothing valid chosen gets its default, or its first allowed option when the default is not
 * allowed; an optional step stays empty.
 */
export function sanitizeSelections(
  family: ConfiguratorFamily,
  input: SelectionState,
  applyDefaults = true,
): SelectionState {
  const next: SelectionState = {};

  for (const choice of familySteps(family)) {
    const requested = input[choice.key] ?? [];
    const options = choice.options.filter((option) => conditionsHold(option, next));
    const keys = new Set(options.map((option) => option.key));
    const uniqueRequested = [...new Set(requested)].filter((key) => keys.has(key));
    const accepted =
      choice.selectionMode === "single" ? uniqueRequested.slice(0, 1) : uniqueRequested;

    if (accepted.length > 0) {
      next[choice.key] = accepted;
      continue;
    }

    if (applyDefaults) {
      const defaults = options.filter((option) => option.default).map((option) => option.key);
      // The default is not allowed after the steps before: the first one that is.
      if (
        defaults.length === 0 &&
        choice.selectionMode === "single" &&
        choice.options.some((option) => option.default) &&
        options[0]
      ) {
        defaults.push(options[0].key);
      }
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

/**
 * The method with its term: `months` if it is one of its terms, else its default, or the nearest
 * term to the default when the default is not one of them.
 */
export function withTerm(financing: FinancingMethod, months?: number): FinancingMethod {
  const terms = financing.terms ?? [];
  if (financing.kind !== "monthly" || terms.length === 0) return financing;
  if (months && terms.includes(months)) return { ...financing, months };
  const fallback = financing.months ?? terms[0];
  const nearest = terms.reduce((best, term) =>
    Math.abs(term - fallback) < Math.abs(best - fallback) ? term : best,
  );
  return { ...financing, months: nearest };
}

/**
 * The price for a way to pay: the total to buy, or a month's cost over its term. Placeholder until
 * the real calculation is decided: the total less the residual value, spread evenly over the
 * months, with no interest.
 * TODO(financing): the real calculation, once the customer has said how it is done.
 */
export function calculateFinancingPrice(total: number, financing: FinancingMethod): number {
  if (financing.kind === "purchase") {
    return total;
  }
  const { months, residualPercent = 0 } = withTerm(financing, financing.months);
  if (!months) return 0;
  return Math.round((total * (1 - residualPercent / 100)) / months);
}

/** "Leasing (60 mån)", with "restvärde 10 %" too when asked for. */
export function financingLabel(financing: FinancingMethod, { residual = false } = {}): string {
  const details = [
    financing.kind === "monthly" && financing.months ? `${financing.months} mån` : "",
    residual && financing.kind === "monthly" && financing.residualPercent
      ? `restvärde ${new Intl.NumberFormat("sv-SE").format(financing.residualPercent)} %`
      : "",
  ].filter(Boolean);
  return details.length ? `${financing.label} (${details.join(", ")})` : financing.label;
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
  /**
   * A call request may carry what is chosen so far; an order needs every step. `months` is the
   * chosen term of a monthly method; one it does not offer gives its default.
   */
  { allowIncomplete = false, months }: { allowIncomplete?: boolean; months?: number } = {},
): ConfiguratorQuote | null {
  const family = catalog.families.find((candidate) => candidate.key === familyKey);
  const method = catalog.financingMethods.find((candidate) => candidate.key === financingKey);
  const financing = method ? withTerm(method, months) : undefined;
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
