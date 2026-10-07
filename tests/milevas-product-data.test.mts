import assert from "node:assert/strict";
import { test } from "node:test";
import type { ConfiguratorCatalog } from "../src/features/configurator/types";
import {
  familyFromCatalog,
  familyPrices,
  formatTruckPrice,
} from "../src/payload/blocks/milevas-data";
import type { TruckFamily } from "../src/payload-types";

const catalog: ConfiguratorCatalog = {
  quoteValidityDays: 14,
  financingMethods: [
    {
      key: "leasing",
      label: "Leasing",
      kind: "monthly",
      monthlyFactor: 0.02,
      serviceAgreementEligible: true,
    },
  ],
  families: [
    {
      id: "published-family",
      key: "truck",
      name: "Truck",
      basePrice: 169900,
      deliveryTime: "1 vecka",
      warranty: "Test",
      steps: [
        {
          key: "capacity",
          label: "Kapacitet",
          heading: "Välj kapacitet",
          groups: [
            {
              key: "capacity",
              label: "Kapacitet",
              selectionMode: "single",
              required: true,
              options: [
                {
                  key: "small",
                  label: "1.5 ton",
                  defaultSelected: true,
                  priceMode: "replaceBase",
                  price: 169000,
                  conditions: { allOf: [], anyOf: [], noneOf: [] },
                  specifications: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

test("homepage prices match the configuration the card opens, including a replaced base price", () => {
  assert.deepEqual(familyPrices(catalog.families[0], catalog), {
    price: formatTruckPrice(169000),
    leasing: formatTruckPrice(3380),
  });
});

test("homepage family references use stable ids and exclude families outside the visible catalog", () => {
  assert.equal(familyFromCatalog("published-family", catalog), catalog.families[0]);
  assert.equal(
    familyFromCatalog({ id: "published-family", key: "old-key" } as TruckFamily, catalog),
    catalog.families[0],
  );
  assert.equal(
    familyFromCatalog({ id: "draft-family", key: "truck" } as TruckFamily, catalog),
    undefined,
  );
});
