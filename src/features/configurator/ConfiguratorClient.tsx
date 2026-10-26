"use client";

import Image from "next/image";
import type { TypedLocale } from "payload";
import { type ReactNode, useEffect, useReducer, useState } from "react";
import { ConfiguratorScreen } from "@/components/blocks/configurator-screen";
import { ConfiguratorSkeleton } from "@/components/blocks/configurator-skeleton";
import { ConfiguratorStep } from "@/components/blocks/configurator-step";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxChoice } from "@/components/ui/checkbox-choice";
import { PriceBox } from "@/components/ui/price-box";
import { frontendPath } from "@/i18n/frontend-path";
import {
  calculateFinancingPrice,
  choiceDisplay,
  choiceSatisfied,
  estimateTotal,
  familySteps,
  firstIncompleteStep,
  firstInvalidSelectionStep,
  MODEL_CHOICE,
  sanitizeSelections,
} from "./engine";
import { CallRequestForm, RequestDialog } from "./RequestForms";
import type {
  ConfiguratorCatalog,
  ConfiguratorChoice,
  ConfiguratorFamily,
  SelectionState,
} from "./types";
import { buildConfiguratorSearchParams, parseConfiguratorSearchParams } from "./url-state";

type State = {
  hydrated: boolean;
  familyKey?: string;
  selections: SelectionState;
  financingKey?: string;
  serviceAgreement: boolean;
  step: number;
};

type Action =
  | { type: "hydrate"; state: Omit<State, "hydrated"> }
  | { type: "selectFamily"; family: ConfiguratorFamily }
  | { type: "toggleOption"; family: ConfiguratorFamily; choice: ConfiguratorChoice; key: string }
  | { type: "selectFinancing"; key: string; serviceAgreementEligible: boolean }
  | { type: "toggleServiceAgreement" }
  | { type: "setStep"; step: number };

const initialState: State = { hydrated: false, selections: {}, serviceAgreement: false, step: 0 };

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
        serviceAgreement: false,
        step: 0,
      };
    case "toggleOption": {
      const selected = state.selections[action.choice.key] ?? [];
      const nextChoiceSelection =
        action.choice.selectionMode === "single"
          ? [action.key]
          : selected.includes(action.key)
            ? selected.filter((key) => key !== action.key)
            : [...selected, action.key];
      return {
        ...state,
        selections: sanitizeSelections(
          action.family,
          { ...state.selections, [action.choice.key]: nextChoiceSelection },
          true,
        ),
      };
    }
    case "selectFinancing":
      return {
        ...state,
        financingKey: action.key,
        serviceAgreement: action.serviceAgreementEligible ? state.serviceAgreement : false,
      };
    case "toggleServiceAgreement":
      return { ...state, serviceAgreement: !state.serviceAgreement };
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

/** A model's price as it is; an option's as an addition, or "Ingår" when it adds nothing. */
function priceLabel(choice: ConfiguratorChoice, price: number) {
  if (choice.key === MODEL_CHOICE) return formatPrice(price);
  return price === 0 ? "Ingår" : `+${formatPrice(price)}`;
}

/** The price the configuration starts at: the defaults. */
const startPrice = (family: ConfiguratorFamily) =>
  estimateTotal(family, sanitizeSelections(family, {}));

const stepNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * The truck configurator on Figma's step screen (`ConfiguratorScreen`): truck type, the family's
 * steps (its model, then its choices, each as its Figma step type), then financing, one screen
 * each, numbered `[01]`, `[02]` and so on. The price box shows the total and the monthly prices;
 * "Boka samtal" opens the call request in a dialog once a truck type is chosen; "Visa offert"
 * leads to the quote page.
 */
export function ConfiguratorClient({
  catalog,
  locale,
}: {
  catalog: ConfiguratorCatalog;
  locale: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [callOpen, setCallOpen] = useState(false);
  const families = catalog.families.filter((candidate) => familySteps(candidate).length > 0);
  const family = families.find((candidate) => candidate.key === state.familyKey);
  const steps = family ? familySteps(family) : [];
  const maxStep = family ? steps.length + 1 : 0;
  const currentConfigStep = family && state.step > 0 ? steps[state.step - 1] : undefined;
  const financingStep = Boolean(family && state.step === maxStep);
  const purchaseKey =
    catalog.financingMethods.find((method) => method.kind === "purchase")?.key ??
    catalog.financingMethods[0]?.key;
  useEffect(() => {
    const parsed = parseConfiguratorSearchParams(new URLSearchParams(window.location.search));
    const parsedFamily = catalog.families.find(
      (candidate) => candidate.key === parsed.familyKey && familySteps(candidate).length > 0,
    );
    if (!parsedFamily) {
      dispatch({
        type: "hydrate",
        state: {
          familyKey: undefined,
          selections: {},
          financingKey: undefined,
          serviceAgreement: false,
          step: 0,
        },
      });
      return;
    }

    const selections = sanitizeSelections(parsedFamily, parsed.selections, true);
    const incomplete = firstIncompleteStep(parsedFamily, selections);
    const invalid = firstInvalidSelectionStep(parsedFamily, parsed.selections, selections);
    const desiredStep = Math.min(parsed.step ?? 0, familySteps(parsedFamily).length + 1);
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
        serviceAgreement:
          parsed.serviceAgreement &&
          catalog.financingMethods.some(
            (method) => method.key === parsed.financingKey && method.serviceAgreementEligible,
          ),
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
      serviceAgreement: state.serviceAgreement,
      step: state.step,
    });
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [
    family,
    state.financingKey,
    state.hydrated,
    state.selections,
    state.serviceAgreement,
    state.step,
  ]);

  const previewFinancing = state.financingKey ?? purchaseKey;
  const total = family ? estimateTotal(family, state.selections) : null;
  const selectedFinancing = catalog.financingMethods.find(
    (method) => method.key === state.financingKey,
  );

  const currentComplete =
    state.step === 0
      ? Boolean(family)
      : financingStep
        ? Boolean(state.financingKey)
        : Boolean(currentConfigStep && choiceSatisfied(currentConfigStep, state.selections));

  const quoteParams = family
    ? buildConfiguratorSearchParams({
        family,
        selections: state.selections,
        financingKey: state.financingKey,
        serviceAgreement: state.serviceAgreement,
      })
    : null;
  const quoteHref = quoteParams
    ? `${frontendPath("/configurator/quote", locale as TypedLocale)}?${quoteParams.toString()}`
    : "#";

  if (!state.hydrated) {
    return (
      <ConfiguratorSkeleton
        priceRows={catalog.financingMethods
          .filter((method) => method.kind === "monthly")
          .map((method) =>
            method.months ? `${method.label} (${method.months} mån)` : method.label,
          )}
      />
    );
  }

  if (families.length === 0) {
    return <p className="text-text-m">Det finns inga publicerade trucktyper ännu.</p>;
  }

  const lowestPrice = Math.min(...families.map(startPrice));
  const monthlyMethods = catalog.financingMethods.filter((method) => method.kind === "monthly");
  const totalPrice = total ?? lowestPrice;
  const number = stepNumber(state.step);

  let step: ReactNode;
  if (state.step === 0 || !family) {
    step = (
      <ConfiguratorStep
        number={number}
        label="Trucktyp"
        display="imageRows"
        wide
        options={families.map((candidate) => ({
          key: candidate.key,
          title: candidate.name,
          price: `Från ${formatPrice(startPrice(candidate))}`,
          text: candidate.description,
          selected: family?.key === candidate.key,
          image: candidate.image ? (
            <Image
              src={candidate.image.url}
              alt=""
              fill
              sizes="(width >= 64rem) 15vw, 40vw"
              className="object-contain"
            />
          ) : undefined,
          onSelect: () => dispatch({ type: "selectFamily", family: candidate }),
        }))}
      />
    );
  } else if (currentConfigStep) {
    const choice = currentConfigStep;
    step = (
      <ConfiguratorStep
        number={number}
        label={choice.label}
        display={choiceDisplay(choice)}
        options={choice.options.map((option) => ({
          key: option.key,
          title: option.label,
          price: priceLabel(choice, option.price),
          text: option.description,
          selected: (state.selections[choice.key] ?? []).includes(option.key),
          image: option.image ? (
            <Image
              src={option.image.url}
              alt=""
              fill
              sizes="(width >= 64rem) 15vw, 40vw"
              className="object-contain"
            />
          ) : undefined,
          onSelect: () => dispatch({ type: "toggleOption", family, choice, key: option.key }),
        }))}
      />
    );
  } else {
    const agreement = catalog.serviceAgreement;
    step = (
      <ConfiguratorStep
        number={number}
        label="Finansiering"
        display="prices"
        options={catalog.financingMethods.map((method) => ({
          key: method.key,
          title: method.months ? `${method.label} (${method.months} mån)` : method.label,
          price: `${formatPrice(calculateFinancingPrice(totalPrice, method))}${
            method.kind === "monthly" ? "/mån" : ""
          }`,
          selected: state.financingKey === method.key,
          onSelect: () =>
            dispatch({
              type: "selectFinancing",
              key: method.key,
              serviceAgreementEligible: method.serviceAgreementEligible,
            }),
        }))}
        addon={
          selectedFinancing?.serviceAgreementEligible && agreement ? (
            <CheckboxChoice
              label={`Lägg till ${agreement.label.toLowerCase()}`}
              price={`+${formatPrice(agreement.annualPrice)}/år`}
              checked={state.serviceAgreement}
              onChange={() => dispatch({ type: "toggleServiceAgreement" })}
            />
          ) : undefined
        }
      />
    );
  }

  const help = currentConfigStep?.help ? (
    <>
      {currentConfigStep.help}{" "}
      <button
        type="button"
        className="text-ui-primary underline underline-offset-2"
        onClick={() => setCallOpen(true)}
      >
        Kontakta oss
      </button>{" "}
      så löser vi det.
    </>
  ) : financingStep ? (
    "Alla priser visas exkl. moms. Slutliga villkor bekräftas av säljare."
  ) : undefined;

  const next = financingStep ? (
    currentComplete ? (
      <ButtonLink href={quoteHref} mode="dark" size="s" iconRight="arrow-right">
        Visa offert
      </ButtonLink>
    ) : (
      <Button mode="dark" size="s" iconRight="arrow-right" disabled>
        Visa offert
      </Button>
    )
  ) : (
    <Button
      mode="dark"
      size="s"
      iconRight="arrow-right"
      disabled={!currentComplete}
      onClick={() => dispatch({ type: "setStep", step: Math.min(maxStep, state.step + 1) })}
    >
      Nästa
    </Button>
  );

  return (
    <>
      <ConfiguratorScreen
        wide={state.step === 0 || !family}
        price={
          <PriceBox
            totalLabel={family ? "Totalpris" : "Från"}
            total={formatPrice(totalPrice)}
            rows={monthlyMethods.map((method) => ({
              label: method.months ? `${method.label} (${method.months} mån)` : method.label,
              value: `${formatPrice(calculateFinancingPrice(totalPrice, method))}/mån`,
            }))}
          />
        }
        image={
          family?.image ? (
            <Image
              src={family.image.url}
              alt={family.image.alt}
              fill
              priority
              sizes="(width >= 64rem) 60vw, 100vw"
              className="object-contain"
            />
          ) : null
        }
        step={step}
        help={help}
        actions={
          <>
            {state.step > 0 ? (
              <Button
                variant="secondary"
                size="s"
                iconLeft="arrow-left"
                iconRight={null}
                onClick={() => dispatch({ type: "setStep", step: state.step - 1 })}
              >
                Föregående
              </Button>
            ) : null}
            {next}
          </>
        }
        contact={
          <Button
            mode="dark"
            size="s"
            iconRight="call"
            className="w-full"
            disabled={!family}
            onClick={() => setCallOpen(true)}
          >
            Boka samtal
          </Button>
        }
      />
      <RequestDialog
        open={callOpen && Boolean(family)}
        onClose={() => setCallOpen(false)}
        labelledBy="call-request-heading"
      >
        {family ? (
          <CallRequestForm
            headingId="call-request-heading"
            familyKey={family.key}
            financingKey={previewFinancing ?? "purchase"}
            locale={locale}
            selections={state.selections}
            serviceAgreement={state.serviceAgreement}
            onClose={() => setCallOpen(false)}
          />
        ) : null}
      </RequestDialog>
    </>
  );
}
