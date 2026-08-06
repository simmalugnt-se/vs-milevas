"use client";

import type { TypedLocale } from "payload";
import { useEffect, useReducer } from "react";
import { frontendPath } from "@/i18n/frontend-path";
import {
  buildQuote,
  firstIncompleteStep,
  firstInvalidSelectionStep,
  isOptionAvailable,
  sanitizeSelections,
} from "./engine";
import { CallRequestForm } from "./RequestForms";
import type {
  ConfiguratorCatalog,
  ConfiguratorFamily,
  ConfiguratorGroup,
  SelectionState,
} from "./types";
import { buildConfiguratorSearchParams, parseConfiguratorSearchParams } from "./url-state";

type State = {
  hydrated: boolean;
  familyKey?: string;
  selections: SelectionState;
  financingKey?: string;
  step: number;
};

type Action =
  | { type: "hydrate"; state: Omit<State, "hydrated"> }
  | { type: "selectFamily"; family: ConfiguratorFamily }
  | { type: "toggleOption"; family: ConfiguratorFamily; group: ConfiguratorGroup; key: string }
  | { type: "selectFinancing"; key: string }
  | { type: "setStep"; step: number };

const initialState: State = { hydrated: false, selections: {}, step: 0 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...action.state, hydrated: true };
    case "selectFamily":
      return {
        hydrated: true,
        familyKey: action.family.key,
        selections: sanitizeSelections(action.family, {}, true),
        financingKey: undefined,
        step: 0,
      };
    case "toggleOption": {
      const selected = state.selections[action.group.key] ?? [];
      const nextGroupSelection =
        action.group.selectionMode === "single"
          ? [action.key]
          : selected.includes(action.key)
            ? selected.filter((key) => key !== action.key)
            : [...selected, action.key];
      return {
        ...state,
        selections: sanitizeSelections(
          action.family,
          { ...state.selections, [action.group.key]: nextGroupSelection },
          true,
        ),
      };
    }
    case "selectFinancing":
      return { ...state, financingKey: action.key };
    case "setStep":
      return { ...state, step: action.step };
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function groupComplete(group: ConfiguratorGroup, selections: SelectionState) {
  return !group.required || (selections[group.key]?.length ?? 0) > 0;
}

function priceLabel(priceMode: "included" | "add" | "replaceBase", price: number) {
  if (priceMode === "included") return "Ingår";
  if (priceMode === "add") return `+${formatPrice(price)}`;
  return formatPrice(price);
}

export function ConfiguratorClient({
  catalog,
  locale,
}: {
  catalog: ConfiguratorCatalog;
  locale: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const family = catalog.families.find((candidate) => candidate.key === state.familyKey);
  const maxStep = family ? family.steps.length + 1 : 0;
  const currentConfigStep = family && state.step > 0 ? family.steps[state.step - 1] : undefined;
  const financingStep = Boolean(family && state.step === maxStep);
  const purchaseKey =
    catalog.financingMethods.find((method) => method.kind === "purchase")?.key ??
    catalog.financingMethods[0]?.key;

  useEffect(() => {
    const parsed = parseConfiguratorSearchParams(new URLSearchParams(window.location.search));
    const parsedFamily = catalog.families.find((candidate) => candidate.key === parsed.familyKey);
    if (!parsedFamily) {
      dispatch({
        type: "hydrate",
        state: { familyKey: undefined, selections: {}, financingKey: undefined, step: 0 },
      });
      return;
    }

    const selections = sanitizeSelections(parsedFamily, parsed.selections, true);
    const incomplete = firstIncompleteStep(parsedFamily, selections);
    const invalid = firstInvalidSelectionStep(parsedFamily, parsed.selections, selections);
    const desiredStep = Math.min(parsed.step ?? 0, parsedFamily.steps.length + 1);
    const earliestAffected = [incomplete, invalid]
      .filter((value): value is number => value !== null)
      .reduce<number | null>((earliest, value) => Math.min(earliest ?? value, value), null);
    dispatch({
      type: "hydrate",
      state: {
        familyKey: parsedFamily.key,
        selections,
        financingKey: catalog.financingMethods.some((method) => method.key === parsed.financingKey)
          ? parsed.financingKey
          : undefined,
        step:
          earliestAffected !== null && desiredStep > earliestAffected + 1
            ? earliestAffected + 1
            : desiredStep,
      },
    });
  }, [catalog]);

  useEffect(() => {
    if (!state.hydrated) return;
    const params = buildConfiguratorSearchParams({
      family,
      selections: state.selections,
      financingKey: state.financingKey,
      step: state.step,
    });
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [family, state.financingKey, state.hydrated, state.selections, state.step]);

  const previewFinancing = state.financingKey ?? purchaseKey;
  const quote =
    family && previewFinancing
      ? buildQuote(catalog, family.key, state.selections, previewFinancing)
      : null;

  const currentComplete =
    state.step === 0
      ? Boolean(family)
      : financingStep
        ? Boolean(state.financingKey)
        : Boolean(
            currentConfigStep?.groups.every((group) => groupComplete(group, state.selections)),
          );

  const quoteParams = family
    ? buildConfiguratorSearchParams({
        family,
        selections: state.selections,
        financingKey: state.financingKey,
      })
    : null;
  const quoteHref = quoteParams
    ? `${frontendPath("/configurator/quote", locale as TypedLocale)}?${quoteParams.toString()}`
    : "#";

  if (!state.hydrated) {
    return (
      <div className="min-h-64 border border-neutral-300 bg-neutral-50 p-6" aria-live="polite">
        Laddar konfiguratorn…
      </div>
    );
  }

  if (catalog.families.length === 0) {
    return <p>Det finns inga publicerade truckfamiljer ännu.</p>;
  }

  const steps = [
    "Trucktyp",
    ...(family?.steps.map((step) => step.label) ?? []),
    ...(family ? ["Finansiering"] : []),
  ];
  const incompleteStep = family ? firstIncompleteStep(family, state.selections) : null;
  const highestReachableStep = family
    ? incompleteStep === null
      ? maxStep
      : incompleteStep + 1
    : 0;

  return (
    <div className="space-y-5">
      <nav className="overflow-x-auto border-y border-neutral-300" aria-label="Konfiguratorsteg">
        <ol className="flex min-w-max">
          {steps.map((label, index) => {
            const current = state.step === index;
            const complete = index < state.step && index <= highestReachableStep;
            return (
              <li className="flex" key={`${index}-${label}`}>
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  className={`flex min-w-36 items-center gap-3 border-r border-neutral-300 px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-neutral-400 ${
                    current ? "bg-neutral-950 text-white" : "bg-white hover:bg-neutral-50"
                  }`}
                  disabled={index > highestReachableStep}
                  onClick={() => dispatch({ type: "setStep", step: index })}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center border text-xs ${
                      current
                        ? "border-white"
                        : complete
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-400"
                    }`}
                    aria-hidden="true"
                  >
                    {complete ? "✓" : index + 1}
                  </span>
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="border border-neutral-300 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-50 px-5 py-3 text-xs uppercase tracking-[0.16em] text-neutral-600">
            <span>Konfigurera truck</span>
            <span>
              Steg {state.step + 1} av {steps.length}
            </span>
          </div>

          <div className="min-h-[440px] p-5 sm:p-7">
            {state.step === 0 ? (
              <fieldset className="space-y-5">
                <legend className="text-2xl font-semibold tracking-tight">Välj trucktyp</legend>
                <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                  Välj den truckfamilj som bäst passar verksamheten. Du kan ändra ditt val senare.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {catalog.families.map((candidate) => {
                    const checked = family?.key === candidate.key;
                    return (
                      <label
                        className={`group relative cursor-pointer border p-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-950 ${
                          checked
                            ? "border-neutral-950 bg-neutral-50"
                            : "border-neutral-300 hover:border-neutral-600"
                        }`}
                        key={candidate.key}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="truck-family"
                          value={candidate.key}
                          checked={checked}
                          onChange={() => dispatch({ type: "selectFamily", family: candidate })}
                        />
                        <span className="mb-4 grid aspect-[16/9] place-items-center border border-neutral-300 bg-neutral-100 text-xs uppercase tracking-[0.18em] text-neutral-500">
                          Produktbild
                        </span>
                        <span className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                              checked ? "border-neutral-950" : "border-neutral-400"
                            }`}
                            aria-hidden="true"
                          >
                            {checked ? (
                              <span className="size-2.5 rounded-full bg-neutral-950" />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <strong className="block leading-5">{candidate.name}</strong>
                            <span className="mt-1 block text-sm text-neutral-600">
                              Från {formatPrice(candidate.basePrice)}
                            </span>
                          </span>
                        </span>
                        {candidate.description ? (
                          <span className="mt-3 block border-t border-neutral-200 pt-3 text-sm leading-5 text-neutral-600">
                            {candidate.description}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {currentConfigStep && family ? (
              <div className="space-y-8">
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {currentConfigStep.heading}
                  </h2>
                  {currentConfigStep.description ? (
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {currentConfigStep.description}
                    </p>
                  ) : null}
                </div>
                {currentConfigStep.groups.map((group) => (
                  <fieldset className="space-y-3" key={group.key}>
                    <legend className="font-semibold">{group.label}</legend>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      {group.selectionMode === "multiple" ? "Flera val möjliga" : "Välj ett"}
                      {group.required ? " · Obligatoriskt" : " · Valfritt"}
                    </p>
                    {group.description ? (
                      <p className="text-sm leading-6 text-neutral-600">{group.description}</p>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.options.map((option) => {
                        const checked = (state.selections[group.key] ?? []).includes(option.key);
                        const available = isOptionAvailable(option, state.selections);
                        return (
                          <label
                            className={`relative flex min-h-28 gap-3 border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-950 ${
                              available
                                ? checked
                                  ? "cursor-pointer border-neutral-950 bg-neutral-50"
                                  : "cursor-pointer border-neutral-300 hover:border-neutral-600"
                                : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400"
                            }`}
                            key={option.key}
                          >
                            <input
                              className="sr-only"
                              type={group.selectionMode === "single" ? "radio" : "checkbox"}
                              name={group.key}
                              checked={checked}
                              disabled={!available}
                              onChange={() =>
                                dispatch({ type: "toggleOption", family, group, key: option.key })
                              }
                            />
                            <span
                              className={`mt-0.5 grid size-5 shrink-0 place-items-center border ${
                                group.selectionMode === "single" ? "rounded-full" : ""
                              } ${checked ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-400"}`}
                              aria-hidden="true"
                            >
                              {checked ? (group.selectionMode === "single" ? "●" : "✓") : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-start justify-between gap-2">
                                <strong className="leading-5">{option.label}</strong>
                                <span className="whitespace-nowrap text-sm font-medium">
                                  {priceLabel(option.priceMode, option.price)}
                                </span>
                              </span>
                              {option.description ? (
                                <span className="mt-2 block text-sm leading-5 text-neutral-600">
                                  {option.description}
                                </span>
                              ) : null}
                              {!available ? (
                                <span className="mt-2 block text-xs uppercase tracking-wider">
                                  Kräver ett annat tidigare val
                                </span>
                              ) : null}
                            </span>
                            {option.defaultSelected ? (
                              <span className="absolute bottom-3 right-3 border border-neutral-300 bg-white px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-600">
                                Förvalt
                              </span>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            ) : null}

            {financingStep ? (
              <fieldset className="space-y-5">
                <legend className="text-2xl font-semibold tracking-tight">Välj finansiering</legend>
                <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                  Jämför köp med månadskostnad. Slutliga villkor bekräftas av säljare.
                </p>
                <div className="grid gap-3">
                  {catalog.financingMethods.map((method) => {
                    const amount = quote
                      ? method.kind === "purchase"
                        ? quote.totalPrice
                        : Math.round(quote.totalPrice * (method.monthlyFactor ?? 0))
                      : 0;
                    const checked = state.financingKey === method.key;
                    return (
                      <label
                        className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-950 sm:items-center ${
                          checked
                            ? "border-neutral-950 bg-neutral-50"
                            : "border-neutral-300 hover:border-neutral-600"
                        }`}
                        key={method.key}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="financing"
                          checked={checked}
                          onChange={() => dispatch({ type: "selectFinancing", key: method.key })}
                        />
                        <span
                          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border sm:mt-0 ${
                            checked ? "border-neutral-950" : "border-neutral-400"
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? (
                            <span className="size-2.5 rounded-full bg-neutral-950" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block">{method.label}</strong>
                          {method.description ? (
                            <span className="mt-1 block text-sm text-neutral-600">
                              {method.description}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-right font-semibold sm:text-lg">
                          {formatPrice(amount)}
                          {method.kind === "monthly" ? (
                            <span className="block text-xs font-normal text-neutral-500">
                              per månad
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-neutral-300 bg-neutral-50 px-5 py-4 sm:px-7">
            <button
              type="button"
              className="border border-neutral-400 bg-white px-4 py-2.5 text-sm font-medium hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={state.step === 0}
              onClick={() => dispatch({ type: "setStep", step: Math.max(0, state.step - 1) })}
            >
              ← Tillbaka
            </button>
            {financingStep ? (
              <a
                aria-disabled={!currentComplete}
                className={`border border-neutral-950 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white ${
                  currentComplete ? "hover:bg-neutral-800" : "pointer-events-none opacity-40"
                }`}
                href={currentComplete ? quoteHref : undefined}
              >
                Visa offert →
              </a>
            ) : (
              <button
                type="button"
                className="border border-neutral-950 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!currentComplete}
                onClick={() =>
                  dispatch({ type: "setStep", step: Math.min(maxStep, state.step + 1) })
                }
              >
                Nästa steg →
              </button>
            )}
          </div>
        </div>

        <aside className="border border-neutral-300 bg-white lg:sticky lg:top-5" aria-live="polite">
          <div className="border-b border-neutral-300 bg-neutral-50 px-5 py-3 text-xs uppercase tracking-[0.16em] text-neutral-600">
            Din konfiguration
          </div>
          <div className="p-5">
            {family ? (
              <div className="space-y-5">
                <div className="grid aspect-[16/8] place-items-center border border-neutral-300 bg-neutral-100 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Produktbild
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{family.name}</h2>
                  {quote?.sku ? (
                    <p className="mt-1 font-mono text-xs text-neutral-500">Art.nr {quote.sku}</p>
                  ) : null}
                </div>
                {quote && quote.selectedOptions.length > 0 ? (
                  <dl className="space-y-2 border-y border-neutral-200 py-4 text-sm">
                    {quote.selectedOptions.map((option) => (
                      <div
                        className="flex justify-between gap-4"
                        key={`${option.groupKey}.${option.optionKey}`}
                      >
                        <dt className="text-neutral-600">{option.label}</dt>
                        <dd className="shrink-0">{priceLabel(option.priceMode, option.price)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="border-y border-neutral-200 py-4 text-sm text-neutral-500">
                    Dina val visas här efter hand.
                  </p>
                )}
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm text-neutral-600">Estimerat totalpris</span>
                  <strong className="text-xl">
                    {formatPrice(quote?.totalPrice ?? family.basePrice)}
                  </strong>
                </div>
                <p className="text-xs leading-5 text-neutral-500">
                  Pris och tillgänglighet bekräftas i den slutliga offerten.
                </p>
                {quote ? (
                  <CallRequestForm
                    familyKey={family.key}
                    financingKey={previewFinancing ?? "purchase"}
                    locale={locale}
                    selections={state.selections}
                  />
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid aspect-[16/8] place-items-center border border-dashed border-neutral-300 bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Produktbild
                </div>
                <p className="text-sm leading-6 text-neutral-600">
                  Välj en trucktyp för att börja bygga din konfiguration.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
