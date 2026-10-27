"use client";

import { useAllFormFields } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";
import { useEffect, useState } from "react";
import {
  CHOICE_STEPS,
  MODEL_STEP,
  orderedSteps,
  type StepKey,
  type StepSetting,
  stepRole,
} from "@/features/configurator/steps";

/**
 * What the configurator makes of the truck type, read from the form as it is edited: its steps in
 * the settings' order, numbered as the configurator numbers them (1 is the truck type), what is
 * part of the truck because it is alone, what is left out and the price the configurator starts at. The rule that one battery or mast is no step is otherwise
 * nowhere to be seen.
 */

type Row = { defaultSelected?: boolean; price?: number } & Record<string, unknown>;

const kr = (value: number) => `${new Intl.NumberFormat("sv-SE").format(value)} kr`;
const plain = (value: unknown) => (typeof value === "string" ? value.replaceAll("|", "") : "");

/** An alone option as the quote names it. */
function describe(step: StepKey, row: Row) {
  if (step === "lift-height") return `${row.liftHeight ?? "?"} mm`;
  return [plain(row.label), plain(row.capacity)].filter(Boolean).join(", ");
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function ConfiguratorOverview() {
  const [fields] = useAllFormFields();
  const data = reduceFieldsToValues(fields, true) as Record<string, unknown>;
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

  const rows = (name: string) => (Array.isArray(data[name]) ? (data[name] as Row[]) : []);
  const models = rows("models");
  const steps = order.map((setting) => {
    const list = rows(
      [MODEL_STEP, ...CHOICE_STEPS].find((step) => step.key === setting.step)?.list ?? "",
    );
    return { ...setting, list, role: stepRole(setting.step, list.length) };
  });
  const chosen = steps.filter((step) => step.role === "choice");
  const included = steps.filter((step) => step.role === "included");
  const missing = steps.filter((step) => step.role === "none");

  // Lists to choose from without exactly one default (the extras have none).
  const noDefault = chosen.filter(
    ({ step, list }) =>
      step !== "extras" &&
      !(step === "model" && list.length === 1) &&
      list.filter((row) => row.defaultSelected === true).length !== 1,
  );

  const startModel = models.length === 1 ? models[0] : models.find((row) => row.defaultSelected);
  const startPrice =
    startModel && typeof startModel.price === "number"
      ? startModel.price +
        [...included, ...chosen.filter((step) => step.step !== "model")]
          .flatMap((step) =>
            step.role === "included" ? step.list : step.list.filter((row) => row.defaultSelected),
          )
          .reduce((sum, row) => sum + (typeof row.price === "number" ? row.price : 0), 0)
      : undefined;

  const box = {
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: "var(--style-radius-m)",
    padding: "calc(var(--base) * 0.8)",
    marginBottom: "var(--base)",
  };
  const muted = { color: "var(--theme-elevation-500)", margin: 0 };

  if (models.length === 0) {
    return (
      <div style={box}>
        <h4 style={{ margin: "0 0 calc(var(--base) * 0.4)" }}>Så här blir konfiguratorn</h4>
        <p style={muted}>
          Trucktypen går inte att konfigurera förrän den har minst en variant. Tills dess länkar
          kort och menyer till Länk utan varianter under Om trucktypen.
        </p>
      </div>
    );
  }

  return (
    <div style={box}>
      <h4 style={{ margin: "0 0 calc(var(--base) * 0.4)" }}>Så här blir konfiguratorn</h4>
      <ol start={2} style={{ margin: "0 0 calc(var(--base) * 0.4)", paddingLeft: "1.25rem" }}>
        {chosen.map((step) => (
          <li key={step.step}>
            <strong>{step.label}</strong>:{" "}
            {step.step === "model"
              ? step.list.length === 1
                ? "en variant, förvald"
                : `${step.list.length} varianter att välja mellan`
              : step.step === "extras"
                ? `${count(step.list.length, "att lägga till", "att välja bland")}, inget krävs`
                : `${step.list.length} att välja mellan`}
          </li>
        ))}
      </ol>
      {included.map((step) => (
        <p key={step.step} style={muted}>
          Ingår i trucken: {step.label.toLowerCase()} {describe(step.step, step.list[0])}. Det är
          ensamt och blir därför inget steg; priset läggs på grundpriset.
        </p>
      ))}
      {missing.length > 0 ? (
        <p style={muted}>
          Visas inte: {missing.map((step) => step.label.toLowerCase()).join(" och ")}, eftersom
          listan är tom.
        </p>
      ) : null}
      {startPrice !== undefined ? <p style={muted}>Pris med förvalen: {kr(startPrice)}.</p> : null}
      {noDefault.map(({ label }) => (
        <p key={label} style={{ color: "var(--theme-error-500)", margin: 0 }}>
          {label}: markera exakt ett alternativ som förvalt.
        </p>
      ))}
      <p style={{ ...muted, marginTop: "calc(var(--base) * 0.4)" }}>
        Steg 1 är valet av trucktyp. Stegens ordning och namn ställs in i Konfiguratorinställningar.
      </p>
    </div>
  );
}
