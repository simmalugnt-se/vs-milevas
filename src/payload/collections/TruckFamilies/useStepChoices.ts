"use client";

import { useAllFormFields } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";
import { MODEL_STEPS } from "@/features/configurator/steps";

type Group = { id?: string; label?: string };

/**
 * What "Steg i konfiguratorn" can hold, read from the form as it is edited: the steps from the
 * models' fields and each group under Utrustning, by the key the step stores.
 */
export function useStepChoices() {
  const [fields] = useAllFormFields();
  const data = reduceFieldsToValues(fields, true) as { equipment?: Group[]; extras?: Group[] };
  const groups = (list: Group[] | undefined, source: string) =>
    (list ?? []).flatMap((group) =>
      group.id
        ? [{ value: group.id, label: (group.label ?? "").replaceAll("|", "") || "Grupp", source }]
        : [],
    );
  return [
    ...MODEL_STEPS.map(({ key, label }) => ({ value: key, label, source: "från modellerna" })),
    ...groups(data.equipment, "från Utrustning"),
    ...groups(data.extras, "från Tillval"),
  ];
}
