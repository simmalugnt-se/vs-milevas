import { serviceHourlyRate } from "./service-rates";
import { isModelStep, type ModelStep, modelStepLabel, propertyValue } from "./steps";
import type {
  ChoiceDisplay,
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorImage,
  ConfiguratorModel,
  ConfiguratorOption,
  ConfiguratorQuote,
  ConfiguratorSpecification,
  FinancingMethod,
  SelectionState,
  SpecValue,
} from "./types";

const selectionReference = (choiceKey: string, optionKey: string) => `${choiceKey}.${optionKey}`;

/** Whether the family can be configured: it has published models, which are what is priced. */
export const isConfigurable = (family: ConfiguratorFamily) =>
  family.configurable && family.models.length > 0;

/** The model the configuration starts at: the family's default, or the cheapest. */
export function defaultModelKey(family: ConfiguratorFamily): string | undefined {
  if (family.models.some((model) => model.key === family.defaultModel)) return family.defaultModel;
  return cheapest(family.models)?.key;
}

/** A model's value in a step from the models: its capacity, wheels or series, or itself. */
function stepValue(step: ModelStep, model: ConfiguratorModel) {
  if (step === "model") return { key: model.key, label: model.label };
  return propertyValue(step, model);
}

/**
 * The steps' keys in order: the editor's (`order`), a model field's or a group's; the groups left
 * out of it follow. Without a Modell step, it follows the last model field (or comes first); it is
 * no step while the steps before point at one model.
 */
function stepKeys(family: ConfiguratorFamily): string[] {
  const groups = new Set(family.choices.map((choice) => choice.key));
  const keys = family.order.filter(
    (key, index, all) => (isModelStep(key) || groups.has(key)) && all.indexOf(key) === index,
  );
  for (const choice of family.choices) if (!keys.includes(choice.key)) keys.push(choice.key);
  if (!keys.includes("model")) {
    const last = keys.reduce((at, key, index) => (isModelStep(key) ? index : at), -1);
    keys.splice(last + 1, 0, "model");
  }
  return keys;
}

/** The model fields among the steps, in order. */
const modelFieldSteps = (family: ConfiguratorFamily) => stepKeys(family).filter(isModelStep);

/**
 * A step from the models' fields: each value the models have once, numbers by size and a series by
 * its lowest price; or each model, with its text and photo. The default model's is preselected.
 */
function modelStepChoice(family: ConfiguratorFamily, step: ModelStep): ConfiguratorChoice {
  const start = family.models.find((model) => model.key === defaultModelKey(family));
  const startKey = start ? stepValue(step, start)?.key : undefined;
  const values = new Map<string, { option: ConfiguratorOption; low: number }>();
  for (const model of family.models) {
    const value = stepValue(step, model);
    if (!value) continue;
    const known = values.get(value.key);
    values.set(value.key, {
      option: known?.option ?? {
        key: value.key,
        label: value.label,
        price: 0,
        default: value.key === startKey,
        specs: [],
        ...(step === "model" ? { description: model.description, image: model.image } : {}),
        ...(step === "series" ? { description: family.seriesTexts?.[value.label] } : {}),
      },
      low: Math.min(known?.low ?? Number.POSITIVE_INFINITY, model.price),
    });
  }
  const keys = [...values.keys()];
  if (step === "series" || step === "model") {
    keys.sort((a, b) => (values.get(a)?.low ?? 0) - (values.get(b)?.low ?? 0));
  } else {
    keys.sort((a, b) => Number(a) - Number(b));
  }
  return {
    key: step,
    label: modelStepLabel(step),
    modelStep: step,
    selectionMode: "single",
    required: true,
    options: keys.flatMap((key) => values.get(key)?.option ?? []),
  };
}

/**
 * The configurator's steps for a family, in its order: steps from the models' fields (lift
 * capacity, wheels, series, the model) and the truck type's groups of options ("Val").
 */
export function familySteps(family: ConfiguratorFamily): ConfiguratorChoice[] {
  if (!isConfigurable(family)) return [];
  const groups = new Map(family.choices.map((choice) => [choice.key, choice]));
  return stepKeys(family).flatMap((key) =>
    isModelStep(key) ? [modelStepChoice(family, key)] : (groups.get(key) ?? []),
  );
}

/**
 * The models that fit what is chosen: the values chosen in the steps from the models' fields, and
 * each chosen option that only some models have.
 */
export function modelsLeft(
  family: ConfiguratorFamily,
  selections: SelectionState,
): ConfiguratorModel[] {
  return family.models.filter(
    (model) =>
      modelFieldSteps(family).every((step) => {
        const picked = selections[step] ?? [];
        return picked.length === 0 || picked.includes(stepValue(step, model)?.key ?? "");
      }) &&
      family.choices.every((choice) =>
        (selections[choice.key] ?? []).every((key) => {
          const models = choice.options.find((option) => option.key === key)?.models;
          return !models || models.includes(model.key);
        }),
      ),
  );
}

function cheapest(models: ConfiguratorModel[]) {
  return models.reduce<ConfiguratorModel | undefined>(
    (low, model) => (!low || model.price < low.price ? model : low),
    undefined,
  );
}

/**
 * The model chosen: the one the steps point at, or while they do not yet, the cheapest of those
 * left. It gives the base price, the article number and the dealer discount.
 */
export function chosenModel(
  family: ConfiguratorFamily,
  selections: SelectionState,
): ConfiguratorModel | undefined {
  return cheapest(modelsLeft(family, selections));
}

/** The step type: the choice's own, its "Kolumner", or one the content suggests. */
export function choiceDisplay(choice: ConfiguratorChoice): ChoiceDisplay {
  if (choice.display) return choice.display;
  // "Kolumner": one column with the photo on the right, or two with the photo between title and
  // text, when any option has a photo (Figma's types 4 and 3), else types 2 and 1.
  const pictured = choice.options.some((option) => option.image);
  if (choice.columns === "one") return pictured ? "imageRows" : "stack";
  if (choice.columns === "two") return pictured ? "images" : "grid";
  // Automatic: a single choice without photos stacks as Figma's type 2; else the content decides.
  if (choice.columns === "auto" && choice.selectionMode === "single" && !pictured) return "stack";
  if (pictured) {
    return choice.options.length > 3 ? "images" : "imageRows";
  }
  if (choice.options.length > 2) {
    return choice.options.some((option) => option.description) ? "grid" : "prices";
  }
  return "stack";
}

/**
 * Whether an option can be chosen after what is chosen so far (`chosen`, the earlier steps only):
 * a model field's value when a model left has it; a group's option, when only some models have it,
 * when one of them is left.
 */
function optionAllowed(
  family: ConfiguratorFamily,
  choice: ConfiguratorChoice,
  option: ConfiguratorOption,
  chosen: SelectionState,
): boolean {
  if (choice.modelStep) {
    return modelsLeft(family, { ...chosen, [choice.key]: [option.key] }).length > 0;
  }
  const { models } = option;
  return !models || modelsLeft(family, chosen).some((model) => models.includes(model.key));
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

/**
 * The options of a step the customer can choose from, after what is chosen in the steps before. In
 * a step from the models' fields each value comes with the price of the cheapest model with it
 * ("1,6 ton", "Från 176 900 kr"), and as its text the series' own, or the names of the models
 * with it and the one model's text.
 */
export function availableOptions(
  family: ConfiguratorFamily,
  choice: ConfiguratorChoice,
  selections: SelectionState,
): ConfiguratorOption[] {
  const earlier = earlierSelections(family, choice, selections);
  const options = choice.options.filter((option) => optionAllowed(family, choice, option, earlier));
  const now = cheapest(modelsLeft(family, earlier));
  if (!choice.modelStep || !now) return options;
  return options.map((option) => {
    const models = modelsLeft(family, { ...earlier, [choice.key]: [option.key] });
    const model = cheapest(models) ?? now;
    // A model's or a series' own text; else the models' names, and the text of the one model
    // ("EP 16-N01 — Batteri Li-Ion 24 V / 20 Ah").
    const names = models.map((candidate) => candidate.label).join(" / ");
    const only = models.length === 1 ? models[0] : undefined;
    return {
      ...option,
      description:
        choice.modelStep === "model" || option.description
          ? option.description
          : only?.description
            ? `${names} — ${only.description}`
            : names,
      price: model.price,
    };
  });
}

/**
 * The steps the customer sees after what is chosen so far: a step with nothing to choose from is
 * left out, and so is one with a single option to choose (a lone battery, the wheels once the
 * capacity has one), which is chosen for the customer and part of the truck.
 */
export function visibleSteps(
  family: ConfiguratorFamily,
  selections: SelectionState,
): ConfiguratorChoice[] {
  return familySteps(family).filter((choice) => {
    const count = availableOptions(family, choice, selections).length;
    return choice.selectionMode === "multiple" ? count > 0 : count > 1;
  });
}

/**
 * The visible steps by screen: a step marked "Visa med föregående steg" shares the screen of the
 * visible step before it, or has its own when it is the first.
 */
export function stepScreens(
  family: ConfiguratorFamily,
  selections: SelectionState,
): ConfiguratorChoice[][] {
  const withPrevious = new Set(family.withPrevious ?? []);
  const screens: ConfiguratorChoice[][] = [];
  for (const choice of visibleSteps(family, selections)) {
    const last = screens.at(-1);
    if (last && withPrevious.has(choice.key)) last.push(choice);
    else screens.push([choice]);
  }
  return screens;
}

/**
 * The selections as they can be: step by step, only options the steps before allow. A single
 * choice with nothing valid chosen gets its default: in a step from the models' fields the default
 * model's value, in a group the first option the models left have; an optional step stays empty.
 */
export function sanitizeSelections(
  family: ConfiguratorFamily,
  input: SelectionState,
  applyDefaults = true,
): SelectionState {
  const next: SelectionState = {};

  for (const choice of familySteps(family)) {
    const requested = input[choice.key] ?? [];
    const options = choice.options.filter((option) => optionAllowed(family, choice, option, next));
    const keys = new Set(options.map((option) => option.key));
    const uniqueRequested = [...new Set(requested)].filter((key) => keys.has(key));
    const accepted =
      choice.selectionMode === "single" ? uniqueRequested.slice(0, 1) : uniqueRequested;

    if (accepted.length > 0) {
      next[choice.key] = accepted;
      continue;
    }
    if (choice.selectionMode === "multiple") continue;

    // The only option there is: part of the truck, chosen with or without defaults.
    if (options.length === 1 && options[0]) {
      next[choice.key] = [options[0].key];
      continue;
    }

    if (applyDefaults) {
      const pick = options.find((option) => option.default) ?? options[0];
      if (pick) next[choice.key] = [pick.key];
    }
  }

  return next;
}

/** Whether a step is done: it is optional or something is chosen. */
export function choiceSatisfied(choice: ConfiguratorChoice, selections: SelectionState): boolean {
  return !choice.required || (selections[choice.key]?.length ?? 0) > 0;
}

/** The first screen with a visible step not done, by its place among the screens. */
export function firstIncompleteStep(
  family: ConfiguratorFamily,
  selections: SelectionState,
): number | null {
  for (const [screenIndex, screen] of stepScreens(family, selections).entries()) {
    if (screen.some((choice) => !choiceSatisfied(choice, selections))) {
      return screenIndex;
    }
  }
  return null;
}

/**
 * The first screen with a visible step where something asked for was dropped, by its place among
 * the screens; a step the family does not have at all is the first.
 */
export function firstInvalidSelectionStep(
  family: ConfiguratorFamily,
  input: SelectionState,
  sanitized: SelectionState,
): number | null {
  const known = new Set(familySteps(family).map((choice) => choice.key));
  const stepOf = new Map(
    stepScreens(family, sanitized).flatMap((screen, screenIndex) =>
      screen.map((choice) => [choice.key, screenIndex] as const),
    ),
  );
  let firstInvalid: number | null = null;

  for (const [choiceKey, requestedOptions] of Object.entries(input)) {
    if (!known.has(choiceKey)) {
      return 0;
    }
    const stepIndex = stepOf.get(choiceKey);
    if (stepIndex === undefined) continue;
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
  return chosenOptions(family, selections).reduce(
    (sum, { option }) => sum + option.price,
    chosenModel(family, selections)?.price ?? 0,
  );
}

/**
 * The truck as configured: the model's photo with the last chosen option it has one with (a cab),
 * else the model's photo, else the family's main image.
 */
export function truckImage(
  family: ConfiguratorFamily,
  selections: SelectionState,
): ConfiguratorImage | undefined {
  const model = chosenModel(family, selections);
  const withOption = chosenOptions(family, selections)
    .flatMap(({ option }) => (model?.optionImages ?? []).filter((row) => row.option === option.key))
    .at(-1)?.image;
  return withOption ?? model?.image ?? family.image;
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
 * Excel's PMT, as VS Truck's: the payment each period that pays `presentValue` (negative, what is
 * lent) down to `futureValue` at `rate` a period; `type` 1 pays at the start of each period.
 */
export function pmt(
  rate: number,
  periods: number,
  presentValue: number,
  futureValue = 0,
  type: 0 | 1 = 0,
): number {
  if (rate !== 0) {
    const q = (1 + rate) ** periods;
    return -(rate * (futureValue + q * presentValue)) / ((q - 1) * (1 + rate * type));
  }
  return periods !== 0 ? -(futureValue + presentValue) / periods : 0;
}

/** The residual value for the method's term: the first row of its table that fits, else its own. */
export function residualPercentFor(financing: FinancingMethod): number | undefined {
  if (financing.kind !== "monthly" || !financing.months) return undefined;
  const { months } = financing;
  const row = financing.residualValues?.find(
    ({ minMonths, maxMonths }) => minMonths <= months && months <= maxMonths,
  );
  return row?.percent ?? financing.residualPercent;
}

/** The residual value the customer sees: a rental's stays with Milevas. */
export function shownResidualPercent(financing: FinancingMethod): number | undefined {
  return financing.rental ? undefined : residualPercentFor(financing);
}

/**
 * The price for a way to pay: the total to buy, or a month's cost over its term, as VS Truck
 * reckons leasing and long-term rental. The month's cost is an annuity paid at the start of each
 * month on the total, at the yearly interest / 12, with the residual value left at the end, rounded
 * up. A rental adds service, the drive hours a year × the price per hour in their band for the
 * model's truck type and lift capacity, and insurance, a share of the total a year, both a twelfth
 * a month.
 */
export function calculateFinancingPrice(
  total: number,
  financing: FinancingMethod,
  model?: ConfiguratorModel,
): number {
  if (financing.kind === "purchase") {
    return total;
  }
  const termed = withTerm(financing, financing.months);
  const { months, interestRate = 0, rental } = termed;
  if (!months) return 0;
  const residual = total * ((residualPercentFor(termed) ?? 0) / 100);
  const capital = Math.ceil(pmt(interestRate / 100 / 12, months, -total, residual, 1));
  if (!rental) return capital;
  const hourlyRate = serviceHourlyRate(rental.serviceRates, model, rental.driveHoursPerYear);
  const service = (rental.driveHoursPerYear * hourlyRate) / 12;
  const insurance = (total * (rental.insurancePercent / 100)) / 12;
  return Math.round(capital + service + insurance);
}

/** "Leasing (60 mån)", with "restvärde 10 %" too when asked for. */
export function financingLabel(financing: FinancingMethod, { residual = false } = {}): string {
  const residualPercent = residual ? shownResidualPercent(financing) : undefined;
  const details = [
    financing.kind === "monthly" && financing.months ? `${financing.months} mån` : "",
    residualPercent ? `restvärde ${new Intl.NumberFormat("sv-SE").format(residualPercent)} %` : "",
  ].filter(Boolean);
  return details.length ? `${financing.label} (${details.join(", ")})` : financing.label;
}

/**
 * The specifications as the quote lists them: the family's, then the model's and the options'. A
 * heading already listed gets the later value in its place; a new one is added last.
 */
export function resolveSpecifications(layers: SpecValue[][]): ConfiguratorSpecification[] {
  const rows = new Map<string, ConfiguratorSpecification>();
  for (const layer of layers) {
    for (const { label, value } of layer) {
      const heading = label.trim();
      if (!heading || !value.trim()) continue;
      const key = heading.toLocaleLowerCase("sv");
      rows.set(key, { label: rows.get(key)?.label ?? heading, value: value.trim() });
    }
  }
  return [...rows.values()];
}

/**
 * A chosen option as the quote's line: with the group's name, "Gaffellängd: 1150 mm", unless the
 * name says it already ("Standard batteri 206 Ah"); in a group with "Flerval" as it is.
 */
function lineLabel(choice: ConfiguratorChoice, option: ConfiguratorOption): string {
  const plain = (text: string) => text.replaceAll("|", "").replaceAll("\u00ad", "").toLowerCase();
  if (choice.selectionMode === "multiple" || plain(option.label).includes(plain(choice.label))) {
    return option.label;
  }
  return `${choice.label}: ${option.label}`;
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
  if (!family || !financing || !isConfigurable(family)) {
    return null;
  }

  const selections = sanitizeSelections(family, inputSelections, true);
  const complete = firstIncompleteStep(family, selections) === null;
  if (!complete && !allowIncomplete) {
    return null;
  }

  // The steps from the models' fields are in the model's line, not lines of their own.
  const options = chosenOptions(family, selections).filter(({ choice }) => !choice.modelStep);
  const model = chosenModel(family, selections);
  const sku = model?.sku;
  const totalPrice = estimateTotal(family, selections);
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
    modelName: model?.label,
    sku,
    selections,
    selectedOptions: options.map(({ choice, option }) => ({
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
        label: lineLabel(choice, option),
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
    specifications: resolveSpecifications([
      family.specs,
      model?.specs ?? [],
      ...options.map(({ option }) => option.specs),
    ]),
    totalPrice,
    financing,
    financingPrice: calculateFinancingPrice(totalPrice, financing, model),
    serviceAgreement,
    deliveryTime: family.deliveryTime,
    warranty: family.warranty,
    quoteValidityDays: catalog.quoteValidityDays,
  };
}
