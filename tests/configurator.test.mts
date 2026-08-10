import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildQuote,
  calculateFinancingPrice,
  firstIncompleteStep,
  firstInvalidSelectionStep,
  sanitizeSelections,
} from "../src/features/configurator/engine.ts";
import type {
  ConfiguratorCatalog,
  ConfiguratorFamily,
  ConfiguratorOption,
} from "../src/features/configurator/types.ts";
import {
  buildConfiguratorSearchParams,
  parseConfiguratorSearchParams,
  parseSelectionReferences,
} from "../src/features/configurator/url-state.ts";

const baseOption = (overrides: Partial<ConfiguratorOption>): ConfiguratorOption => ({
  key: "standard",
  label: "Standard",
  priceMode: "included",
  price: 0,
  defaultSelected: false,
  conditions: { allOf: [], anyOf: [], noneOf: [] },
  specifications: [],
  ...overrides,
});

const family: ConfiguratorFamily = {
  key: "test-family",
  name: "Testtruck",
  basePrice: 100000,
  deliveryTime: "4 veckor",
  warranty: "1 år",
  steps: [
    {
      key: "model-step",
      label: "Modell",
      heading: "Välj modell",
      groups: [
        {
          key: "model",
          label: "Modell",
          selectionMode: "single",
          required: true,
          options: [
            baseOption({
              key: "small",
              label: "Liten",
              priceMode: "replaceBase",
              price: 120000,
              defaultSelected: true,
              sku: "SMALL",
            }),
            baseOption({
              key: "large",
              label: "Stor",
              priceMode: "replaceBase",
              price: 150000,
              sku: "LARGE",
            }),
          ],
        },
      ],
    },
    {
      key: "extras-step",
      label: "Tillval",
      heading: "Välj tillval",
      groups: [
        {
          key: "extras",
          label: "Tillval",
          selectionMode: "multiple",
          required: false,
          options: [
            baseOption({ key: "alarm", label: "Larm", priceMode: "add", price: 5000 }),
            baseOption({
              key: "camera",
              label: "Kamera",
              priceMode: "add",
              price: 10000,
              conditions: { allOf: ["model.large"], anyOf: [], noneOf: [] },
            }),
          ],
        },
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
      monthlyFactor: 0.01875,
      serviceAgreementEligible: true,
    },
  ],
  serviceAgreement: {
    label: "Serviceavtal",
    annualPrice: 2856,
  },
  quoteValidityDays: 14,
};

test("defaults, replacement price and additions produce a deterministic quote", () => {
  const selections = sanitizeSelections(family, { extras: ["alarm"] });
  assert.deepEqual(selections, { model: ["small"], extras: ["alarm"] });

  const quote = buildQuote(catalog, family.key, selections, "leasing");
  assert.ok(quote);
  assert.equal(quote.totalPrice, 125000);
  assert.equal(quote.financingPrice, 2344);
  assert.equal(quote.sku, "SMALL");
});

test("changing an upstream option removes incompatible downstream selections", () => {
  const large = sanitizeSelections(family, { model: ["large"], extras: ["camera"] });
  assert.deepEqual(large.extras, ["camera"]);

  const changed = sanitizeSelections(family, { ...large, model: ["small"] });
  assert.deepEqual(changed, { model: ["small"] });
  assert.equal(firstInvalidSelectionStep(family, { ...large, model: ["small"] }, changed), 1);
});

test("missing required choices are reported when defaults are disabled", () => {
  const selections = sanitizeSelections(family, {}, false);
  assert.equal(firstIncompleteStep(family, selections), 0);
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
      { label: "Testtruck - bas (Liten)", price: 120000, kind: "base" },
      { label: "Larm", price: 5000, kind: "option" },
      { label: "Serviceavtal", price: 2856, kind: "service" },
    ],
  );
});

test("shareable URL state round-trips and drops malformed references", () => {
  const selections = { model: ["large"], extras: ["alarm", "camera"] };
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
