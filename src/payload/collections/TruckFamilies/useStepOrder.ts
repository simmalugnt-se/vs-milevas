"use client";

import { useEffect, useState } from "react";
import {
  MODEL_STEP,
  orderedSteps,
  type StepKey,
  type StepSetting,
} from "@/features/configurator/steps";

/**
 * The configurator's steps after the truck type, in the order and with the names the settings
 * give them (their draft, as an editor sees it); the defaults until the settings are read.
 */
export function useStepOrder() {
  const [order, setOrder] = useState<Array<{ step: StepKey; label: string }>>(() => [
    { step: MODEL_STEP.key, label: MODEL_STEP.label },
    ...orderedSteps([]),
  ]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/globals/configurator-settings?depth=0&draft=true", {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: { modelStepLabel?: string; steps?: StepSetting[] } | null) => {
        if (settings) {
          setOrder([
            { step: MODEL_STEP.key, label: settings.modelStepLabel || MODEL_STEP.label },
            ...orderedSteps(settings.steps),
          ]);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return order;
}
