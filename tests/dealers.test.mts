import assert from "node:assert/strict";
import { test } from "node:test";
import { quoteFields } from "../src/features/configurator/request-fields.ts";
import type { ConfiguratorQuote } from "../src/features/configurator/types.ts";
import { dealerPrice } from "../src/features/dealers/pricing.ts";
import { readDealerSession, signDealerSession } from "../src/features/dealers/session-token.ts";

const SECRET = "test-secret";

test("a dealer price is the customer price less the discount, in whole kronor", () => {
  assert.equal(dealerPrice(179_900, 15), 152_915);
  assert.equal(dealerPrice(18_001, 12.5), 15_751);
  assert.equal(dealerPrice(1000, 0), 1000);
  assert.equal(dealerPrice(1000, 150), 0);
  // A price's own percentage, later, wins over the common one.
  assert.equal(dealerPrice(1000, 15, 20), 800);
});

test("a dealer session reads back only as signed and until it runs out", () => {
  const now = Date.UTC(2026, 9, 27);
  const value = signDealerSession(SECRET, "dealer-1", now, 60);
  assert.equal(readDealerSession(SECRET, value, now + 59_000), "dealer-1");
  assert.equal(readDealerSession(SECRET, value, now + 60_000), null);
  assert.equal(readDealerSession("another-secret", value, now), null);
  const [, expires, signature] = value.split(".");
  assert.equal(readDealerSession(SECRET, `dealer-2.${expires}.${signature}`, now), null);
  assert.equal(readDealerSession(SECRET, undefined, now), null);
  assert.equal(readDealerSession(SECRET, "not-a-session", now), null);
});

const quote = {
  complete: true,
  familyKey: "motvikt",
  familyName: "Elektriska motvikts­truckar",
  familySingularName: "Elektrisk motvikts­truck",
  sku: "KBET-18",
  selections: {},
  selectedOptions: [{ groupKey: "model", optionKey: "a", label: "1,8 ton", price: 179_900 }],
  lines: [
    {
      key: "base",
      label: "Elektriska motvikts­truckar – bas (1,8 ton)",
      price: 179_900,
      kind: "base",
    },
    { key: "battery.b", label: "Stort batteri", price: 18_000, kind: "option" },
    { key: "service-agreement", label: "Serviceavtal", price: 2856, kind: "service" },
  ],
  specifications: [{ label: "Vikt", value: "3 293 kg" }],
  totalPrice: 197_900,
  financing: { key: "purchase", label: "Köp", kind: "purchase", serviceAgreementEligible: true },
  financingPrice: 197_900,
  deliveryTime: "4–6 veckor",
  warranty: "",
  quoteValidityDays: 14,
} satisfies ConfiguratorQuote;

test("a request's configuration is readable fields, plain of soft hyphens", () => {
  const fields = quoteFields(quote);
  assert.equal(fields.familyName, "Elektrisk motviktstruck");
  assert.equal(fields.model, "1,8 ton");
  assert.equal(fields.lines[0].label, "Elektriska motviktstruckar – bas (1,8 ton)");
  assert.equal(fields.lines[0].dealerPrice, undefined);
  assert.equal(fields.financing.label, "Köp");
  assert.equal(fields.warranty, undefined);
  assert.equal(fields.complete, true);
});

test("a dealer's request carries the dealer prices, not on the service agreement", () => {
  const fields = quoteFields(quote, { id: "dealer-1", discountPercent: 10 });
  assert.equal(fields.dealer, "dealer-1");
  assert.deepEqual(
    fields.lines.map((line) => line.dealerPrice),
    [161_910, 16_200, undefined],
  );
  assert.equal(fields.dealerTotalPrice, 178_110);
});
