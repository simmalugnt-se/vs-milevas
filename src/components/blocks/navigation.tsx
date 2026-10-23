"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { TextLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * navigation from Figma "04 — Blocks" (9051:12518): a row over the page in the page grid (12
 * columns from Desktop S, 6 below) with `grid/gap` at the sides and `spacing/sm` above and below.
 * `color` is Figma's Dark or Light: the text and logo in `ui-primary` of that mode. A page with a
 * `data-navigation="light"` block (the configurator and Login, as on Figma's page templates) turns a
 * closed navigation Light.
 * - The full logo in the first four columns (three on Mobile), `spacing/sm` in: 24px high, 16px on
 *   Mobile.
 * - Desktop S and L: a column per menu (Label S), and over the last two columns the login link
 *   (Figma: "Dealer login") with `arrow_up_right`, `spacing/sm` from the edge.
 * - Tablet and Mobile: the short login link (Figma: "Login", `spacing/3xs` to the icon) and the
 *   "[Meny]" button, `spacing/xs` apart, `grid/margin` from the edge.
 *
 * Open (Figma's `State=Modeller`, `Tjänster`, `Om oss`), the row gets `navigation-fill` with a 10px
 * blur, a second row `spacing/2xl` down and `spacing/xl` (`spacing/lg` from Desktop S) below it,
 * and `navigation-overlay` over the rest of the screen. It is Dark, the only open look Figma draws.
 * - Desktop S and L: the open menu's label stays `ui-primary` and the others turn `ui-tertiary`.
 *   Its links in Text XL sit at the bottom of five columns, or of five and four when there are
 *   more than three, the two columns with the same spacing, and a square image fills the last
 *   three columns (empty without `image`). Pointing at a link turns it `ui-brand` and the others
 *   `ui-tertiary` (Figma's `Truck=1` to `6`, in every menu), and a link with its own `image` shows
 *   it instead.
 * - Tablet and Mobile: "[Meny]" opens an accordion of the menus between lines, the open one's label
 *   `ui-brand` with its links in Text XL, the others `ui-tertiary`. Tablet has the open menu's
 *   square image in the last two columns, cut at the edge.
 * A menu without links is a plain link (`href`).
 *
 * Motion, from Figma's prototype: on Desktop S and L pointing at a menu opens it (Mouse enter) and
 * leaving the row closes it (Mouse leave); a click toggles it too. Opening, the panel grows in 0.6s
 * with `cubic-bezier(0.9, 0, 0.17, 1.01)` while the links and image fade in and the other menus'
 * labels fade to `ui-tertiary`; closing, it shrinks the same way over its content, and the panel's
 * look goes when it is shut. Moving to another menu fades the labels in 0.18s and swaps the content
 * at once. Below Desktop S, "[Meny]" opens the accordion the same way and closes it at once.
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
  /** Shown in the open menu's square while the link is pointed at (Figma's truck images). */
  image?: ReactNode;
  attributes?: Attributes;
};

export type NavigationMenu = {
  /** Figma: "Modeller", "Tjänster", "Om oss". */
  label: ReactNode;
  links?: NavigationLink[];
  /** Without `links`, the label is a link here. */
  href?: string;
  rel?: string;
  target?: "_blank";
  /** The square image beside the open menu, e.g. a `next/image` with `fill`. */
  image?: ReactNode;
  attributes?: Attributes;
};

type NavigationProps = {
  menus: NavigationMenu[];
  /** The login link; `shortLabel` below Desktop S (Figma: "Dealer login" and "Login"). */
  login?: NavigationLink & { shortLabel?: ReactNode };
  /** Figma's `Color`: the mode of the page under the row. */
  color?: "dark" | "light";
  menuLabel?: string;
  /** The menu open from the start, and below Desktop S the accordion open (the kitchensink). */
  defaultActive?: number;
  /** The link of the open menu pointed at from the start (the kitchensink). */
  defaultHovered?: number;
  attributes?: Attributes;
};

/** The prototype's curve; the open and close take `openTime`, a move between menus 0.18s. */
const ease = "ease-[cubic-bezier(0.9,0,0.17,1.01)] motion-reduce:transition-none";
const openTime = 600;

/** A row that opens from nothing as the prototype's panels: a grid row from `0fr`, faded in. */
const growing = `grid-cols-subgrid transition-[grid-template-rows,opacity] duration-[600ms] ${ease} starting:grid-rows-[0fr] starting:opacity-0`;

/** A line above and below each accordion, inside it as Figma's strokes are. */
const accordionLines =
  "shadow-[inset_0_1px_var(--color-border-primary),inset_0_-1px_var(--color-border-primary)]";

const isCurrentPath = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/** Links in Text XL, as Figma's link containers. */
function MenuLinks({
  links,
  isCurrent,
  hovered,
  onHover,
  className,
}: {
  links: NavigationLink[];
  isCurrent: (link: NavigationLink) => boolean;
  /** The link pointed at, `ui-brand` with the others `ui-tertiary` (Desktop). */
  hovered?: NavigationLink;
  onHover?: (link: NavigationLink | undefined) => void;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col ${className ?? ""}`} onMouseLeave={() => onHover?.(undefined)}>
      {links.map((link, index) => (
        // Links may share an address (several to one section), so the key has the position too.
        <li key={`${index}-${link.href}`} onMouseEnter={() => onHover?.(link)}>
          <NavLink
            variant="secondary"
            href={link.href}
            rel={link.rel}
            target={link.target}
            aria-current={isCurrent(link) ? "page" : undefined}
            className={
              hovered ? (hovered === link ? "text-ui-brand!" : "text-ui-tertiary!") : undefined
            }
            {...link.attributes}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Navigation({
  menus,
  login,
  color = "light",
  menuLabel = "Meny",
  defaultActive,
  defaultHovered,
  attributes,
}: NavigationProps) {
  const [active, setActive] = useState<number | null>(defaultActive ?? null);
  const [open, setOpen] = useState(defaultActive !== undefined);
  // Desktop: the menu still shown while its panel closes, and whether the last change moved to
  // another open menu (the quicker fade).
  const [closing, setClosing] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);
  const id = useId();
  const pathname = usePathname();
  const isCurrent = (link: NavigationLink) => link.current ?? isCurrentPath(link.href, pathname);

  const activeMenu = active === null ? undefined : menus[active];
  const [hovered, setHovered] = useState<NavigationLink | undefined>(
    defaultHovered === undefined ? undefined : activeMenu?.links?.[defaultHovered],
  );
  const desktopOpen = Boolean(activeMenu?.links?.length);
  // The menu in the Desktop panel: the open one, or the one closing.
  const shownMenu = desktopOpen ? activeMenu : closing === null ? undefined : menus[closing];
  const desktopLook = desktopOpen || closing !== null;

  useEffect(() => {
    if (closing === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setClosing(null), reduce ? 0 : openTime);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const openMenu = (index: number) => {
    if (desktopOpen && active === index) return;
    setMoved(desktopOpen);
    setActive(index);
    setClosing(null);
    setHovered(undefined);
  };
  const closeMenu = () => {
    if (!desktopOpen) return;
    setMoved(false);
    setClosing(active);
    setActive(null);
    setHovered(undefined);
  };
  const toggle = (index: number) => {
    setActive((value) => (value === index ? null : index));
    setHovered(undefined);
  };

  // Figma's open look, per width: below Desktop S when "[Meny]" is open, from it when a menu is
  // open or closing.
  const openLook = [
    open ? "max-desktop-s:mode-dark max-desktop-s:min-h-svh" : "",
    desktopLook ? "desktop-s:mode-dark desktop-s:min-h-svh" : "",
  ].join(" ");
  const fill = [
    open ? "max-desktop-s:bg-navigation-fill max-desktop-s:backdrop-blur-[0.625rem]" : "",
    desktopLook ? "desktop-s:bg-navigation-fill desktop-s:backdrop-blur-[0.625rem]" : "",
  ].join(" ");

  const columns = (links: NavigationLink[]) =>
    links.length > 3
      ? [links.slice(0, Math.ceil(links.length / 2)), links.slice(Math.ceil(links.length / 2))]
      : [links];

  return (
    <nav
      className={`flex flex-col ${color === "dark" ? "mode-dark" : "mode-light"} ${openLook} ${
        open || desktopLook ? "" : "[body:has(main_[data-navigation=light])_&]:mode-light"
      }`}
      {...attributes}
    >
      <div
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && !open) closeMenu();
        }}
        className={`grid grid-cols-6 gap-x-(--grid-gap) overflow-hidden px-(--grid-gap) py-(--spacing-sm) text-ui-primary desktop-s:grid-cols-12 ${fill}`}
      >
        <div className="col-span-3 flex items-center pl-(--spacing-sm) tablet:col-span-4 tablet:items-start">
          <Link href="/" aria-label="Milevas">
            <Logo title="" className="block h-4 w-auto tablet:h-6" />
          </Link>
        </div>

        {menus.map((menu, index) => {
          const tone = `transition-colors ${moved ? "duration-[180ms]" : "duration-[600ms]"} ${ease} ${
            desktopOpen && active !== index ? "text-ui-tertiary" : "text-ui-primary"
          }`;
          return (
            <div key={index} className="hidden items-center desktop-s:flex">
              {menu.links?.length ? (
                <button
                  type="button"
                  aria-expanded={active === index}
                  aria-controls={`${id}-panel`}
                  onClick={() => (active === index ? closeMenu() : openMenu(index))}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") openMenu(index);
                  }}
                  className={`py-(--spacing-2xs) text-label-s whitespace-nowrap ${tone}`}
                  {...menu.attributes}
                >
                  {menu.label}
                </button>
              ) : menu.href ? (
                <NavLink
                  href={menu.href}
                  rel={menu.rel}
                  target={menu.target}
                  aria-current={isCurrentPath(menu.href, pathname) ? "page" : undefined}
                  className={tone}
                  {...menu.attributes}
                >
                  {menu.label}
                </NavLink>
              ) : null}
            </div>
          );
        })}

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

        <div className="col-span-3 flex items-center justify-end gap-(--spacing-xs) self-start pr-(--grid-margin) tablet:col-span-2 desktop-s:hidden">
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
            aria-controls={`${id}-accordion`}
            onClick={() => {
              setActive(open ? null : 0);
              setOpen(!open);
            }}
            className="py-(--spacing-2xs) text-label-s whitespace-nowrap"
          >
            [{menuLabel}]
          </button>
        </div>

        {/* Desktop S and L: the open menu's links and image; shut while it closes. */}
        {shownMenu?.links?.length ? (
          <div
            id={`${id}-panel`}
            inert={!desktopOpen}
            className={`col-span-full hidden desktop-s:grid ${growing} ${
              desktopOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="col-span-full grid min-h-0 grid-cols-subgrid overflow-hidden">
              <div className="col-span-full grid grid-cols-subgrid pt-(--spacing-2xl) pb-[calc(var(--spacing-lg)-var(--spacing-sm))]">
                {columns(shownMenu.links).map((links, column) => (
                  <MenuLinks
                    key={column}
                    links={links}
                    isCurrent={isCurrent}
                    hovered={hovered}
                    onHover={setHovered}
                    className={`justify-end ${
                      column === 0
                        ? `pl-(--spacing-sm) ${shownMenu.links && shownMenu.links.length > 3 ? "col-span-5" : "col-span-9"}`
                        : "col-span-4"
                    }`}
                  />
                ))}
                <div className="col-span-3 flex items-center pr-(--spacing-sm)">
                  <div className="relative aspect-square flex-1">
                    {hovered?.image ?? shownMenu.image}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tablet and Mobile: the accordion, and on Tablet the open menu's image. */}
        {open ? (
          <div className={`col-span-full grid grid-rows-[1fr] desktop-s:hidden ${growing}`}>
            <div className="col-span-full grid min-h-0 grid-cols-subgrid overflow-hidden">
              <div className="col-span-full grid grid-cols-subgrid pt-(--spacing-2xl) pb-[calc(var(--spacing-xl)-var(--spacing-sm))]">
                <div
                  id={`${id}-accordion`}
                  className="col-span-6 flex flex-col px-(--grid-margin) tablet:col-span-4 tablet:px-0 tablet:pl-(--spacing-sm) desktop-s:hidden"
                >
                  {menus.map((menu, index) => {
                    const expanded = active === index;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col gap-(--spacing-2xs) ${accordionLines} ${
                          expanded && menu.links?.length ? "pb-(--spacing-2xs)" : ""
                        }`}
                      >
                        {menu.links?.length ? (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() => toggle(index)}
                            className="flex w-full items-center justify-between py-(--spacing-2xs) text-left"
                            {...menu.attributes}
                          >
                            <span
                              className={`py-(--spacing-2xs) text-label-s whitespace-nowrap ${
                                expanded ? "text-ui-brand" : "text-ui-tertiary"
                              }`}
                            >
                              {menu.label}
                            </span>
                            <Icon name="chevron-down" className="tablet:[&_path]:stroke-2" />
                          </button>
                        ) : menu.href ? (
                          <NavLink
                            href={menu.href}
                            rel={menu.rel}
                            target={menu.target}
                            className="my-(--spacing-2xs) text-ui-tertiary"
                            {...menu.attributes}
                          >
                            {menu.label}
                          </NavLink>
                        ) : null}
                        {expanded && menu.links?.length ? (
                          <MenuLinks links={menu.links} isCurrent={isCurrent} />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="relative col-span-2 hidden self-stretch tablet:block desktop-s:hidden">
                  <div className="absolute inset-y-0 left-0 aspect-square">{activeMenu?.image}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div
        aria-hidden
        className={`flex-1 bg-navigation-overlay ${open ? "max-desktop-s:block" : "max-desktop-s:hidden"} ${
          desktopLook ? "desktop-s:block" : "desktop-s:hidden"
        }`}
      />
    </nav>
  );
}
