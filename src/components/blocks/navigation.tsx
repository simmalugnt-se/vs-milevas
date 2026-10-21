"use client";

import { type ReactNode, useId, useState } from "react";
import { TextLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * navigation from Figma "04 — Blocks" (9051:12518): a row over the page in the page grid (12
 * columns from Desktop S, 6 below) with `grid/gap` at the sides and `spacing/sm` above and below.
 * `color` is Figma's Dark or Light: the text and logo in `ui-primary` of that mode.
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
 *   more than three, and a square image fills the last three columns (empty without `image`).
 *   Pointing at a link with its own `image` (Figma's `Truck=1` to `6`) turns it `ui-brand`, the
 *   others `ui-tertiary`, and shows its image instead.
 * - Tablet and Mobile: "[Meny]" opens an accordion of the menus between lines, the open one's label
 *   `ui-brand` with its links in Text XL, the others `ui-tertiary`. Tablet has the open menu's
 *   square image in the last two columns, cut at the edge.
 * A menu without links is a plain link (`href`).
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
  /** The link pointed at, `ui-brand` with the others `ui-tertiary` (Desktop's truck images). */
  hovered?: NavigationLink;
  onHover?: (link: NavigationLink | undefined) => void;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col ${className ?? ""}`} onMouseLeave={() => onHover?.(undefined)}>
      {links.map((link) => (
        <li key={link.href} onMouseEnter={() => onHover?.(link.image ? link : undefined)}>
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
  const id = useId();
  const pathname = usePathname();
  const isCurrent = (link: NavigationLink) => link.current ?? isCurrentPath(link.href, pathname);

  const activeMenu = active === null ? undefined : menus[active];
  const [hovered, setHovered] = useState<NavigationLink | undefined>(
    defaultHovered === undefined ? undefined : activeMenu?.links?.[defaultHovered],
  );
  const desktopOpen = Boolean(activeMenu?.links?.length);
  const toggle = (index: number) => {
    setActive((value) => (value === index ? null : index));
    setHovered(undefined);
  };

  // Figma's open look, per width: below Desktop S when "[Meny]" is open, from it when a menu is.
  const openLook = [
    open ? "max-desktop-s:mode-dark max-desktop-s:min-h-svh" : "",
    desktopOpen ? "desktop-s:mode-dark desktop-s:min-h-svh" : "",
  ].join(" ");
  const fill = [
    open
      ? "max-desktop-s:bg-navigation-fill max-desktop-s:pb-(--spacing-xl) max-desktop-s:backdrop-blur-[0.625rem]"
      : "",
    desktopOpen
      ? "desktop-s:bg-navigation-fill desktop-s:pb-(--spacing-lg) desktop-s:backdrop-blur-[0.625rem]"
      : "",
  ].join(" ");

  const columns = (links: NavigationLink[]) =>
    links.length > 3
      ? [links.slice(0, Math.ceil(links.length / 2)), links.slice(Math.ceil(links.length / 2))]
      : [links];

  return (
    <nav
      className={`flex flex-col ${color === "dark" ? "mode-dark" : "mode-light"} ${openLook}`}
      {...attributes}
    >
      <div
        className={`grid grid-cols-6 gap-x-(--grid-gap) gap-y-(--spacing-2xl) overflow-hidden px-(--grid-gap) py-(--spacing-sm) text-ui-primary desktop-s:grid-cols-12 ${fill}`}
      >
        <div className="col-span-3 flex items-center pl-(--spacing-sm) tablet:col-span-4 tablet:items-start">
          <Link href="/" aria-label="Milevas">
            <Logo title="" className="block h-4 w-auto tablet:h-6" />
          </Link>
        </div>

        {menus.map((menu, index) => {
          const tone = desktopOpen && active !== index ? "text-ui-tertiary" : "text-ui-primary";
          return (
            <div key={index} className="hidden items-center desktop-s:flex">
              {menu.links?.length ? (
                <button
                  type="button"
                  aria-expanded={active === index}
                  aria-controls={`${id}-panel`}
                  onClick={() => toggle(index)}
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

        {/* Desktop S and L: the open menu's links and image. */}
        {desktopOpen && activeMenu?.links ? (
          <div id={`${id}-panel`} className="col-span-full hidden grid-cols-subgrid desktop-s:grid">
            {columns(activeMenu.links).map((links, column) => (
              <MenuLinks
                key={column}
                links={links}
                isCurrent={isCurrent}
                hovered={hovered}
                onHover={setHovered}
                className={`justify-end ${
                  column === 0
                    ? `pl-(--spacing-sm) ${activeMenu.links && activeMenu.links.length > 3 ? "col-span-5" : "col-span-9"}`
                    : "col-span-4 gap-(--spacing-2xs)"
                }`}
              />
            ))}
            <div className="col-span-3 flex items-center pr-(--spacing-sm)">
              <div className="relative aspect-square flex-1">
                {hovered?.image ?? activeMenu.image}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tablet and Mobile: the accordion, and on Tablet the open menu's image. */}
        {open ? (
          <>
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
          </>
        ) : null}
      </div>

      <div
        aria-hidden
        className={`flex-1 bg-navigation-overlay ${open ? "max-desktop-s:block" : "max-desktop-s:hidden"} ${
          desktopOpen ? "desktop-s:block" : "desktop-s:hidden"
        }`}
      />
    </nav>
  );
}
