"use client";

import { useRowLabel } from "@payloadcms/ui";

/**
 * The truck family's list rows in the admin, named by what they hold ("1,6 ton · KBR 16 · 516 000
 * kr") instead of "Variant 01", so a row is found without opening it.
 */

const price = (value: unknown, extra = false) => {
  if (typeof value !== "number") return undefined;
  if (extra && value === 0) return "Ingår";
  const formatted = new Intl.NumberFormat("sv-SE").format(value);
  return `${extra ? "+" : ""}${formatted} kr`;
};

const tons = (kg: unknown) =>
  typeof kg === "number"
    ? `${new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kg / 1000)} ton`
    : undefined;

const join = (parts: Array<string | undefined | null | false>, fallback: string) =>
  parts.filter(Boolean).join(" · ") || fallback;

const text = (value: unknown) =>
  typeof value === "string" ? value.replaceAll("|", "") : undefined;

export function ModelRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  return (
    <span>
      {join(
        [
          tons(data?.capacityKg),
          text(data?.sku),
          price(data?.price),
          data?.defaultSelected === true && "förvald",
        ],
        `Variant ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}

export function BatteryRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  return (
    <span>
      {join(
        [
          text(data?.label),
          text(data?.capacity),
          price(data?.price, true),
          data?.defaultSelected === true && "förvalt",
        ],
        `Batteri ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}

export function LiftHeightRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  return (
    <span>
      {join(
        [
          typeof data?.liftHeight === "number" && `${data.liftHeight} mm`,
          typeof data?.buildHeight === "number" && `bygghöjd ${data.buildHeight} mm`,
          price(data?.price, true),
          data?.defaultSelected === true && "förvald",
        ],
        `Mast ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}

export function ExtraRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  return (
    <span>
      {join([text(data?.label), price(data?.price, true)], `Tillval ${(rowNumber ?? 0) + 1}`)}
    </span>
  );
}
