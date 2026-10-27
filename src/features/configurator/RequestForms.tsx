"use client";

import { type ReactNode, useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import { Alternative } from "@/components/ui/alternative";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { TimePicker, type TimePickerDay } from "@/components/ui/time-picker";
import { sendQuoteCopy, submitCallRequest, submitOrderRequest } from "./actions";
import type { ConfiguratorActionState, QuoteCopyState, SelectionState } from "./types";

const initialActionState: ConfiguratorActionState = { ok: false };

type Configuration = {
  familyKey: string;
  financingKey: string;
  /** The chosen term of a monthly way to pay. */
  months?: number;
  locale: string;
  selections: SelectionState;
  serviceAgreement?: boolean;
};

/**
 * The form's action with the key the server uses to see a form sent twice as one request: made at
 * the first send and kept for this form, so sending again after an error is the same request and a
 * later form is never taken for an earlier one (`useId` is the same on every visit).
 */
function useKeyedAction(action: (formData: FormData) => void) {
  const key = useRef<string | null>(null);
  return (formData: FormData) => {
    key.current ??= crypto.randomUUID();
    formData.set("submissionKey", key.current);
    action(formData);
  };
}

function HiddenConfiguration({
  familyKey,
  financingKey,
  months,
  locale,
  selections,
  serviceAgreement = false,
}: Configuration) {
  return (
    <>
      <input type="hidden" name="familyKey" value={familyKey} />
      <input type="hidden" name="financingKey" value={financingKey} />
      <input type="hidden" name="months" value={months ?? ""} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="selections" value={JSON.stringify(selections)} />
      <input type="hidden" name="serviceAgreement" value={serviceAgreement ? "1" : "0"} />
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden />
    </>
  );
}

/**
 * "Skicka kopia till mig" in the quote (Figma `type=offert`, 9264:10759): the field and its button.
 * Figma draws no sent or error state; a line under the field says which (see figma-notes).
 */
export function QuoteCopyForm(configuration: Configuration) {
  const [state, formAction, pending] = useActionState(sendQuoteCopy, {
    ok: false,
  } satisfies QuoteCopyState);
  const keyedAction = useKeyedAction(formAction);
  const messageId = useId();
  const message = state.ok ? `Kopian är skickad till ${state.email}.` : state.message;

  return (
    <form action={keyedAction} className="flex flex-col gap-(--spacing-2xs)">
      <HiddenConfiguration {...configuration} />
      <div className="flex items-end gap-(--spacing-2xs)">
        <label className="flex min-w-0 flex-1 flex-col gap-(--spacing-2xs)">
          <span className="text-text-m text-ui-primary">Skicka kopia till mig</span>
          <input
            type="email"
            name="copyEmail"
            autoComplete="email"
            placeholder="namn@foretag.se"
            required
            defaultValue={state.email}
            aria-describedby={message ? messageId : undefined}
            aria-invalid={state.message && !state.ok ? true : undefined}
            className="h-10 w-full rounded-sm bg-bg-fill px-(--spacing-sm) text-text-xs text-ui-primary ring-(length:--stroke-width) ring-border-primary ring-inset placeholder:text-ui-tertiary"
          />
        </label>
        <Button type="submit" variant="secondary" size="s" iconRight="mail" disabled={pending}>
          {pending ? "Skickar…" : "Skicka"}
        </Button>
      </div>
      {message ? (
        <p
          id={messageId}
          role={state.ok ? "status" : "alert"}
          className={`text-text-xs ${state.ok ? "text-ui-secondary" : "text-status-error"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

/** The form's own message, when the server rejects the whole request. */
function FormMessage({ state }: { state: ConfiguratorActionState }) {
  return state.message && !state.ok ? (
    <p className="text-text-xs text-status-error" role="alert">
      {state.message}
    </p>
  ) : null;
}

/** Figma's "prototyp - popup" (9321:55718): Smart animate, 1200ms, this easing. */
const POPUP_MS = 1200;

/**
 * Figma's Popup (`04 — Blocks` → "Contact-popup", 8882:14589): a panel `grid/margin` from the
 * screen's edges, the right half from Desktop S and the whole width below. Figma draws nothing
 * behind it, so the page stays visible. Escape and the cross close it.
 *
 * It moves as Figma's prototype (9321:55718): the panel slides in from the right while the page
 * slides left (`data-request-popup` on <html>, see site-theme.css), and back out when it closes,
 * which Figma does not draw (see figma-notes). The children stay until the panel is out.
 */
export function RequestDialog({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  // Shown from when it opens until the panel is out after closing.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const root = document.documentElement;
    if (open) {
      if (!element.open) element.showModal();
      // Draw the panel outside first, so the move to its place animates.
      element.getBoundingClientRect();
      element.dataset.state = "open";
      root.dataset.requestPopup = "open";
      return;
    }
    if (!element.open) return;
    delete element.dataset.state;
    delete root.dataset.requestPopup;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        element.close();
        setShown(false);
      },
      reduced ? 0 : POPUP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [open]);

  // A page left with the popup open does not keep the next page shifted.
  useEffect(
    () => () => {
      delete document.documentElement.dataset.requestPopup;
    },
    [],
  );

  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-y-(--grid-margin) right-(--grid-margin) left-auto m-0 h-auto max-h-none w-[calc(100%-2*var(--grid-margin))] max-w-none translate-x-[calc(100%+var(--grid-margin))] bg-transparent p-0 transition-transform duration-1200 ease-[cubic-bezier(0.72,0,0.37,1)] backdrop:bg-transparent data-[state=open]:translate-x-0 motion-reduce:transition-none desktop-s:w-[calc(50%-0.75rem)]"
    >
      {shown ? children : null}
    </dialog>
  );
}

const dayFormat = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long" });
const weekdayFormat = new Intl.DateTimeFormat("sv-SE", { weekday: "long" });
const callTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

/**
 * The next five weekdays, from today, with the times a seller can call; today only the times still
 * ahead, and not at all once they have passed.
 */
function callDays(): TimePickerDay[] {
  const days: TimePickerDay[] = [];
  const now = new Date();
  const later = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes > now.getHours() * 60 + now.getMinutes();
  };
  for (let offset = 0; days.length < 5 && offset < 10; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    const times = offset === 0 ? callTimes.filter(later) : callTimes;
    if (times.length === 0) continue;
    const name = offset === 0 ? "Idag" : offset === 1 ? "Imorgon" : weekdayFormat.format(day);
    days.push({
      label: `${name[0].toUpperCase()}${name.slice(1)} ${dayFormat.format(day)}`,
      times,
    });
  }
  return days;
}

/**
 * The call request ("Boka samtal") as Figma's call popup: name, phone, company and e-mail, when
 * to call and a message. When is two choices, "Så snart som möjligt" and "Jag önskar en särskild
 * tid"; the second shows the calendar, open, under them (decided 2026-10-27; Figma has one choice
 * beside the calendar). It sends the
 * configuration as it is; the server marks it incomplete when steps remain. Sent, it shows
 * Figma's call-booked: "Bokning bekräftad" and when and where the seller calls.
 */
export function CallRequestForm({
  onClose,
  headingId,
  ...configuration
}: Configuration & { onClose: () => void; headingId: string }) {
  const [state, formAction, pending] = useActionState(submitCallRequest, initialActionState);
  const keyedAction = useKeyedAction(formAction);
  const days = useMemo(() => callDays(), []);
  const values = state.formValues;
  const errors = state.fieldErrors ?? {};
  // The choice is the radios' default, kept as it is chosen, as React resets the form after
  // each send; the calendar shows for "specific".
  const [when, setWhen] = useState<"asap" | "specific">(values?.callPreference ?? "asap");

  if (state.ok) {
    const when =
      values?.callPreference === "specific" && values.preferredTime
        ? values.preferredTime.toLowerCase()
        : "så snart som möjligt";
    return (
      <ContactForm
        type="order"
        fill
        heading={<span id={headingId}>Bokning bekräftad</span>}
        text={
          <>
            Vi ringer upp {values?.name ? <strong>{values.name}</strong> : null} {when} på{" "}
            <strong>{values?.phone}</strong>.
          </>
        }
        submit={
          <Button type="button" mode="dark" size="s" iconRight={null} onClick={onClose}>
            Stäng
          </Button>
        }
      >
        {null}
      </ContactForm>
    );
  }

  return (
    <ContactForm
      type="call"
      fill
      action={keyedAction}
      heading={<span id={headingId}>Boka samtal</span>}
      text="Välj tid som passar dig. En specialist ringer upp och går igenom din konfiguration."
      onClose={onClose}
      submit={
        <div className="flex flex-col gap-(--spacing-2xs)">
          <FormMessage state={state} />
          <Button type="submit" mode="dark" size="m" iconRight="arrow-right" disabled={pending}>
            {pending ? "Skickar…" : "Boka samtal"}
          </Button>
        </div>
      }
    >
      <HiddenConfiguration {...configuration} />
      <TextField
        number="01"
        label="Namn"
        name="name"
        autoComplete="name"
        defaultValue={values?.name}
        error={errors.name}
      />
      <TextField
        number="02"
        label="Telefon *"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        defaultValue={values?.phone}
        error={errors.phone}
      />
      <TextField
        number="03"
        label="Företag"
        name="company"
        autoComplete="organization"
        defaultValue={values?.company}
      />
      <TextField
        number="04"
        label="E-post"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
      />
      <fieldset className="grid gap-(--spacing-2xs) tablet:col-span-2 tablet:grid-cols-2">
        <legend className="sr-only">När ska vi ringa?</legend>
        <Alternative
          name="callPreference"
          value="asap"
          number="05"
          label="När ska vi ringa?"
          defaultChecked={when === "asap"}
          onChange={() => setWhen("asap")}
        >
          Så snart som möjligt
        </Alternative>
        <div className="flex flex-col justify-end">
          <Alternative
            name="callPreference"
            value="specific"
            defaultChecked={when === "specific"}
            onChange={() => setWhen("specific")}
          >
            Jag önskar en särskild tid
          </Alternative>
        </div>
        {when === "specific" ? (
          <div className="flex flex-col gap-(--spacing-2xs) tablet:col-span-2">
            <TimePicker
              name="preferredTime"
              days={days}
              placeholder="Välj tid i kalendern"
              defaultValue={values?.preferredTime}
              defaultOpen
            />
            {errors.preferredTime ? (
              <p className="text-text-xs text-status-error">{errors.preferredTime}</p>
            ) : null}
          </div>
        ) : null}
      </fieldset>
      <TextAreaField
        number="06"
        label="Meddelande (valfritt)"
        name="message"
        defaultValue={values?.message}
        className="tablet:col-span-2"
      />
    </ContactForm>
  );
}

/**
 * The order ("Fortsätt beställning") as Figma's order popup: company, organisation number, e-mail
 * and phone, and "Skicka avtal för signering". Sent, it hands the reference to `onSent`, which
 * shows the thank-you screen.
 */
export function OrderRequestForm({
  onClose,
  onSent,
  headingId,
  ...configuration
}: Configuration & {
  onClose: () => void;
  onSent: (reference: string) => void;
  headingId: string;
}) {
  const [state, formAction, pending] = useActionState(submitOrderRequest, initialActionState);
  const keyedAction = useKeyedAction(formAction);
  const values = state.formValues;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok && state.reference) onSent(state.reference);
  }, [state.ok, state.reference, onSent]);

  return (
    <ContactForm
      type="order"
      fill
      action={keyedAction}
      heading={<span id={headingId}>Fortsätt beställning</span>}
      text="Fyll i företagsuppgifterna så skickar vi avtalet för digital signering. Därefter kontaktar en specialist dig, trucken förbereds för leverans och levereras normalt inom 4–6 veckor."
      onClose={onClose}
      submit={
        <div className="flex flex-col gap-(--spacing-2xs)">
          <FormMessage state={state} />
          <Button type="submit" mode="dark" size="m" iconRight="arrow-right" disabled={pending}>
            {pending ? "Skickar…" : "Skicka avtal för signering"}
          </Button>
        </div>
      }
    >
      <HiddenConfiguration {...configuration} />
      <TextField
        number="01"
        label="Företagsnamn *"
        name="company"
        autoComplete="organization"
        required
        defaultValue={values?.company}
        error={errors.company}
      />
      <TextField
        number="02"
        label="Organisationsnummer *"
        name="organizationNumber"
        inputMode="numeric"
        required
        defaultValue={values?.organizationNumber}
        error={errors.organizationNumber}
      />
      <TextField
        number="03"
        label="E-post *"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values?.email}
        error={errors.email}
      />
      <TextField
        number="04"
        label="Telefon *"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        defaultValue={values?.phone}
        error={errors.phone}
      />
    </ContactForm>
  );
}
