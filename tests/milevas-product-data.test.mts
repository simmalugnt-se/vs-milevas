import assert from "node:assert/strict";
import { test } from "node:test";
import type { ConfiguratorCatalog, ConfiguratorFamily } from "../src/features/configurator/types";
import {
  familyCardSpecs,
  familyFromCatalog,
  familyLink,
  familyPrices,
  formatTruckPrice,
} from "../src/payload/blocks/milevas-data";
import type { TruckFamily } from "../src/payload-types";

const truck: ConfiguratorFamily = {
  id: "published-family",
  key: "truck",
  name: "Truckar",
  singularName: "Truck",
  configurable: true,
  deliveryTime: "1 vecka",
  warranty: "Test",
  cardSpec: "80 V 228 Ah",
  specs: [],
  defaultModel: "small",
  order: [],
  models: [
    { key: "small", label: "KBE 15", price: 169000, capacityKg: 1500, specs: [] },
    { key: "large", label: "KBE 35", price: 276000, capacityKg: 3500, specs: [] },
  ],
  choices: [],
};

const contactOnly: ConfiguratorFamily = {
  ...truck,
  id: "contact-family",
  key: "contact",
  configurable: false,
  models: [],
};

const catalog: ConfiguratorCatalog = {
  quoteValidityDays: 14,
  nextSteps: [],
  financingMethods: [
    {
      key: "leasing",
      label: "Leasing",
      kind: "monthly",
      months: 50,
      serviceAgreementEligible: true,
    },
  ],
  families: [truck, contactOnly],
};

test("homepage prices match the configuration the card opens: the default model", () => {
  assert.deepEqual(familyPrices(truck, catalog), {
    price: formatTruckPrice(169000),
    amount: 169000,
    model: "small",
    leasing: formatTruckPrice(3380),
  });
  assert.deepEqual(familyPrices(contactOnly, catalog), {
    price: undefined,
    leasing: undefined,
    amount: undefined,
    model: undefined,
  });
});

test("the card's specs are the models' capacity range and the truck type's card text", () => {
  assert.deepEqual(familyCardSpecs(truck), ["1,5 – 3,5 ton", "80 V 228 Ah"]);
  assert.deepEqual(familyCardSpecs({ ...truck, models: [truck.models[1]], cardSpec: undefined }), [
    "3,5 ton",
  ]);
});

test("a family links to its configurator, and one without models has no link", () => {
  assert.deepEqual(familyLink(truck), { href: "/configurator?family=truck&step=1" });
  assert.equal(familyLink(contactOnly), undefined);
});

test("homepage family references use stable ids and exclude families outside the visible catalog", () => {
  assert.equal(familyFromCatalog("published-family", catalog), truck);
  assert.equal(
    familyFromCatalog({ id: "published-family", key: "old-key" } as TruckFamily, catalog),
    truck,
  );
  assert.equal(
    familyFromCatalog({ id: "draft-family", key: "truck" } as TruckFamily, catalog),
    undefined,
  );
});
