"use client";

import { useActionState, useId, useState } from "react";
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
    <span className="mt-1 block text-sm text-red-700" role="alert">
      {error}
    </span>
  ) : null;
}

const fieldClassName =
  "mt-1.5 block min-h-11 w-full border border-neutral-400 bg-white px-3 py-2 text-neutral-950 outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950";
const labelClassName = "block text-sm font-medium text-neutral-800";

export function CallRequestForm({
  familyKey,
  financingKey,
  locale,
  selections,
  serviceAgreement,
}: {
  familyKey: string;
  financingKey: string;
  locale: string;
  selections: SelectionState;
  serviceAgreement: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitCallRequest, initialActionState);
  const submissionKey = useId();

  if (!open) {
    return (
      <button
        type="button"
        className="w-full border border-neutral-950 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50"
        aria-expanded="false"
        onClick={() => setOpen(true)}
      >
        Boka ett samtal
      </button>
    );
  }

  if (state.ok) {
    return (
      <div role="status" className="border border-neutral-950 bg-neutral-50 p-4 text-sm">
        <p className="font-semibold">Förfrågan är mottagen.</p>
        <p className="mt-1">Referens: {state.reference}</p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="call-request-heading"
      className="border border-neutral-400 bg-neutral-50 p-4"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 id="call-request-heading" className="font-semibold">
            Boka ett samtal
          </h3>
          <p className="mt-1 text-xs leading-5 text-neutral-600">
            Vi kontaktar dig om konfigurationen.
          </p>
        </div>
        <button
          type="button"
          className="size-8 border border-neutral-300 bg-white text-lg leading-none hover:border-neutral-950"
          onClick={() => setOpen(false)}
          aria-label="Stäng formuläret"
        >
          ×
        </button>
      </div>
      <form action={formAction} className="space-y-3.5">
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
        <fieldset className="space-y-2 border-y border-neutral-300 py-3">
          <legend className="px-1 text-sm font-medium">När ska vi ringa?</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              className="size-4 accent-neutral-950"
              type="radio"
              name="callPreference"
              value="asap"
              defaultChecked={(state.formValues?.callPreference ?? "asap") === "asap"}
            />
            Så snart som möjligt
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              className="size-4 accent-neutral-950"
              type="radio"
              name="callPreference"
              value="specific"
              defaultChecked={state.formValues?.callPreference === "specific"}
            />
            Jag önskar en särskild tid
          </label>
        </fieldset>
        <label className={labelClassName}>
          Önskad tid
          <input
            className={fieldClassName}
            name="preferredTime"
            placeholder="Till exempel vardagar efter 14"
            defaultValue={state.formValues?.preferredTime}
          />
          <FieldError state={state} name="preferredTime" />
        </label>
        <label className={labelClassName}>
          Meddelande
          <textarea
            className={`${fieldClassName} min-h-24 resize-y`}
            name="message"
            defaultValue={state.formValues?.message}
          />
        </label>
        {state.message ? (
          <p className="text-sm text-red-700" role="alert">
            {state.message}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="border border-neutral-400 bg-white px-3 py-2.5 text-sm"
            onClick={() => setOpen(false)}
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="border border-neutral-950 bg-neutral-950 px-3 py-2.5 text-sm text-white disabled:opacity-50"
            disabled={pending}
          >
            {pending ? "Skickar…" : "Skicka"}
          </button>
        </div>
      </form>
    </section>
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
