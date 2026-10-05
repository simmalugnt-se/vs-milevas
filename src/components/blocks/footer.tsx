import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";
import { LocaleLink } from "./locale-link";

/**
 * Footer from Figma "04 — Blocks" (6076:622): on `bg-fill`, a row of Label S links, the wordmark
 * across the full width, and icon links: mail and globe (globe switches language). The same at
 * every breakpoint; only the wordmark scales. Everything sits 16px in (Figma's `scale/md-root`, the
 * same value as `spacing/sm`), not on the grid margin.
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

type FooterProps = {
  links: FooterLink[];
  /** The mail icon links here; left out without an address. */
  email?: { address: string; label: string; attributes?: Attributes };
  /** Accessible name of the globe icon, which switches to the other language. */
  languageLabel?: string;
  attributes?: Attributes;
};

export function Footer({ links, email, languageLabel, attributes }: FooterProps) {
  return (
    <footer className="flex flex-col bg-bg-fill text-ui-primary" {...attributes}>
      <ul className="flex flex-wrap gap-(--spacing-sm)">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              rel={link.rel}
              target={link.target}
              className="block p-(--spacing-sm) text-label-s"
              {...link.attributes}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-(--spacing-sm)">
        <Logo className="h-auto w-full" />
      </div>
      {email || languageLabel ? (
        <ul className="flex gap-(--spacing-sm) p-(--spacing-sm)">
          {email ? (
            <li>
              <a
                href={`mailto:${email.address}`}
                aria-label={email.label}
                className="block"
                {...email.attributes}
              >
                <Icon name="mail" />
              </a>
            </li>
          ) : null}
          {languageLabel ? (
            <li>
              <LocaleLink label={languageLabel} className="block">
                <Icon name="globe" />
              </LocaleLink>
            </li>
          ) : null}
        </ul>
      ) : null}
    </footer>
  );
}
