"use client";

import { useAllFormFields } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";
import { MODEL_STEPS } from "@/features/configurator/steps";

type Group = { id?: string; label?: string; multiple?: boolean };

/**
 * What "Steg i konfiguratorn" can hold, read from the form as it is edited: the steps from the
 * models' fields and each group under Val, by the key the step stores.
 */
export function useStepChoices() {
  const [fields] = useAllFormFields();
  const data = reduceFieldsToValues(fields, true) as { choices?: Group[] };
  return [
    ...MODEL_STEPS.map(({ key, label }) => ({ value: key, label, source: "från modellerna" })),
    ...(data.choices ?? []).flatMap((group) =>
      group.id
        ? [
            {
              value: group.id,
              label: (group.label ?? "").replaceAll("|", "").trim() || "Val",
              source: group.multiple ? "flerval" : "enkelval",
            },
          ]
        : [],
    ),
  ];
}
