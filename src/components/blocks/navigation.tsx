"use client";

import { type ReactNode, useId, useState } from "react";
import { TextLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * navigation from Figma "04 — Blocks" (9051:12518), `State=Closed`: a transparent row over the
 * page, in the page grid (12 columns from Desktop S, 6 below) with `grid/gap` at the sides and
 * `spacing/sm` above and below. `color` is Figma's Dark or Light: the text and logo in `ui-primary`
 * of that mode.
 * - The full logo in the first four columns (three on Mobile), `spacing/sm` in: 24px high, 16px on
 *   Mobile.
 * - Desktop S and L: a column per menu link (Label S), and over the last two columns the login
 *   link (Figma: "Dealer login") with `arrow_up_right`, `spacing/sm` from the edge.
 * - Tablet and Mobile: the short login link (Figma: "Login", `spacing/3xs` to the icon) and the
 *   "[Meny]" button, `spacing/xs` apart, `grid/margin` from the edge.
 * The open menus are a later pass; until then "[Meny]" shows the links in a plain list.
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
  /** Figma's Modeller, Tjänster and Om oss. */
  links: NavigationLink[];
  /** The login link; `shortLabel` below Desktop S (Figma: "Dealer login" and "Login"). */
  login?: NavigationLink & { shortLabel?: ReactNode };
  /** Figma's `Color`: the mode of the page under the row. */
  color?: "dark" | "light";
  menuLabel?: string;
  closeLabel?: string;
  /** Start with the menu open below Desktop S (the kitchensink uses it). */
  defaultOpen?: boolean;
  attributes?: Attributes;
};

const isCurrentPath = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Navigation({
  links,
  login,
  color = "light",
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
      className={`${color === "dark" ? "mode-dark" : "mode-light"} ${open ? "bg-bg-fill desktop-s:bg-transparent" : ""}`}
      {...attributes}
    >
      <div className="grid grid-cols-6 gap-x-(--grid-gap) px-(--grid-gap) py-(--spacing-sm) text-ui-primary desktop-s:grid-cols-12">
        <div className="col-span-3 flex items-center pl-(--spacing-sm) tablet:col-span-4 tablet:items-start">
          <Link href="/" aria-label="Milevas">
            <Logo title="" className="block h-4 w-auto tablet:h-6" />
          </Link>
        </div>

        {links.map((link) => (
          <div key={link.href} className="hidden items-center desktop-s:flex">
            <NavLink
              href={link.href}
              rel={link.rel}
              target={link.target}
              aria-current={isCurrent(link) ? "page" : undefined}
              {...link.attributes}
            >
              {link.label}
            </NavLink>
          </div>
        ))}

        {login ? (
          <div className="hidden justify-end self-start pr-(--spacing-sm) desktop-s:col-[-3/-1] desktop-s:flex">
            <TextLink
              href={login.href}
              rel={login.rel}
              target={login.target}
              icon="arrow-up-right"
              {...login.attributes}
            >
              {login.label}
            </TextLink>
          </div>
        ) : null}

        <div className="col-span-3 flex items-center justify-end gap-(--spacing-xs) pr-(--grid-margin) tablet:col-span-2 desktop-s:hidden">
          {login ? (
            <TextLink
              href={login.href}
              rel={login.rel}
              target={login.target}
              icon="arrow-up-right"
              className="gap-(--spacing-3xs)!"
              {...login.attributes}
            >
              {login.shortLabel ?? login.label}
            </TextLink>
          ) : null}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="py-(--spacing-2xs) text-label-s whitespace-nowrap"
          >
            [{open ? closeLabel : menuLabel}]
          </button>
        </div>

        {/* Until the menus are built: the links in a plain list. */}
        <ul
          id={menuId}
          className={`col-span-full flex-col pt-(--spacing-md) pl-(--spacing-sm) desktop-s:hidden ${open ? "flex" : "hidden"}`}
        >
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                variant="secondary"
                href={link.href}
                rel={link.rel}
                target={link.target}
                active={isCurrent(link)}
                onClick={() => setOpen(false)}
                {...link.attributes}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
