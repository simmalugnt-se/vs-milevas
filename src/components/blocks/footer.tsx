import type { ReactNode } from "react";
import { FooterLink as FooterLinkUI } from "@/components/ui/footer-link";
import { Logo } from "@/components/ui/logo";

/**
 * Footer from Figma "04 — Blocks" (9264:22371): a Tejp card (`bg-fill`, `radius-lg`) inside
 * `grid/margin` at the sides and `spacing/2xs` below, `spacing/md` above and below its content, and
 * 64px between its rows.
 * - Columns with a Label S heading and, `spacing/sm` under it, footerlinks: Figma's Produkter and
 *   Tjänster (`groups`), then Kontakt (`contact`: e-mail, phone and a location as plain text).
 *   Desktop S and L: five, four and three of the 12 columns; Tablet: two each of six; Mobile: one
 *   under the other. Only the first column is `spacing/sm` in from Tablet; on Mobile all are.
 * - The copyright line (Text XS) bottom left and the wordmark across the last seven columns
 *   (three on Tablet); on Mobile the wordmark across the width with the line `spacing/sm` under.
 *
 * The Footer global feeds it on the site (`src/payload/globals/Footer/Component.tsx`).
 */

/** Data attributes spread on an element, e.g. visual editing's click-to-edit markers. */
type Attributes = Partial<Record<string, string>>;

export type FooterLink = {
  label: ReactNode;
  href: string;
  rel?: string;
  target?: "_blank";
  attributes?: Attributes;
};

export type FooterGroup = {
  heading: ReactNode;
  links: FooterLink[];
  attributes?: Attributes;
};

type FooterProps = {
  /** Figma: Produkter and Tjänster. */
  groups: FooterGroup[];
  /** Figma's Kontakt column. */
  contact?: {
    heading: ReactNode;
    email?: { address: string; attributes?: Attributes };
    phone?: { number: string; attributes?: Attributes };
    location?: ReactNode;
  };
  /** After "© year", e.g. "Milevas AB. Alla rättigheter förbehållna." */
  copyright?: ReactNode;
  attributes?: Attributes;
};

/** Per column: the span from Tablet and Desktop S, and the inset. */
const columnClasses = [
  "px-(--spacing-sm) tablet:col-span-2 desktop-s:col-span-5",
  "px-(--spacing-sm) tablet:col-span-2 tablet:px-0 desktop-s:col-span-4",
  "px-(--spacing-sm) tablet:col-span-2 tablet:px-0 desktop-s:col-span-3",
];

function Column({
  index,
  heading,
  children,
  attributes,
}: {
  index: number;
  heading: ReactNode;
  children: ReactNode;
  attributes?: Attributes;
}) {
  return (
    <div
      className={`flex flex-col gap-(--spacing-sm) ${columnClasses[Math.min(index, 2)]}`}
      {...attributes}
    >
      <p className="text-label-s">{heading}</p>
      <ul className="flex flex-col items-start">{children}</ul>
    </div>
  );
}

export function Footer({ groups, contact, copyright, attributes }: FooterProps) {
  return (
    <footer className="px-(--grid-margin) pb-(--spacing-2xs)" {...attributes}>
      <div className="grid grid-cols-1 gap-x-(--grid-gap) gap-y-16 rounded-lg mode-tejp bg-bg-fill py-(--spacing-md) text-ui-primary tablet:grid-cols-6 desktop-s:grid-cols-12">
        {groups.map((group, index) => (
          <Column key={index} index={index} heading={group.heading} attributes={group.attributes}>
            {group.links.map((link, linkIndex) => (
              <li key={`${linkIndex}-${link.href}`}>
                <FooterLinkUI
                  href={link.href}
                  rel={link.rel}
                  target={link.target}
                  {...link.attributes}
                >
                  {link.label}
                </FooterLinkUI>
              </li>
            ))}
          </Column>
        ))}

        {contact ? (
          <Column index={groups.length} heading={contact.heading}>
            {contact.email ? (
              <li>
                <FooterLinkUI
                  href={`mailto:${contact.email.address}`}
                  {...contact.email.attributes}
                >
                  {contact.email.address}
                </FooterLinkUI>
              </li>
            ) : null}
            {contact.phone ? (
              <li>
                <FooterLinkUI
                  href={`tel:${contact.phone.number.replace(/[^\d+]/g, "")}`}
                  {...contact.phone.attributes}
                >
                  {contact.phone.number}
                </FooterLinkUI>
              </li>
            ) : null}
            {contact.location ? (
              <li className="flex h-[1.5625rem] items-center text-text-m desktop-s:h-[2.375rem] desktop-s:text-text-l">
                {contact.location}
              </li>
            ) : null}
          </Column>
        ) : null}

        {/* Mobile: the wordmark, then the line under it; from Tablet two cells, the line first. */}
        <div className="flex flex-col gap-(--spacing-sm) px-(--spacing-sm) tablet:contents">
          <Logo className="h-auto w-full tablet:order-2 tablet:col-span-3 desktop-s:col-span-7" />
          {copyright ? (
            <p className="text-text-xs text-black tablet:order-1 tablet:col-span-3 tablet:flex tablet:items-end tablet:px-(--spacing-sm) desktop-s:col-span-5">
              © {new Date().getFullYear()} {copyright}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
