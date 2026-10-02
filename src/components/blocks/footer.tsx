import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";

/**
 * Footer from Figma "04 — Blocks" (6076:622): on `bg-fill`, a row of Label S links, the wordmark
 * across the full width, and icon links (mail, globe). The same at every breakpoint; only the
 * wordmark scales. Everything sits 16px in (Figma's `scale/md-root`, the same value as
 * `spacing/sm`), not on the grid margin.
 *
 * A component with props for now; the Footer global will feed it later.
 */

export type FooterLink = { label: string; href: string };
export type FooterIconLink = { icon: IconName; label: string; href: string };

type FooterProps = {
  links: FooterLink[];
  /** Shown as icons; `label` is the accessible name. */
  iconLinks?: FooterIconLink[];
};

export function Footer({ links, iconLinks = [] }: FooterProps) {
  return (
    <footer className="flex flex-col bg-bg-fill text-ui-primary">
      <ul className="flex flex-wrap gap-(--spacing-sm)">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block p-(--spacing-sm) text-label-s">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-(--spacing-sm)">
        <Logo className="h-auto w-full" />
      </div>
      {iconLinks.length > 0 ? (
        <ul className="flex gap-(--spacing-sm) p-(--spacing-sm)">
          {iconLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} aria-label={link.label} className="block">
                <Icon name={link.icon} />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </footer>
  );
}
