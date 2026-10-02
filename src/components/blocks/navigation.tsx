"use client";

import { useId, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";

/**
 * Navigation from Figma "04 — Blocks" (8309:4506). A white bar (`bg-active`) with the logo symbol,
 * Label S links and a primary S button.
 * - Mobile: logo and a menu toggle; open, the links in Label L and the button below.
 * - Tablet: the bar spans the width, the button on the right.
 * - Desktop S: the bar shrinks to its content and centres, the button 64px (`spacing/2xl`) away.
 * - Desktop L: as Desktop S, the button next to the links (`spacing/md`).
 * Around the bar: `spacing/sm` below Desktop S, `grid/margin` sideways from Desktop S.
 *
 * A component with props for now; the Header global will feed it later.
 */

export type NavigationLink = { label: string; href: string; current?: boolean };

type NavigationProps = {
  links: NavigationLink[];
  cta: { label: string; href: string };
  menuLabel?: string;
  closeLabel?: string;
  /** Start with the mobile menu open (the kitchensink uses it). */
  defaultOpen?: boolean;
};

export function Navigation({
  links,
  cta,
  menuLabel = "Meny",
  closeLabel = "Stäng",
  defaultOpen = false,
}: NavigationProps) {
  const [open, setOpen] = useState(defaultOpen);
  const menuId = useId();

  return (
    <nav className="flex justify-center p-(--spacing-sm) desktop-s:px-(--grid-margin)">
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
                  aria-current={link.current ? "page" : undefined}
                  className={`block whitespace-nowrap py-(--spacing-2xs) text-label-s transition-colors hover:text-ui-primary ${
                    link.current ? "text-ui-primary" : "text-ui-tertiary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Visibility sits on a wrapper: ButtonLink's own inline-flex would beat a `hidden` on it. */}
          <span className="hidden desktop-l:flex">
            <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          </span>
        </div>

        <span className="hidden tablet:flex desktop-l:hidden">
          <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
        </span>

        <div
          id={menuId}
          className={`flex-col gap-(--spacing-3xl) self-stretch tablet:hidden ${open ? "flex" : "hidden"}`}
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className="block py-(--spacing-xs) text-label-l text-ui-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href={cta.href} className="self-start">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </nav>
  );
}
