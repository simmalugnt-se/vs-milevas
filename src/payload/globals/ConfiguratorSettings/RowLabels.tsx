"use client";

import { useRowLabel } from "@payloadcms/ui";

/**
 * The configurator settings' list rows, named by what they hold instead of "Finansieringsform
 * 02", so a row is found without opening it.
 */

const formatNumber = (value: number) => new Intl.NumberFormat("sv-SE").format(value);

/** "Leasing · 24–84 mån, förvalt 48 · 5,95 % ränta" or "Långtidshyra · … · 500 h/år". */
export function FinancingRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    label?: string;
    kind?: string;
    minMonths?: number;
    maxMonths?: number;
    months?: number;
    interestRate?: number;
    rental?: boolean;
    driveHoursPerYear?: number;
  }>();
  const monthly = data?.kind === "monthly";
  const range =
    monthly && data?.minMonths && data?.maxMonths
      ? `${data.minMonths}–${data.maxMonths} mån${data.months ? `, förvalt ${data.months}` : ""}`
      : monthly && data?.months
        ? `${data.months} mån`
        : undefined;
  const interest =
    monthly && data?.interestRate ? `${formatNumber(data.interestRate)} % ränta` : undefined;
  const hours =
    monthly && data?.rental && data.driveHoursPerYear
      ? `${formatNumber(data.driveHoursPerYear)} h/år`
      : undefined;
  return (
    <span>
      {[data?.label || `Finansieringsform ${(rowNumber ?? 0) + 1}`, range, interest, hours]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}

/** "37–48 mån · 20 %". */
export function ResidualValueRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    minMonths?: number;
    maxMonths?: number;
    percent?: number;
  }>();
  const range =
    data?.minMonths != null && data?.maxMonths != null
      ? `${data.minMonths}–${data.maxMonths} mån`
      : `Restvärde ${(rowNumber ?? 0) + 1}`;
  return (
    <span>
      {[range, data?.percent != null ? `${formatNumber(data.percent)} %` : undefined]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}
