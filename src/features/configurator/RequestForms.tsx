"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitCallRequest, submitOrderRequest } from "./actions";
import type { ConfiguratorActionState, ConfiguratorQuote, SelectionState } from "./types";

const initialActionState: ConfiguratorActionState = { ok: false };

function HiddenConfiguration({
  familyKey,
  financingKey,
  locale,
  selections,
  serviceAgreement = false,
  submissionKey,
}: {
  familyKey: string;
  financingKey: string;
  locale: string;
  selections: SelectionState;
  serviceAgreement?: boolean;
  submissionKey: string;
}) {
  return (
    <>
      <input type="hidden" name="familyKey" value={familyKey} />
      <input type="hidden" name="financingKey" value={financingKey} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="selections" value={JSON.stringify(selections)} />
      <input type="hidden" name="serviceAgreement" value={serviceAgreement ? "1" : "0"} />
      <input type="hidden" name="submissionKey" value={submissionKey} />
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden />
    </>
  );
}

function FieldError({ state, name }: { state: ConfiguratorActionState; name: string }) {
  const error = state.fieldErrors?.[name];
  return error ? (
    <span className="mt-(--spacing-3xs) block text-text-xs text-status-error" role="alert">
      {error}
    </span>
  ) : null;
}

const fieldClassName =
  "mt-(--spacing-2xs) block min-h-11 w-full rounded-sm border border-border-primary bg-bg-active px-(--spacing-xs) py-(--spacing-2xs) text-text-m text-ui-primary outline-none focus:border-border-secondary focus:ring-1 focus:ring-border-secondary";
const labelClassName = "block text-label-s text-ui-primary";

/**
 * The call request ("Boka samtal"), shown in the configurator's dialog. It sends the configuration
 * as it is; the server marks it incomplete when steps remain.
 */
export function CallRequestForm({
  familyKey,
  financingKey,
  locale,
  selections,
  serviceAgreement,
  onClose,
}: {
  familyKey: string;
  financingKey: string;
  locale: string;
  selections: SelectionState;
  serviceAgreement: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitCallRequest, initialActionState);
  const submissionKey = useId();
  const [preference, setPreference] = useState(state.formValues?.callPreference ?? "asap");

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col gap-(--spacing-sm)">
        <p className="text-text-xl text-ui-primary">Tack, vi ringer upp.</p>
        <p className="text-text-m text-ui-secondary">Referens: {state.reference}</p>
        <Button size="m" iconRight={null} onClick={onClose}>
          Stäng
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-(--spacing-sm)">
      <HiddenConfiguration
        familyKey={familyKey}
        financingKey={financingKey}
        locale={locale}
        selections={selections}
        serviceAgreement={serviceAgreement}
        submissionKey={submissionKey}
      />
      <label className={labelClassName}>
        Namn *
        <input
          className={fieldClassName}
          name="name"
          autoComplete="name"
          defaultValue={state.formValues?.name}
          required
        />
        <FieldError state={state} name="name" />
      </label>
      <label className={labelClassName}>
        Telefon *
        <input
          className={fieldClassName}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={state.formValues?.phone}
          required
        />
        <FieldError state={state} name="phone" />
      </label>
      <label className={labelClassName}>
        Företag
        <input
          className={fieldClassName}
          name="company"
          autoComplete="organization"
          defaultValue={state.formValues?.company}
        />
      </label>
      <label className={labelClassName}>
        E-post
        <input
          className={fieldClassName}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.formValues?.email}
        />
        <FieldError state={state} name="email" />
      </label>
      <fieldset className="flex flex-col gap-(--spacing-2xs)">
        <legend className={`${labelClassName} mb-(--spacing-2xs)`}>När ska vi ringa?</legend>
        {(
          [
            ["asap", "Så snart som möjligt"],
            ["specific", "Jag önskar en särskild tid"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-(--spacing-2xs) text-text-m">
            <input
              className="size-4 accent-ui-primary"
              type="radio"
              name="callPreference"
              value={value}
              checked={preference === value}
              onChange={() => setPreference(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {preference === "specific" ? (
        <label className={labelClassName}>
          Önskad tid *
          <input
            className={fieldClassName}
            name="preferredTime"
            placeholder="Till exempel vardagar efter 14"
            defaultValue={state.formValues?.preferredTime}
          />
          <FieldError state={state} name="preferredTime" />
        </label>
      ) : null}
      <label className={labelClassName}>
        Meddelande
        <textarea
          className={`${fieldClassName} min-h-24 resize-y`}
          name="message"
          defaultValue={state.formValues?.message}
        />
      </label>
      {state.message ? (
        <p className="text-text-m text-status-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="flex gap-(--grid-gap) *:flex-1">
        <Button color="gray" size="m" iconRight={null} onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit" size="m" disabled={pending}>
          {pending ? "Skickar…" : "Skicka"}
        </Button>
      </div>
    </form>
  );
}

export function OrderRequestForm({ quote, locale }: { quote: ConfiguratorQuote; locale: string }) {
  const [state, formAction, pending] = useActionState(submitOrderRequest, initialActionState);
  const submissionKey = useId();

  if (state.ok) {
    return (
      <div role="status" className="border border-neutral-950 bg-neutral-50 p-6">
        <p
          className="mb-3 grid size-9 place-items-center border border-neutral-950 bg-neutral-950 text-white"
          aria-hidden="true"
        >
          ✓
        </p>
        <h2 className="text-xl font-semibold">Orderförfrågan mottagen</h2>
        <p className="mt-2 text-sm leading-6">
          Din referens är {state.reference}. Vi återkommer med nästa steg.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="border border-neutral-300 bg-white">
      <div className="border-b border-neutral-300 bg-neutral-50 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Nästa steg</p>
        <h2 className="mt-1 text-xl font-semibold">Skicka orderförfrågan</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Fyll i företagets uppgifter så återkommer en säljare med en slutlig offert.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <HiddenConfiguration
          familyKey={quote.familyKey}
          financingKey={quote.financing.key}
          locale={locale}
          selections={quote.selections}
          serviceAgreement={Boolean(quote.serviceAgreement)}
          submissionKey={submissionKey}
        />
        <label className={labelClassName}>
          Företagsnamn *
          <input
            className={fieldClassName}
            name="company"
            autoComplete="organization"
            defaultValue={state.formValues?.company}
            required
          />
          <FieldError state={state} name="company" />
        </label>
        <label className={labelClassName}>
          Organisationsnummer *
          <input
            className={fieldClassName}
            name="organizationNumber"
            placeholder="556000-0000"
            defaultValue={state.formValues?.organizationNumber}
            required
          />
          <FieldError state={state} name="organizationNumber" />
        </label>
        <label className={labelClassName}>
          Kontaktperson *
          <input
            className={fieldClassName}
            name="name"
            autoComplete="name"
            defaultValue={state.formValues?.name}
            required
          />
          <FieldError state={state} name="name" />
        </label>
        <label className={labelClassName}>
          E-post *
          <input
            className={fieldClassName}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.formValues?.email}
            required
          />
          <FieldError state={state} name="email" />
        </label>
        <label className={labelClassName}>
          Telefon *
          <input
            className={fieldClassName}
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={state.formValues?.phone}
            required
          />
          <FieldError state={state} name="phone" />
        </label>
        <label className={labelClassName}>
          Meddelande
          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            name="message"
            defaultValue={state.formValues?.message}
          />
        </label>
        {state.message ? (
          <p className="text-sm text-red-700" role="alert">
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full border border-neutral-950 bg-neutral-950 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          disabled={pending}
        >
          {pending ? "Skickar…" : "Skicka orderförfrågan"}
        </button>
        <p className="text-center text-xs leading-5 text-neutral-500">
          Förfrågan är inte ett bindande avtal.
        </p>
      </div>
    </form>
  );
}
