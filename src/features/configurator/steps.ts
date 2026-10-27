/**
 * The configurator's steps after the truck type. The variants (Lyftkapacitet) are always the first
 * of them: the base price is theirs and everything else adds to it. The settings name that step and
 * order and name the others, listed here with their keys in the address, the list on the truck type
 * each is built from and their names when the settings give none. The truck type's lists decide
 * whether each is shown (see `stepRole`).
 */
export const MODEL_STEP = { key: "model", list: "models", label: "Lyftkapacitet" } as const;

export const CHOICE_STEPS = [
  { key: "battery", list: "batteries", label: "Batteri" },
  { key: "lift-height", list: "liftHeights", label: "Lyfthöjd" },
  { key: "extras", list: "extras", label: "Tillval" },
] as const;

export type ChoiceStepKey = (typeof CHOICE_STEPS)[number]["key"];

export type StepKey = ChoiceStepKey | typeof MODEL_STEP.key;

export type StepSetting = { step: ChoiceStepKey; label: string };

const isStepKey = (value: unknown): value is ChoiceStepKey =>
  CHOICE_STEPS.some((step) => step.key === value);

/**
 * The steps after the variants in the settings' order, each once. One the settings leave out goes
 * back at its default place, or last, so a step is never lost to a removed row.
 */
export function orderedSteps(
  rows: Array<{ step?: string | null; label?: unknown }> | null | undefined,
): StepSetting[] {
  const steps: StepSetting[] = [];
  for (const row of rows ?? []) {
    if (isStepKey(row.step) && !steps.some((step) => step.step === row.step)) {
      const fallback = CHOICE_STEPS.find((step) => step.key === row.step)?.label ?? "";
      // A label read in every locale at once is an object; only a text names the step.
      const label = typeof row.label === "string" ? row.label.trim() : "";
      steps.push({ step: row.step, label: label || fallback });
    }
  }
  CHOICE_STEPS.forEach((step, index) => {
    if (!steps.some((candidate) => candidate.step === step.key)) {
      steps.splice(Math.min(index, steps.length), 0, { step: step.key, label: step.label });
    }
  });
  return steps;
}

/**
 * What a list on the truck type becomes: the variants and the extras are a step when there are
 * any; a battery or mast is a step when there is more than one to choose from, part of the truck
 * when there is one and left out when there is none.
 */
export function stepRole(step: StepKey, count: number): "choice" | "included" | "none" {
  if (count === 0) return "none";
  if (step === "model" || step === "extras" || count > 1) return "choice";
  return "included";
}
