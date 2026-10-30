"use client";

import { useRowLabel } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { useStepChoices } from "./useStepChoices";

/**
 * The truck type's list rows in the admin, named by what they hold ("Stort batteri · +18 000 kr")
 * instead of "Alternativ 01", so a row is found without opening it.
 */

const price = (value: unknown, extra = false) => {
  if (typeof value !== "number") return undefined;
  if (extra && value === 0) return "Ingår";
  const formatted = new Intl.NumberFormat("sv-SE").format(value);
  return `${extra ? "+" : ""}${formatted} kr`;
};

const join = (parts: Array<string | undefined | null | false>, fallback: string) =>
  parts.filter(Boolean).join(" · ") || fallback;

const text = (value: unknown) =>
  typeof value === "string" ? value.replaceAll("|", "").trim() || undefined : undefined;

/** "Batteri · 6 alternativ · olika per modell", or "… · alla modeller". */
export function GroupRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    label?: string;
    options?: Array<{ models?: unknown[] | null }>;
  }>();
  const options = data?.options ?? [];
  const perModel = options.some((option) => (option.models ?? []).length > 0);
  return (
    <span>
      {join(
        [
          // Unnamed, as "Grupp 2": the configurator leaves it out until it has a name.
          text(data?.label) ?? `Grupp ${(rowNumber ?? 0) + 1}`,
          `${options.length} alternativ`,
          options.length > 0 && (perModel ? "olika per modell" : "alla modeller"),
        ],
        `Grupp ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}

/** "Stort batteri 228 Ah (Li-Ion) · +18 000 kr · 6 modeller". */
export function OptionRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    label?: string;
    price?: number;
    models?: unknown[] | null;
  }>();
  const count = (data?.models ?? []).length;
  return (
    <span>
      {join(
        [
          // Unnamed, as the matrix calls it: the configurator leaves it out until it has a name.
          text(data?.label) ?? `Alternativ ${(rowNumber ?? 0) + 1}`,
          price(data?.price, true),
          count > 0 && `${count} ${count === 1 ? "modell" : "modeller"}`,
        ],
        `Alternativ ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}

/** "Vikt: 3 293 kg". */
export function SpecRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; value?: string }>();
  const label = text(data?.label);
  return (
    <span>
      {label
        ? `${label}${data?.value ? `: ${data.value}` : ""}`
        : `Specifikation ${(rowNumber ?? 0) + 1}`}
    </span>
  );
}

/** "Batteri · från Utrustning", "Lyftkapacitet · från modellerna". */
export function StepOrderRowLabel() {
  const { data, rowNumber } = useRowLabel<{ step?: string }>();
  const steps = useStepChoices();
  const step = steps.find((candidate) => candidate.value === data?.step);
  return <span>{step ? `${step.label} · ${step.source}` : `Steg ${(rowNumber ?? 0) + 1}`}</span>;
}

/** The truck type's name for a block's row that points at one (the hero's columns, the cards). */
export function FamilyRowLabel() {
  const { data, rowNumber } = useRowLabel<{ family?: string | { id: string; name?: string } }>();
  const family = data?.family;
  const id = typeof family === "object" ? family?.id : family;
  const [name, setName] = useState(typeof family === "object" ? family?.name : undefined);

  useEffect(() => {
    if (!id || typeof family === "object") return;
    const controller = new AbortController();
    fetch(`/api/truck-families/${id}?depth=0&draft=true&select[name]=true`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((doc: { name?: string } | null) => setName(doc?.name))
      .catch(() => {});
    return () => controller.abort();
  }, [id, family]);

  return <span>{text(name) ?? `Trucktyp ${(rowNumber ?? 0) + 1}`}</span>;
}

/** "0–2 000 kg · 18–10 kr/h", from the first band's price to the last's. */
export function ServiceRateRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    minKg?: number;
    maxKg?: number;
    upTo600?: number;
    over3000?: number;
  }>();
  const kg = (value: number) => new Intl.NumberFormat("sv-SE").format(value);
  const range =
    typeof data?.minKg === "number"
      ? typeof data.maxKg === "number"
        ? `${kg(data.minKg)}–${kg(data.maxKg)} kg`
        : `${kg(data.minKg)} kg och mer`
      : undefined;
  const rates = [data?.upTo600, data?.over3000].filter((rate) => typeof rate === "number");
  return (
    <span>
      {join(
        [range, rates.length ? `${[...new Set(rates)].map(kg).join("–")} kr/h` : undefined],
        `Kapacitet ${(rowNumber ?? 0) + 1}`,
      )}
    </span>
  );
}
