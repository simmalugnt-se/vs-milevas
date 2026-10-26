import assert from "node:assert/strict";
import { test } from "node:test";
import type { Payload } from "payload";
import {
  buildQuote,
  calculateFinancingPrice,
  choiceDisplay,
  estimateTotal,
  familySteps,
  firstIncompleteStep,
  firstInvalidSelectionStep,
  sanitizeSelections,
} from "../src/features/configurator/engine.ts";
import { takeRateLimit } from "../src/features/configurator/rate-limit.ts";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  ConfiguratorOption,
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
    { spec: "weight", value: "3 000" },
    { spec: "build-height", value: "2130" },
  ],
  modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
  models: [
    {
      key: "small",
      label: "Liten",
      price: 120000,
      capacityKg: 1500,
      default: true,
      sku: "SMALL",
      specs: [],
    },
    {
      key: "large",
      label: "Stor",
      price: 150000,
      capacityKg: 2000,
      default: false,
      sku: "LARGE",
      specs: [{ spec: "weight", value: "3 500" }],
    },
  ],
  choices: [
    {
      key: "mast",
      label: "Lyfthöjd",
      heading: "Välj lyfthöjd",
      selectionMode: "single",
      required: true,
      options: [
        option({ key: "low", label: "Lyfthöjd 4700 mm", default: true }),
        option({
          key: "high",
          label: "Lyfthöjd 6000 mm",
          price: 3500,
          specs: [{ spec: "build-height", value: "2765" }],
        }),
      ],
    },
    {
      key: "extras",
      label: "Tillval",
      heading: "Välj tillval",
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
  specs: [
    {
      key: "build-height",
      label: "Truckens bygghöjd",
      unit: "mm",
      sortOrder: 60,
      onCard: false,
      inQuote: true,
    },
    { key: "weight", label: "Vikt", unit: "kg", sortOrder: 50, onCard: false, inQuote: true },
  ],
  financingMethods: [
    { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
    {
      key: "leasing",
      label: "Leasing",
      kind: "monthly",
      monthlyFactor: 0.01875,
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

test("the model is the first step, then the choices in order", () => {
  assert.deepEqual(
    familySteps(family).map((choice) => choice.key),
    ["model", "mast", "extras"],
  );
  assert.deepEqual(familySteps({ ...family, configurable: false }), []);
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
});

test("the quote's specifications layer the family, the model and the options", () => {
  const quote = buildQuote(catalog, family.key, { model: ["large"], mast: ["high"] }, "purchase");
  assert.ok(quote);
  assert.deepEqual(quote.specifications, [
    { label: "Vikt", value: "3 500 kg" },
    { label: "Truckens bygghöjd", value: "2765 mm" },
  ]);
});

test("the running total counts what is chosen so far, before every step is complete", () => {
  assert.equal(estimateTotal(family, {}), 0);
  assert.equal(estimateTotal(family, { model: ["large"] }), 150000);
  assert.equal(estimateTotal(family, { model: ["large"], extras: ["alarm", "camera"] }), 165000);
  // An option that is not the family's does not count, as in the quote.
  assert.equal(estimateTotal(family, { model: ["small"], extras: ["gone"] }), 120000);
});

test("a call can carry an incomplete configuration, marked as such; an order cannot", () => {
  // Without the model's default, the required model step stays open.
  const open: ConfiguratorFamily = {
    ...family,
    models: family.models.map((model) => ({ ...model, default: false })),
  };
  const openCatalog = { ...catalog, families: [open] };
  const partial = { extras: ["alarm"] };
  assert.equal(buildQuote(openCatalog, open.key, partial, "purchase"), null);

  const quote = buildQuote(openCatalog, open.key, partial, "purchase", false, {
    allowIncomplete: true,
  });
  assert.ok(quote);
  assert.equal(quote.complete, false);
  assert.equal(quote.totalPrice, 5000);

  const complete = buildQuote(openCatalog, open.key, { model: ["small"] }, "purchase");
  assert.equal(complete?.complete, true);
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
    serviceAgreement: true,
    step: 2,
  });
  params.append("selection", "invalid");
  params.append("selection", "extras.alarm");

  const parsed = parseConfiguratorSearchParams(params);
  assert.equal(parsed.familyKey, family.key);
  assert.equal(parsed.financingKey, "leasing");
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
