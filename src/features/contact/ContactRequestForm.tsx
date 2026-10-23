"use client";

import { useLocale } from "next-intl";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { type ContactActionState, submitContactRequest } from "./actions";

const initialState: ContactActionState = { ok: false };

/**
 * The Contact block's form: name, company, e-mail and phone two to a row, a message and "Skicka".
 * Figma's fields are placeholders ("Heading"); these are the ones a contact request needs. Sent, a
 * thank-you takes the form's place; Figma has no sent state.
 */
export function ContactRequestForm() {
  const [state, formAction, pending] = useActionState(submitContactRequest, initialState);
  const submissionKey = useId();
  const locale = useLocale();
  const values = state.formValues;
  const errors = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <p role="status" className="text-text-xl">
        Tack{values?.name ? `, ${values.name}` : ""}! Vi har fått ditt meddelande och återkommer så
        snart vi kan.
      </p>
    );
  }

  return (
    <ContactForm
      type="contact"
      action={formAction}
      submit={
        <div className="flex flex-col gap-(--spacing-2xs)">
          {state.message ? (
            <p className="text-text-xs text-status-error" role="alert">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" mode="tejp" size="m" iconRight="arrow-right" disabled={pending}>
            {pending ? "Skickar…" : "Skicka"}
          </Button>
        </div>
      }
    >
      <input type="hidden" name="submissionKey" value={submissionKey} />
      <input type="hidden" name="locale" value={locale} />
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden />
      <TextField
        number="01"
        label="Namn *"
        name="name"
        autoComplete="name"
        required
        defaultValue={values?.name}
        error={errors.name}
      />
      <TextField
        number="02"
        label="Företag"
        name="company"
        autoComplete="organization"
        defaultValue={values?.company}
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
        label="Telefon"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={values?.phone}
      />
      <TextAreaField
        number="05"
        label="Meddelande *"
        name="message"
        required
        defaultValue={values?.message}
        error={errors.message}
        className="tablet:col-span-2"
      />
    </ContactForm>
  );
}
