"use client";

import Image from "next/image";
import type { TypedLocale } from "payload";
import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { ConfiguratorScreen } from "@/components/blocks/configurator-screen";
import { Button, ButtonLink } from "@/components/ui/button";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox, choiceLayout } from "@/components/ui/configurator-box";
import { frontendPath } from "@/i18n/frontend-path";
import {
  calculateFinancingPrice,
  estimateTotal,
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
  serviceAgreement: boolean;
  step: number;
};

type Action =
  | { type: "hydrate"; state: Omit<State, "hydrated"> }
  | { type: "selectFamily"; family: ConfiguratorFamily }
  | { type: "toggleOption"; family: ConfiguratorFamily; group: ConfiguratorGroup; key: string }
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

function groupComplete(group: ConfiguratorGroup, selections: SelectionState) {
  return !group.required || (selections[group.key]?.length ?? 0) > 0;
}

function priceLabel(priceMode: "included" | "add" | "replaceBase", price: number) {
  if (priceMode === "included") return "Ingår";
  if (priceMode === "add") return `+${formatPrice(price)}`;
  return formatPrice(price);
}

const stepNumber = (index: number) => String(index + 1).padStart(2, "0");

/** One step's choices in a <ConfiguratorBox>, laid out by `choiceLayout`. */
function StepBox({
  number,
  label,
  choices,
}: {
  number: string;
  label: string;
  choices: Array<{
    key: string;
    title: string;
    price: string;
    text?: ReactNode;
    selected: boolean;
    disabled?: boolean;
    image?: ReactNode;
    onSelect: () => void;
  }>;
}) {
  return (
    <ConfiguratorBox
      number={number}
      label={label}
      {...choiceLayout(choices.map((choice) => choice.price))}
    >
      {choices.map((choice) => (
        <Choice
          key={choice.key}
          title={choice.title}
          price={choice.price}
          text={choice.text}
          textSize={choices.length > 2 ? "m" : "s"}
          selected={choice.selected}
          disabled={choice.disabled}
          image={choice.image}
          onClick={choice.onSelect}
        />
      ))}
    </ConfiguratorBox>
  );
}

/**
 * The truck configurator on Figma's step screen (`ConfiguratorScreen`): truck type, the family's
 * steps, then financing, one screen each, numbered `[01]`, `[02]` and so on. "Boka samtal" opens the
 * call request in a dialog from the first configuration step; "Visa offert" leads to the quote page.
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
  const dialog = useRef<HTMLDialogElement>(null);
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
        : Boolean(
            currentConfigStep?.groups.every((group) => groupComplete(group, state.selections)),
          );

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

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (callOpen && !element.open) element.showModal();
    if (!callOpen && element.open) element.close();
  }, [callOpen]);

  if (!state.hydrated) {
    return (
      <p
        className="bg-bg-fill-secondary p-(--spacing-xl) text-text-m text-ui-secondary"
        aria-live="polite"
      >
        Laddar konfiguratorn…
      </p>
    );
  }

  if (catalog.families.length === 0) {
    return <p className="text-text-m">Det finns inga publicerade truckfamiljer ännu.</p>;
  }

  const lowestPrice = Math.min(...catalog.families.map((candidate) => candidate.basePrice));
  const monthlyMethods = catalog.financingMethods.filter((method) => method.kind === "monthly");
  const totalPrice = total ?? lowestPrice;
  const number = stepNumber(state.step);

  let step: ReactNode;
  if (state.step === 0 || !family) {
    step = (
      <StepBox
        number={number}
        label="Trucktyp"
        choices={catalog.families.map((candidate) => ({
          key: candidate.key,
          title: candidate.name,
          price: `Från ${formatPrice(candidate.basePrice)}`,
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
    step = currentConfigStep.groups.map((group) => (
      <StepBox
        key={group.key}
        number={number}
        label={currentConfigStep.groups.length === 1 ? currentConfigStep.heading : group.label}
        choices={group.options.map((option) => {
          const available = isOptionAvailable(option, state.selections);
          return {
            key: option.key,
            title: option.label,
            price: priceLabel(option.priceMode, option.price),
            text: available
              ? option.description
              : `${option.description ? `${option.description} ` : ""}Kräver ett annat tidigare val.`,
            selected: (state.selections[group.key] ?? []).includes(option.key),
            disabled: !available,
            onSelect: () => dispatch({ type: "toggleOption", family, group, key: option.key }),
          };
        })}
      />
    ));
  } else {
    const agreement = catalog.serviceAgreement;
    step = (
      <>
        <StepBox
          number={number}
          label="Finansiering"
          choices={catalog.financingMethods.map((method) => ({
            key: method.key,
            title: method.months ? `${method.label} (${method.months} mån)` : method.label,
            price: `${formatPrice(calculateFinancingPrice(totalPrice, method))}${
              method.kind === "monthly" ? "/mån" : ""
            }`,
            text: method.description,
            selected: state.financingKey === method.key,
            onSelect: () =>
              dispatch({
                type: "selectFinancing",
                key: method.key,
                serviceAgreementEligible: method.serviceAgreementEligible,
              }),
          }))}
        />
        {selectedFinancing?.serviceAgreementEligible && agreement ? (
          <StepBox
            number={number}
            label="Serviceavtal"
            choices={[
              {
                key: "service-agreement",
                title: `Lägg till ${agreement.label.toLowerCase()}`,
                price: `+${formatPrice(agreement.annualPrice)}/år`,
                text: agreement.description,
                selected: state.serviceAgreement,
                onSelect: () => dispatch({ type: "toggleServiceAgreement" }),
              },
            ]}
          />
        ) : null}
      </>
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
      </button>
    </>
  ) : financingStep ? (
    "Alla priser visas exkl. moms. Slutliga villkor bekräftas av säljare."
  ) : undefined;

  const next = financingStep ? (
    currentComplete ? (
      <ButtonLink href={quoteHref} size="m">
        Visa offert
      </ButtonLink>
    ) : (
      <Button size="m" disabled>
        Visa offert
      </Button>
    )
  ) : (
    <Button
      size="m"
      disabled={!currentComplete}
      onClick={() => dispatch({ type: "setStep", step: Math.min(maxStep, state.step + 1) })}
    >
      Nästa
    </Button>
  );

  return (
    <>
      <ConfiguratorScreen
        total={family ? `Totalt: ${formatPrice(totalPrice)}` : `Från ${formatPrice(totalPrice)}`}
        prices={monthlyMethods.map((method) => ({
          label: method.months ? `${method.label} (${method.months} mån)` : method.label,
          value: `${formatPrice(calculateFinancingPrice(totalPrice, method))}/mån`,
        }))}
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
                color="gray"
                size="m"
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
        contactText="Har du frågor eller önskar något annat av din konfiguration?"
        contact={
          <Button
            color="tejp"
            size="m"
            iconRight="phone"
            className="w-full"
            disabled={!family}
            onClick={() => setCallOpen(true)}
          >
            Boka samtal
          </Button>
        }
      />
      <dialog
        ref={dialog}
        aria-labelledby="call-request-heading"
        onClose={() => setCallOpen(false)}
        className="m-auto w-[min(100%-2*var(--grid-margin),32rem)] rounded-lg bg-bg-fill p-(--spacing-md) backdrop:bg-bg-inv-fill/60"
      >
        <div className="mb-(--spacing-md) flex items-start justify-between gap-(--spacing-sm)">
          <div className="flex flex-col gap-(--spacing-2xs)">
            <h2 id="call-request-heading" className="text-text-xl text-ui-primary">
              Boka samtal
            </h2>
            <p className="text-text-xs text-ui-secondary">
              Vi ringer upp om din konfiguration{family ? `, ${family.name}` : ""}.
            </p>
          </div>
        </div>
        {callOpen && family ? (
          <CallRequestForm
            familyKey={family.key}
            financingKey={previewFinancing ?? "purchase"}
            locale={locale}
            selections={state.selections}
            serviceAgreement={state.serviceAgreement}
            onClose={() => setCallOpen(false)}
          />
        ) : null}
      </dialog>
    </>
  );
}
