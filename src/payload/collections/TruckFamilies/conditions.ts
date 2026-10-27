/**
 * Conditions between a truck type's lists: a battery, mast or extra can be shown only for some
 * lift capacities, batteries or masts ("Visas för"). Stored on the row as `availableFor`, the ids
 * of the rows it is shown for, per list; a list left out sets no condition. Extras are chosen
 * freely and set no conditions on others.
 */
export const CONDITION_LISTS = [
  { list: "models", step: "model", label: "Lyftkapacitet" },
  { list: "batteries", step: "battery", label: "Batteri" },
  { list: "liftHeights", step: "lift-height", label: "Lyfthöjd" },
] as const;

export type ConditionList = (typeof CONDITION_LISTS)[number]["list"];

export type AvailableFor = Partial<Record<ConditionList, string[]>>;

/** A row as the conditions read it: its id and what names it. */
export type ConditionRow = {
  id?: string | null;
  capacityKg?: number | null;
  label?: string | null;
  liftHeight?: number | null;
  availableFor?: unknown;
};

const tons = (kg: number) =>
  `${new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kg / 1000)} ton`;

/** "1,6 ton", "Stort batteri" or "4700 mm", as the configurator names the row. */
export function conditionRowLabel(list: ConditionList, row: ConditionRow): string {
  if (list === "models") return row.capacityKg ? tons(row.capacityKg) : "Ny variant";
  if (list === "liftHeights") return row.liftHeight ? `${row.liftHeight} mm` : "Ny mast";
  return row.label?.replaceAll("|", "") || "Nytt batteri";
}

/** The stored value, read safely: only lists of ids. */
export function readAvailableFor(value: unknown): AvailableFor {
  const conditions: AvailableFor = {};
  if (!value || typeof value !== "object") return conditions;
  for (const { list } of CONDITION_LISTS) {
    const ids = (value as Record<string, unknown>)[list];
    if (Array.isArray(ids)) {
      conditions[list] = ids.filter((id): id is string => typeof id === "string");
    }
  }
  return conditions;
}

/** The conditions by the configurator's step keys, for its options. */
export function conditionsByStep(value: unknown): Record<string, string[]> | undefined {
  const conditions = readAvailableFor(value);
  const byStep: Record<string, string[]> = {};
  for (const { list, step } of CONDITION_LISTS) {
    const ids = conditions[list];
    if (ids) byStep[step] = ids;
  }
  return Object.keys(byStep).length > 0 ? byStep : undefined;
}

const NOUN: Record<ConditionList, string> = {
  models: "ingen variant",
  batteries: "inget batteri",
  liftHeights: "ingen mast",
};

/**
 * For a list the customer must choose from (more than one row), every row of every other list it
 * sets conditions on must leave at least one row to choose: a message naming the first that does
 * not, or true.
 */
export function checkEveryRowHasOption(
  list: ConditionList,
  data: Partial<Record<ConditionList, ConditionRow[] | null>> | undefined,
): true | string {
  const rows = data?.[list] ?? [];
  if (rows.length < 2) return true;
  for (const source of CONDITION_LISTS) {
    if (source.list === list) continue;
    for (const sourceRow of data?.[source.list] ?? []) {
      if (!sourceRow.id) continue;
      const shown = rows.some((row) => {
        const allowed = readAvailableFor(row.availableFor)[source.list];
        return !allowed || allowed.includes(sourceRow.id as string);
      });
      if (!shown) {
        const name = conditionRowLabel(source.list, sourceRow);
        return `Med ${source.label.toLowerCase()} ${name} visas ${NOUN[list]}. Kryssa i den under "Visas för" på minst en rad.`;
      }
    }
  }
  return true;
}
