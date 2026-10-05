"use client";

import { type ReactNode, useId, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * Navigation from Figma "04 — Blocks" (8309:4506). A white bar (`bg-active`) with the logo symbol,
 * Label S links and a primary S button.
 * - Mobile: logo and a menu toggle; open, the links in Label L and the button below.
 * - Tablet: the bar spans the width, the button on the right.
 * - Desktop S: the bar shrinks to its content and centres, the button 64px (`spacing/2xl`) away.
 * - Desktop L: as Desktop S, the button next to the links (`spacing/md`).
 * Around the bar: `spacing/sm` below Desktop S, `grid/margin` sideways from Desktop S.
 *
 * The Header global feeds it on the site (`src/payload/globals/Header/Component.tsx`).
 */

/** Data attributes spread on an element, e.g. visual editing's click-to-edit markers. */
type Attributes = Partial<Record<string, string>>;

export type NavigationLink = {
  label: ReactNode;
  href: string;
  /** Marks the link as the current page; without it the link is current when its path is. */
  current?: boolean;
  rel?: string;
  target?: "_blank";
  attributes?: Attributes;
};

type NavigationProps = {
  links: NavigationLink[];
  /** The button ("Bygg din truck"); left out when the Header global has none. */
  cta?: NavigationLink;
  menuLabel?: string;
  closeLabel?: string;
  /** Start with the mobile menu open (the kitchensink uses it). */
  defaultOpen?: boolean;
  attributes?: Attributes;
};

const isCurrentPath = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

function CtaLink({ cta, className }: { cta: NavigationLink; className?: string }) {
  return (
    <ButtonLink
      href={cta.href}
      rel={cta.rel}
      target={cta.target}
      className={className}
      {...cta.attributes}
    >
      {cta.label}
    </ButtonLink>
  );
}

export function Navigation({
  links,
  cta,
  menuLabel = "Meny",
  closeLabel = "Stäng",
  defaultOpen = false,
  attributes,
}: NavigationProps) {
  const [open, setOpen] = useState(defaultOpen);
  const menuId = useId();
  const pathname = usePathname();
  const isCurrent = (link: NavigationLink) => link.current ?? isCurrentPath(link.href, pathname);

  return (
    <nav
      className="flex justify-center p-(--spacing-sm) desktop-s:px-(--grid-margin)"
      {...attributes}
    >
      <div className="flex w-full flex-col items-start gap-(--spacing-3xl) rounded-sm border border-border-primary bg-bg-active px-(--spacing-sm) py-(--spacing-xs) tablet:flex-row tablet:items-center tablet:justify-between tablet:p-(--spacing-2xs) desktop-s:w-auto desktop-s:justify-start desktop-s:gap-(--spacing-2xl)">
        <div className="flex w-full items-center justify-between gap-(--spacing-md) tablet:w-auto">
          <Link href="/" aria-label="Milevas" className="text-ui-primary">
            <Logo variant="symbol" title="" className="size-8" />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="text-label-l text-ui-primary tablet:hidden"
          >
            {open ? closeLabel : menuLabel}
          </button>
          <ul className="hidden items-center gap-(--spacing-sm) tablet:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  rel={link.rel}
                  target={link.target}
                  aria-current={isCurrent(link) ? "page" : undefined}
                  className={`block whitespace-nowrap py-(--spacing-2xs) text-label-s transition-colors hover:text-ui-primary ${
                    isCurrent(link) ? "text-ui-primary" : "text-ui-tertiary"
                  }`}
                  {...link.attributes}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Visibility sits on a wrapper: ButtonLink's own inline-flex would beat a `hidden` on it. */}
          {cta ? (
            <span className="hidden desktop-l:flex">
              <CtaLink cta={cta} />
            </span>
          ) : null}
        </div>

        {cta ? (
          <span className="hidden tablet:flex desktop-l:hidden">
            <CtaLink cta={cta} />
          </span>
        ) : null}

        <div
          id={menuId}
          className={`flex-col gap-(--spacing-3xl) self-stretch tablet:hidden ${open ? "flex" : "hidden"}`}
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  rel={link.rel}
                  target={link.target}
                  aria-current={isCurrent(link) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="block py-(--spacing-xs) text-label-l text-ui-primary"
                  {...link.attributes}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {cta ? <CtaLink cta={cta} className="self-start" /> : null}
        </div>
      </div>
    </nav>
  );
}
