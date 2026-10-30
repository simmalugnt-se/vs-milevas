/**
 * The steps that come from the models' own fields, a row's type under Val: each offers the
 * values the models have, and choosing one leaves the models with it. "Modell" offers the models
 * themselves.
 */
export const MODEL_STEPS = [
  { key: "capacity", label: "Lyftkapacitet" },
  { key: "wheels", label: "Hjulantal" },
  { key: "series", label: "Serie" },
  { key: "model", label: "Modell" },
] as const;

export type ModelStep = (typeof MODEL_STEPS)[number]["key"];
export type ModelProperty = Exclude<ModelStep, "model">;

export const isModelStep = (value: unknown): value is ModelStep =>
  MODEL_STEPS.some((step) => step.key === value);

export const modelStepLabel = (step: ModelStep) =>
  MODEL_STEPS.find((candidate) => candidate.key === step)?.label ?? step;

/** "1,5 ton". */
export const tons = (kg: number) =>
  `${new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kg / 1000)} ton`;

/** "KBET G1" → "kbet-g1": a value as a key in the address, which takes `[a-z0-9-]` only. */
export const valueKey = (text: string) =>
  text
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** A model's value for a property: its key in the address and its name, or none. */
export function propertyValue(
  property: ModelProperty,
  model: { capacityKg?: number | null; wheels?: string | null; series?: string | null },
): { key: string; label: string } | undefined {
  if (property === "capacity") {
    return typeof model.capacityKg === "number"
      ? { key: String(model.capacityKg), label: tons(model.capacityKg) }
      : undefined;
  }
  if (property === "wheels") {
    return model.wheels ? { key: model.wheels, label: `${model.wheels} hjul` } : undefined;
  }
  const series = model.series?.trim();
  return series && valueKey(series) ? { key: valueKey(series), label: series } : undefined;
}
