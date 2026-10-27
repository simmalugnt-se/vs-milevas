"use client";

import { useRowLabel } from "@payloadcms/ui";
import { CHOICE_STEPS } from "@/features/configurator/steps";

/**
 * The configurator settings' list rows, named by what they hold instead of "Steg 01" or
 * "Finansieringsform 02", so a row is found without opening it.
 */

/** "Steg 3 · Batteri": the step's number in the configurator, after the truck type and variants. */
export function StepRowLabel() {
  const { data, rowNumber } = useRowLabel<{ step?: string; label?: string }>();
  const name = data?.label || CHOICE_STEPS.find((step) => step.key === data?.step)?.label;
  return <span>{[`Steg ${(rowNumber ?? 0) + 3}`, name].filter(Boolean).join(" · ")}</span>;
}

/** "Leasing · 24–84 mån, förvalt 48 · restvärde 10 %". */
export function FinancingRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    label?: string;
    kind?: string;
    minMonths?: number;
    maxMonths?: number;
    months?: number;
    residualPercent?: number;
  }>();
  const monthly = data?.kind === "monthly";
  const range =
    monthly && data?.minMonths && data?.maxMonths
      ? `${data.minMonths}–${data.maxMonths} mån${data.months ? `, förvalt ${data.months}` : ""}`
      : monthly && data?.months
        ? `${data.months} mån`
        : undefined;
  const residual =
    monthly && data?.residualPercent
      ? `restvärde ${new Intl.NumberFormat("sv-SE").format(data.residualPercent)} %`
      : undefined;
  return (
    <span>
      {[data?.label || `Finansieringsform ${(rowNumber ?? 0) + 1}`, range, residual]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}
