import assert from "node:assert/strict";
import { test } from "node:test";
import type { Payload } from "payload";
import {
  availableOptions,
  buildQuote,
  calculateFinancingPrice,
  choiceDisplay,
  estimateTotal,
  familySteps,
  financingLabel,
  firstIncompleteStep,
  firstInvalidSelectionStep,
  modelsLeft,
  residualPercentFor,
  resolveSpecifications,
  sanitizeSelections,
  shownResidualPercent,
  truckImage,
  visibleSteps,
  withTerm,
} from "../src/features/configurator/engine.ts";
import { takeRateLimit } from "../src/features/configurator/rate-limit.ts";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorOption,
  FinancingMethod,
} from "../src/features/configurator/types.ts";
import {
  buildConfiguratorSearchParams,
  parseConfiguratorSearchParams,
  parseSelectionReferences,
} from "../src/features/configurator/url-state.ts";

const option = (overrides: Partial<ConfiguratorOption>): ConfiguratorOption => ({
  key: "standard",
  label: "Standard",
  price: 0,
  default: false,
  specs: [],
  ...overrides,
});

const family: ConfiguratorFamily = {
  key: "test-family",
  name: "Testtruckar",
  singularName: "Testtruck",
  configurable: true,
  deliveryTime: "4 veckor",
  warranty: "1 år",
  specs: [
    { label: "Vikt", value: "3 000 kg" },
    { label: "Truckens bygghöjd", value: "2130 mm" },
  ],
  defaultModel: "small",
  order: [],
  models: [
    { key: "small", label: "Liten", price: 120000, capacityKg: 1500, sku: "SMALL", specs: [] },
    {
      key: "large",
      label: "Stor",
      price: 150000,
      capacityKg: 2000,
      sku: "LARGE",
      specs: [{ label: "Vikt", value: "3 500 kg" }],
    },
  ],
  choices: [
    {
      key: "mast",
      label: "Lyfthöjd",
      selectionMode: "single",
      required: true,
      options: [
        option({ key: "low", label: "Lyfthöjd 4700 mm", default: true }),
        option({
          key: "high",
          label: "Lyfthöjd 6000 mm",
          price: 3500,
          specs: [{ label: "Truckens bygghöjd", value: "2765 mm" }],
        }),
      ],
    },
    {
      key: "extras",
      label: "Tillval",
      selectionMode: "multiple",
      required: false,
      options: [
        option({ key: "alarm", label: "Larm", price: 5000 }),
        option({ key: "camera", label: "Kamera", price: 10000 }),
      ],
    },
  ],
};

const catalog: ConfiguratorCatalog = {
  families: [family],
  financingMethods: [
    { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
    {
      key: "leasing",
      label: "Leasing",
      kind: "monthly",
      months: 48,
      terms: [24, 36, 48, 60, 72, 84],
      residualPercent: 10,
      serviceAgreementEligible: true,
    },
  ],
  serviceAgreement: {
    label: "Serviceavtal",
    annualPrice: 2856,
  },
  quoteValidityDays: 14,
  nextSteps: [],
};

test("without model steps the model is the first step, then the steps after it in order", () => {
  assert.deepEqual(
    familySteps(family).map((choice) => choice.key),
    ["model", "mast", "extras"],
  );
  assert.deepEqual(familySteps({ ...family, configurable: false }), []);
  assert.deepEqual(familySteps({ ...family, models: [] }), []);
});

test("defaults, the model's price and additions produce a deterministic quote", () => {
  const selections = sanitizeSelections(family, { extras: ["alarm"] });
  assert.deepEqual(selections, { model: ["small"], mast: ["low"], extras: ["alarm"] });

  const quote = buildQuote(catalog, family.key, selections, "leasing");
  assert.ok(quote);
  assert.equal(quote.totalPrice, 125000);
  assert.equal(quote.financingPrice, 2344);
  assert.equal(quote.sku, "SMALL");
  assert.equal(quote.familySingularName, "Testtruck");
  assert.equal(quote.modelKey, "small");
  assert.equal(quote.modelName, "Liten");
});

test("the quote's specifications layer the family, the model and the options", () => {
  const quote = buildQuote(catalog, family.key, { model: ["large"], mast: ["high"] }, "purchase");
  assert.ok(quote);
  // The family's rows in order, the model's and the mast's values in their place.
  assert.deepEqual(quote.specifications, [
    { label: "Vikt", value: "3 500 kg" },
    { label: "Truckens bygghöjd", value: "2765 mm" },
  ]);
});

test("the running total is the model plus the options, before every step is complete", () => {
  // No model chosen yet: the cheapest.
  assert.equal(estimateTotal(family, {}), 120000);
  assert.equal(estimateTotal(family, { model: ["large"] }), 150000);
  assert.equal(estimateTotal(family, { model: ["large"], extras: ["alarm", "camera"] }), 165000);
  // An option that is not the family's does not count, as in the quote.
  assert.equal(estimateTotal(family, { model: ["small"], extras: ["gone"] }), 120000);
});

test("a single choice always starts at its first option, so a configuration is complete", () => {
  const quote = buildQuote(catalog, family.key, { extras: ["alarm"] }, "purchase");
  assert.ok(quote);
  assert.equal(quote.complete, true);
  assert.equal(quote.totalPrice, 125000);
  // Without defaults the steps are still open.
  assert.equal(firstIncompleteStep(family, sanitizeSelections(family, {}, false)), 0);
});

test("an option the family no longer has is dropped, and its step reported", () => {
  const input = { model: ["small"], extras: ["alarm", "gone"] };
  const sanitized = sanitizeSelections(family, input);
  assert.deepEqual(sanitized, { model: ["small"], mast: ["low"], extras: ["alarm"] });
  assert.equal(firstInvalidSelectionStep(family, input, sanitized), 2);
});

test("missing required choices are reported when defaults are disabled", () => {
  const selections = sanitizeSelections(family, {}, false);
  assert.equal(firstIncompleteStep(family, selections), 0);
});

test("a step's type follows its content unless one is set", () => {
  const choice = (options: ConfiguratorOption[], display?: ConfiguratorChoice["display"]) => ({
    ...family.choices[1],
    options,
    display,
  });
  const titled = option({ key: "a" });
  const described = option({ key: "b", description: "Text" });
  const pictured = option({ key: "c", image: { alt: "", url: "/truck.png" } });
  assert.equal(choiceDisplay(choice([titled, titled])), "stack");
  assert.equal(choiceDisplay(choice([titled, titled, titled])), "prices");
  assert.equal(choiceDisplay(choice([described, titled, titled])), "grid");
  assert.equal(choiceDisplay(choice([pictured, pictured, pictured])), "imageRows");
  assert.equal(choiceDisplay(choice([pictured, pictured, pictured, pictured])), "images");
  assert.equal(choiceDisplay(choice([titled, titled], "images")), "images");
});

test("financing rounds to whole SEK", () => {
  assert.equal(calculateFinancingPrice(173900, catalog.financingMethods[0]), 173900);
  assert.equal(calculateFinancingPrice(173900, catalog.financingMethods[1]), 3261);
});

test("without interest a monthly price is the total less the residual value over the term", () => {
  const leasing = catalog.financingMethods[1];
  assert.equal(calculateFinancingPrice(120000, withTerm(leasing, 60)), 1800);
  assert.equal(calculateFinancingPrice(120000, withTerm(leasing, 48)), 2250);
  assert.equal(calculateFinancingPrice(120000, { ...leasing, residualPercent: undefined }), 2500);
  // A term the method does not offer gives its default.
  assert.equal(withTerm(leasing, 50).months, 48);
  assert.equal(withTerm({ ...leasing, months: 50 }).months, 48);
  assert.equal(financingLabel(withTerm(leasing, 60)), "Leasing (60 mån)");
  assert.equal(
    financingLabel(withTerm(leasing, 60), { residual: true }),
    "Leasing (60 mån, restvärde 10 %)",
  );
  assert.equal(financingLabel(catalog.financingMethods[0]), "Köp");

  const quote = buildQuote(catalog, family.key, {}, "leasing", false, { months: 72 });
  assert.ok(quote);
  assert.equal(quote.financing.months, 72);
  assert.equal(quote.financingPrice, Math.ceil((quote.totalPrice * 0.9) / 72));
});

/** VS Truck's figures (2026-10); the expected prices are what its own `helpers.ts` gives. */
const vsTruckLeasing: FinancingMethod = {
  key: "leasing",
  label: "Leasing",
  kind: "monthly",
  months: 48,
  terms: [24, 36, 48, 60, 72, 84],
  interestRate: 5.95,
  residualValues: [
    { minMonths: 0, maxMonths: 60, percent: 20 },
    { minMonths: 61, maxMonths: 72, percent: 10 },
  ],
  residualPercent: 10,
  serviceAgreementEligible: true,
};
const vsTruckRental: FinancingMethod = {
  ...vsTruckLeasing,
  key: "long-term-rental",
  label: "Långtidshyra",
  residualValues: [
    { minMonths: 1, maxMonths: 60, percent: 20 },
    { minMonths: 61, maxMonths: 84, percent: 10 },
  ],
  residualPercent: 20,
  rental: { driveHoursPerYear: 500, insurancePercent: 1.2 },
  serviceAgreementEligible: false,
};
const rentedModel = {
  ...family.models[0],
  serviceHourlyRates: { upTo600: 18, upTo1200: 15, upTo2000: 14, upTo3000: 12, over3000: 10 },
};

test("leasing is VS Truck's annuity, paid in advance, with the residual value for the term", () => {
  const price = (total: number, months: number) =>
    calculateFinancingPrice(total, withTerm(vsTruckLeasing, months));
  assert.deepEqual(
    [48, 60, 72, 84].map((months) => price(120000, months)),
    [2360, 1963, 1838, 1627],
  );
  assert.deepEqual(
    [48, 60, 72, 84].map((months) => price(173900, months)),
    [3420, 2845, 2664, 2358],
  );
  assert.equal(residualPercentFor(withTerm(vsTruckLeasing, 72)), 10);
  // 84 months is past the table: the method's own residual value.
  assert.equal(residualPercentFor(withTerm(vsTruckLeasing, 84)), 10);
  assert.equal(shownResidualPercent(withTerm(vsTruckLeasing, 60)), 20);
});

test("long-term rental adds service for the drive hours and insurance, as VS Truck's", () => {
  const price = (total: number, months: number, driveHoursPerYear = 500) =>
    calculateFinancingPrice(
      total,
      withTerm({ ...vsTruckRental, rental: { driveHoursPerYear, insurancePercent: 1.2 } }, months),
      rentedModel,
    );
  assert.equal(price(120000, 48), 3230);
  assert.equal(price(120000, 84), 2497);
  assert.equal(price(173900, 48), 4344);
  assert.equal(price(173900, 84), 3282);
  // 1 500 hours fall in the 1 200–2 000 band.
  assert.equal(price(120000, 48, 1500), 4230);
  // Without the model's rates no service is added; the customer never sees the residual value.
  assert.equal(
    calculateFinancingPrice(120000, withTerm(vsTruckRental, 48)),
    3230 - Math.round((500 * 18) / 12),
  );
  assert.equal(shownResidualPercent(withTerm(vsTruckRental, 48)), undefined);
  assert.equal(
    financingLabel(withTerm(vsTruckRental, 48), { residual: true }),
    "Långtidshyra (48 mån)",
  );
});

test("service agreement is separate from the financed truck price", () => {
  const quote = buildQuote(catalog, family.key, { extras: ["alarm"] }, "leasing", true);
  assert.ok(quote);
  assert.equal(quote.totalPrice, 125000);
  assert.equal(quote.financingPrice, 2344);
  assert.deepEqual(quote.serviceAgreement, { label: "Serviceavtal", annualPrice: 2856 });
  assert.deepEqual(
    quote.lines.map(({ label, price, kind }) => ({ label, price, kind })),
    [
      { label: "Testtruckar – bas (Liten)", price: 120000, kind: "base" },
      { label: "Lyfthöjd 4700 mm", price: 0, kind: "option" },
      { label: "Larm", price: 5000, kind: "option" },
      { label: "Serviceavtal", price: 2856, kind: "service" },
    ],
  );
});

test("shareable URL state round-trips and drops malformed references", () => {
  const selections = { model: ["large"], mast: ["low"], extras: ["alarm", "camera"] };
  const params = buildConfiguratorSearchParams({
    family,
    selections,
    financingKey: "leasing",
    months: 60,
    serviceAgreement: true,
    step: 2,
  });
  params.append("selection", "invalid");
  params.append("selection", "extras.alarm");

  const parsed = parseConfiguratorSearchParams(params);
  assert.equal(parsed.familyKey, family.key);
  assert.equal(parsed.financingKey, "leasing");
  assert.equal(parsed.months, 60);
  assert.equal(parsed.serviceAgreement, true);
  assert.equal(parsed.step, 2);
  assert.deepEqual(parsed.selections, selections);
  assert.deepEqual(parseSelectionReferences(["bad", ".bad", "bad."]), {});
});

test("quote calculation ignores unknown and client-supplied price-like keys", () => {
  const quote = buildQuote(
    catalog,
    family.key,
    { model: ["large"], extras: ["alarm"], totalPrice: ["1"] },
    "purchase",
  );
  assert.ok(quote);
  assert.equal(quote.totalPrice, 155000);
  assert.equal("totalPrice" in quote.selections, false);
});

test("the rate limit allows a number of uses per window, then frees them as time passes", async () => {
  const store = new Map<string, unknown>();
  const payload = {
    kv: {
      get: async (key: string) => store.get(key) ?? null,
      set: async (key: string, value: unknown) => void store.set(key, value),
    },
  } as unknown as Payload;
  const take = (now: number) => takeRateLimit(payload, "copy:a@b.se", 2, 1000, now);
  assert.equal(await take(0), true);
  assert.equal(await take(10), true);
  assert.equal(await take(20), false);
  assert.equal(await take(1001), true);
  assert.equal(await takeRateLimit(payload, "copy:other@b.se", 2, 1000, 20), true);
});

/** The fixture with the high mast for the large model only. */
const conditioned: ConfiguratorFamily = {
  ...family,
  choices: [
    {
      ...family.choices[0],
      options: [
        family.choices[0].options[0],
        { ...family.choices[0].options[1], models: ["large"] },
      ],
    },
    family.choices[1],
  ],
};

test("an option is offered only for the models that have it", () => {
  const mast = conditioned.choices[0];
  const keys = (selections: Record<string, string[]>) =>
    availableOptions(conditioned, mast, selections).map((candidate) => candidate.key);
  assert.deepEqual(keys({ model: ["small"] }), ["low"]);
  assert.deepEqual(keys({ model: ["large"] }), ["low", "high"]);
});

test("changing the model drops what it does not have, and the default is the first option it has", () => {
  const large = sanitizeSelections(conditioned, { model: ["large"], mast: ["high"] });
  assert.deepEqual(large.mast, ["high"]);
  assert.deepEqual(sanitizeSelections(conditioned, { ...large, model: ["small"] }).mast, ["low"]);
  // The first option in the list a model has is its default: here the high mast for the large
  // model, the low one for the small.
  const highFirst: ConfiguratorFamily = {
    ...family,
    choices: [
      {
        ...family.choices[0],
        options: [
          { ...family.choices[0].options[1], models: ["large"] },
          { ...family.choices[0].options[0], models: ["small"] },
        ],
      },
      family.choices[1],
    ],
  };
  assert.deepEqual(sanitizeSelections(highFirst, { model: ["large"] }).mast, ["high"]);
  assert.deepEqual(sanitizeSelections(highFirst, { model: ["small"] }).mast, ["low"]);
});

test("the model step shows each model with its text and photo, the cheapest first", () => {
  const photo = { alt: "Liten", url: "/media/small.png" };
  const withPhoto: ConfiguratorFamily = {
    ...family,
    models: [...family.models]
      .reverse()
      .map((model) =>
        model.key === "small" ? { ...model, image: photo, description: "Smidig" } : model,
      ),
  };
  const models = familySteps(withPhoto)[0];
  assert.deepEqual(
    models.options.map(({ key, image, description }) => ({ key, image, description })),
    [
      { key: "small", image: photo, description: "Smidig" },
      { key: "large", image: undefined, description: undefined },
    ],
  );
  assert.deepEqual(
    availableOptions(withPhoto, models, {}).map(({ key, price }) => [key, price]),
    [
      ["small", 120000],
      ["large", 150000],
    ],
  );
});

/**
 * Baoli's counterbalance trucks: three-wheeled at 1.5 and 1.8 tonnes, four-wheeled at 1.8 and 2.5,
 * found by capacity, then wheels.
 */
const counterbalance: ConfiguratorFamily = {
  ...family,
  defaultModel: undefined,
  order: ["capacity", "wheels"],
  models: [
    {
      key: "kbet-15",
      label: "KBET 15 G1",
      price: 150000,
      capacityKg: 1500,
      wheels: "3",
      specs: [],
    },
    {
      key: "kbet-18",
      label: "KBET 18 G1",
      price: 160000,
      capacityKg: 1800,
      wheels: "3",
      specs: [],
    },
    { key: "kbe-18", label: "KBE 18 G1", price: 170000, capacityKg: 1800, wheels: "4", specs: [] },
    { key: "kbe-25", label: "KBE 25 G1", price: 210000, capacityKg: 2500, wheels: "4", specs: [] },
  ],
};

test("the model steps come first, then the model when they leave more than one, then the steps after it", () => {
  assert.deepEqual(
    familySteps(counterbalance).map((choice) => [choice.key, choice.modelStep]),
    [
      ["capacity", "capacity"],
      ["wheels", "wheels"],
      ["model", "model"],
      ["mast", undefined],
      ["extras", undefined],
    ],
  );
  // Starting at the cheapest model, as no default is set.
  assert.deepEqual(sanitizeSelections(counterbalance, {}), {
    capacity: ["1500"],
    wheels: ["3"],
    model: ["kbet-15"],
    mast: ["low"],
  });
});

test("a model step offers the values the models left have, with the price of the cheapest with each", () => {
  const [capacity, wheels] = familySteps(counterbalance);
  const offered = (choice: ConfiguratorChoice, selections: Record<string, string[]>) =>
    availableOptions(counterbalance, choice, selections).map(
      ({ key, label, price, description }) => ({ key, label, price, description }),
    );
  assert.deepEqual(offered(capacity, {}), [
    { key: "1500", label: "1,5 ton", price: 150000, description: "KBET 15 G1" },
    { key: "1800", label: "1,8 ton", price: 160000, description: "KBET 18 G1 / KBE 18 G1" },
    { key: "2500", label: "2,5 ton", price: 210000, description: "KBE 25 G1" },
  ]);
  assert.deepEqual(
    offered(wheels, { capacity: ["1800"] }).map(({ key, price }) => [key, price]),
    [
      ["3", 160000],
      ["4", 170000],
    ],
  );
});

test("a step with one option left is chosen for the customer and not shown", () => {
  const shown = (selections: Record<string, string[]>) =>
    visibleSteps(counterbalance, sanitizeSelections(counterbalance, selections)).map(
      (choice) => choice.key,
    );
  // 1.8 tonnes has two wheel counts; the wheels then point at one model.
  assert.deepEqual(shown({ capacity: ["1800"] }), ["capacity", "wheels", "mast", "extras"]);
  // 2.5 tonnes has one: no wheels step, and the model is chosen.
  assert.deepEqual(shown({ capacity: ["2500"] }), ["capacity", "mast", "extras"]);
  assert.deepEqual(sanitizeSelections(counterbalance, { capacity: ["2500"] }).model, ["kbe-25"]);
  // Changing the capacity drops the wheels it does not have.
  assert.deepEqual(
    sanitizeSelections(counterbalance, { capacity: ["1500"], wheels: ["4"], model: ["kbe-18"] }),
    { capacity: ["1500"], wheels: ["3"], model: ["kbet-15"], mast: ["low"] },
  );
  // A family of one model has no model step.
  const single = { ...family, models: [family.models[0]] };
  assert.deepEqual(
    visibleSteps(single, sanitizeSelections(single, {})).map((choice) => choice.key),
    ["mast", "extras"],
  );
});

test("the quote names the model and leaves the model steps out of its lines", () => {
  const quote = buildQuote(
    { ...catalog, families: [counterbalance] },
    counterbalance.key,
    { capacity: ["1800"], wheels: ["4"] },
    "purchase",
  );
  assert.ok(quote);
  assert.equal(quote.modelKey, "kbe-18");
  assert.equal(quote.modelName, "KBE 18 G1");
  assert.equal(quote.totalPrice, 170000);
  assert.deepEqual(
    quote.lines.map((line) => line.label),
    ["Testtruckar – bas (KBE 18 G1)", "Lyfthöjd 4700 mm"],
  );
  assert.deepEqual(
    modelsLeft(counterbalance, { capacity: ["1800"] }).map((model) => model.key),
    ["kbet-18", "kbe-18"],
  );
});

test("a series is offered from its lowest price up", () => {
  const bySeries: ConfiguratorFamily = {
    ...family,
    order: ["series"],
    models: [
      {
        key: "es-12",
        label: "ES 12N",
        price: 82000,
        capacityKg: 1200,
        series: "ES-serien",
        specs: [],
      },
      {
        key: "kbs-12",
        label: "KBS 12N",
        price: 40000,
        capacityKg: 1200,
        series: "KBS-serien",
        specs: [],
      },
    ],
  };
  assert.deepEqual(
    familySteps(bySeries)[0].options.map((option) => option.label),
    ["KBS-serien", "ES-serien"],
  );
});

test("the truck shown is the chosen option's photo for the model, else the model's, else the family's", () => {
  const familyPhoto = { alt: "Truckar", url: "/family.png" };
  const largePhoto = { alt: "Stor", url: "/large.png" };
  const cabOnLarge = { alt: "Stor med hytt", url: "/large-cab.png" };
  const withPhotos: ConfiguratorFamily = {
    ...family,
    image: familyPhoto,
    models: family.models.map((model) =>
      model.key === "large"
        ? { ...model, image: largePhoto, optionImages: [{ option: "alarm", image: cabOnLarge }] }
        : model,
    ),
  };
  assert.deepEqual(truckImage(withPhotos, { model: ["small"] }), familyPhoto);
  assert.deepEqual(truckImage(withPhotos, { model: ["large"] }), largePhoto);
  assert.deepEqual(truckImage(withPhotos, { model: ["large"], extras: ["alarm"] }), cabOnLarge);
  assert.deepEqual(truckImage(withPhotos, { model: ["small"], extras: ["alarm"] }), familyPhoto);
});

test("specifications keep the first heading's place and take the last value", () => {
  assert.deepEqual(
    resolveSpecifications([
      [
        { label: "Körhastighet", value: "15 km/h" },
        { label: "Vikt", value: "3 000 kg" },
      ],
      [
        { label: "vikt", value: "3 500 kg" },
        { label: "Vändradie", value: "1 870 mm" },
        { label: "Tom", value: " " },
      ],
    ]),
    [
      { label: "Körhastighet", value: "15 km/h" },
      { label: "Vikt", value: "3 500 kg" },
      { label: "Vändradie", value: "1 870 mm" },
    ],
  );
});

test("the steps follow the editor's order, the groups left out after them, the model after the last field", () => {
  const keys = (order: string[]) =>
    familySteps({ ...counterbalance, order }).map((choice) => choice.key);
  // As in the prototype: the battery between the capacity and the wheels.
  assert.deepEqual(keys(["capacity", "mast", "wheels", "extras"]), [
    "capacity",
    "mast",
    "wheels",
    "model",
    "extras",
  ]);
  // A group left out of the order follows; without fields, the model comes first.
  assert.deepEqual(keys(["capacity"]), ["capacity", "model", "mast", "extras"]);
  assert.deepEqual(keys([]), ["model", "mast", "extras"]);
});

test("a group before the model is narrowed narrows the models to those its option is for", () => {
  const mastFirst: ConfiguratorFamily = {
    ...counterbalance,
    order: ["mast", "capacity", "wheels", "extras"],
    choices: [
      {
        ...family.choices[0],
        options: [
          family.choices[0].options[0],
          { ...family.choices[0].options[1], models: ["kbe-18", "kbe-25"] },
        ],
      },
      family.choices[1],
    ],
  };
  const [mast, capacity, wheels] = familySteps(mastFirst);
  assert.deepEqual(
    availableOptions(mastFirst, mast, {}).map((choice) => choice.key),
    ["low", "high"],
  );
  // With the high mast, only the four-wheeled models are left.
  assert.deepEqual(
    availableOptions(mastFirst, capacity, { mast: ["high"] }).map((choice) => choice.key),
    ["1800", "2500"],
  );
  assert.deepEqual(
    availableOptions(mastFirst, wheels, { mast: ["high"], capacity: ["1800"] }).map(
      (choice) => choice.key,
    ),
    ["4"],
  );
  const quote = buildQuote(
    { ...catalog, families: [mastFirst] },
    mastFirst.key,
    { mast: ["high"], capacity: ["1800"] },
    "purchase",
  );
  assert.equal(quote?.modelKey, "kbe-18");
  assert.equal(quote?.totalPrice, 173500);
});

test("a value one model has shows the model's text, a series its own, and an equipment line its group's name", () => {
  const described: ConfiguratorFamily = {
    ...counterbalance,
    models: counterbalance.models.map((model) =>
      model.key === "kbe-25" ? { ...model, description: "Batteri 206 Ah" } : model,
    ),
  };
  const [capacity] = familySteps(described);
  assert.deepEqual(
    availableOptions(described, capacity, {}).map((option) => option.description),
    ["KBET 15 G1", "KBET 18 G1 / KBE 18 G1", "KBE 25 G1 — Batteri 206 Ah"],
  );
  const series: ConfiguratorFamily = {
    ...described,
    order: ["series"],
    seriesTexts: { "KBE G1": "Li-Ion, fyra hjul" },
    models: described.models.map((model) => ({
      ...model,
      series: model.key.startsWith("kbet") ? "KBET G1" : "KBE G1",
    })),
  };
  assert.deepEqual(
    availableOptions(series, familySteps(series)[0], {}).map((option) => option.description),
    ["KBET 15 G1 / KBET 18 G1", "Li-Ion, fyra hjul"],
  );
  const quote = buildQuote(
    { ...catalog, families: [family] },
    family.key,
    { extras: ["alarm"] },
    "purchase",
  );
  // "Lyfthöjd 4700 mm" names its group already; an extra stays as it is.
  assert.deepEqual(
    quote?.lines.map((line) => line.label),
    ["Testtruckar – bas (Liten)", "Lyfthöjd 4700 mm", "Larm"],
  );
  const short: ConfiguratorFamily = {
    ...family,
    choices: [
      { ...family.choices[0], options: [option({ key: "low", label: "4700 mm" })] },
      family.choices[1],
    ],
  };
  assert.equal(
    buildQuote({ ...catalog, families: [short] }, short.key, {}, "purchase")?.lines[1]?.label,
    "Lyfthöjd: 4700 mm",
  );
});
