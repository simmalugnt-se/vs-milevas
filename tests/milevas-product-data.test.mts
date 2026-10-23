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
  specs: [{ spec: "battery", value: "80 V 228 Ah" }],
  modelChoice: { label: "Lyftkapacitet", heading: "Välj lyftkapacitet" },
  models: [
    { key: "small", label: "1,5 ton", price: 169000, capacityKg: 1500, default: true, specs: [] },
    {
      key: "large",
      label: "3,5 ton",
      price: 276000,
      capacityKg: 3500,
      default: false,
      specs: [{ spec: "battery", value: "80 V 460 Ah" }],
    },
  ],
  choices: [],
};

const contactOnly: ConfiguratorFamily = {
  ...truck,
  id: "contact-family",
  key: "contact",
  configurable: false,
  contactLink: { href: "/#kontakt" },
  models: [],
};

const catalog: ConfiguratorCatalog = {
  quoteValidityDays: 14,
  specs: [
    { key: "battery", label: "Batteri", sortOrder: 10, onCard: true },
    { key: "weight", label: "Vikt", unit: "kg", sortOrder: 50, onCard: false },
  ],
  nextSteps: [],
  financingMethods: [
    {
      key: "leasing",
      label: "Leasing",
      kind: "monthly",
      monthlyFactor: 0.02,
      serviceAgreementEligible: true,
    },
  ],
  families: [truck, contactOnly],
};

test("homepage prices match the configuration the card opens: the default model", () => {
  assert.deepEqual(familyPrices(truck, catalog), {
    price: formatTruckPrice(169000),
    leasing: formatTruckPrice(3380),
  });
  assert.deepEqual(familyPrices(contactOnly, catalog), { price: undefined, leasing: undefined });
});

test("the card's specs are the models' capacity range and the default model's card specs", () => {
  assert.deepEqual(familyCardSpecs(truck, catalog), ["1,5 – 3,5 ton", "80 V 228 Ah"]);
  const large = { ...truck.models[1], default: true };
  assert.deepEqual(familyCardSpecs({ ...truck, models: [large] }, catalog), [
    "3,5 ton",
    "80 V 460 Ah",
  ]);
});

test("a family links to its configurator, or to its contact link when it is not configurable", () => {
  assert.deepEqual(familyLink(truck), { href: "/configurator?family=truck&step=1" });
  assert.deepEqual(familyLink(contactOnly), { href: "/#kontakt" });
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
