"use client";

import { Alternative } from "@/components/ui/alternative";
import { Button } from "@/components/ui/button";
import { ContactForm, ContactFormInfo, type ContactFormType } from "@/components/ui/contact-form";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { TimePicker } from "@/components/ui/time-picker";

/** Figma's placeholder days for the calendar in the call form. */
const days = [{ label: "Idag 12 oktober", times: ["10:30", "11:00", "11:30", "12:00"] }];

const placeholder = "Supporting text";

const sendButton = (
  <Button type="submit" mode="dark" size="m" iconRight="arrow-right" className="w-full">
    Skicka avtal för signering
  </Button>
);

/** Figma's "Vad händer nu?" beside the order form (9613:21687). */
const nextSteps = [
  { heading: "Bekräftelse", text: "Du får en bekräftelse direkt via mejl." },
  { heading: "Personlig kontakt", text: "En säljare hör av sig inom kort." },
  { heading: "Plockning", text: "Din truck plockas ut från Baolis lager i Rolo, Italien." },
  { heading: "Avtal", text: "Du får ett digitalt avtal att signera (BankID)." },
  { heading: "Leverans", text: "Beräknad leverans 4–6 veckor." },
];

/**
 * contact-form's three types with Figma's texts and placeholders ("Heading", "Supporting text"); the
 * cross does nothing here. A client component, since the cross takes a click handler.
 */
export function ContactFormDemo({ type }: { type: ContactFormType }) {
  const onSubmit = (event: React.FormEvent) => event.preventDefault();

  if (type === "order") {
    return (
      <ContactForm
        type="order"
        heading="Fortsätt beställning"
        text="Fyll i företagsuppgifterna så skickar vi avtalet för digital signering. Därefter kontaktar en specialist dig, trucken förbereds för leverans och levereras normalt inom 4–6 veckor."
        submit={sendButton}
        onClose={() => {}}
        onSubmit={onSubmit}
        aside={<ContactFormInfo heading="Vad händer nu?" steps={nextSteps} />}
      >
        <TextField number="01" label="Företagsnamn *" placeholder={placeholder} />
        <TextField number="02" label="Organisationsnummer *" placeholder={placeholder} />
        <TextField number="04" label="E-post *" placeholder={placeholder} />
        <TextField number="05" label="Telefon *" placeholder={placeholder} />
      </ContactForm>
    );
  }

  if (type === "call") {
    return (
      <ContactForm
        type="call"
        heading="Boka Samtal"
        text="Välj tid som passar dig. En specialist ringer upp och går igenom din konfiguration."
        submit={sendButton}
        onClose={() => {}}
        onSubmit={onSubmit}
      >
        {[0, 1, 2, 3].map((index) => (
          <TextField key={index} number="01" label="Heading" placeholder={placeholder} />
        ))}
        <div className="grid grid-cols-2 gap-x-(--spacing-2xs) tablet:col-span-2">
          <Alternative name="demo-call-when" number="01" label="Heading">
            Text
          </Alternative>
          <div className="flex flex-col justify-end">
            <TimePicker name="demo-call-time" days={days} placeholder="Text" />
          </div>
        </div>
        <TextAreaField
          number="01"
          label="Heading"
          placeholder={placeholder}
          className="tablet:col-span-2"
        />
      </ContactForm>
    );
  }

  return (
    <ContactForm
      type="contact"
      submit={
        <Button type="submit" mode="tejp" size="m" iconRight="arrow-right" className="w-full">
          Skicka
        </Button>
      }
      onSubmit={onSubmit}
    >
      {[0, 1, 2, 3].map((index) => (
        <TextField key={index} number="01" label="Heading" placeholder={placeholder} />
      ))}
      <TextAreaField
        number="01"
        label="Heading"
        placeholder={placeholder}
        className="tablet:col-span-2"
      />
    </ContactForm>
  );
}
