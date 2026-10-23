import { editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { draftMode } from "next/headers";
import { getLocale } from "next-intl/server";
import type { TypedLocale } from "payload";
import { Fragment, type ReactNode } from "react";
import { Contact, ContactLink } from "@/components/blocks/contact";
import { ContactRequestForm } from "@/features/contact/ContactRequestForm";
import { getFooter } from "@/payload/data/globals";
import type { ContactBlock, LayoutBlockComponentProps } from "../types";

/** Contact with the Footer global's e-mail, phone and social links, and the contact request form. */
export async function ContactBlockComponent({ block }: LayoutBlockComponentProps<ContactBlock>) {
  const locale = (await getLocale()) as TypedLocale;
  const { isEnabled: draft } = await draftMode();
  const footer = await getFooter(locale, draft);

  const items: ReactNode[] = [];
  if (footer.email) {
    items.push(
      <ContactLink key="email" href={`mailto:${footer.email}`}>
        {footer.email}
      </ContactLink>,
    );
  }
  if (footer.phone) {
    items.push(
      <ContactLink key="phone" href={`tel:${footer.phone.replace(/[^\d+]/g, "")}`}>
        {footer.phone}
      </ContactLink>,
    );
  }
  if (footer.socialLinks?.length) {
    items.push(
      <Fragment key="social">
        {footer.socialLinks.map((link) => (
          <ContactLink
            key={link.id ?? link.url}
            underline
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </ContactLink>
        ))}
      </Fragment>,
    );
  }

  return (
    <Contact
      id={block.anchor ?? undefined}
      heading={<span {...editableField("heading")}>{block.heading}</span>}
      items={items}
      form={<ContactRequestForm />}
    />
  );
}
