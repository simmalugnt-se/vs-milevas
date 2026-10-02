import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer, type FooterIconLink, type FooterLink } from "@/components/blocks/footer";
import { Navigation, type NavigationLink } from "@/components/blocks/navigation";
import { Link } from "@/i18n/navigation";
import { getAppEnv } from "@/utilities/environment";

/**
 * Blocks from Figma "04 — Blocks" as components with placeholder content, before they become
 * Payload blocks (backlog: docs/blocks-backlog.md). Static, unlinked, not in production.
 */
export const metadata: Metadata = {
  title: "Kitchensink: block",
  robots: { index: false, follow: false },
};

const navigationLinks: NavigationLink[] = [
  { label: "Modeller", href: "/kitchensink/blocks#navigation", current: true },
  { label: "Hur det fungerar", href: "/kitchensink/blocks#hur-det-fungerar" },
  { label: "Finansiering", href: "/kitchensink/blocks#finansiering" },
  { label: "Om Baoli", href: "/kitchensink/blocks#om-baoli" },
];
const navigationCta = { label: "Bygg din truck", href: "/kitchensink/blocks#configurator" };

const footerLinks: FooterLink[] = [
  { label: "Modeller", href: "/kitchensink/blocks#footer" },
  { label: "Finansiering", href: "/kitchensink/blocks#footer-finansiering" },
  { label: "Kontakt", href: "/kitchensink/blocks#footer-kontakt" },
];
const footerIconLinks: FooterIconLink[] = [
  { icon: "mail", label: "E-post", href: "mailto:hej@example.com" },
  { icon: "globe", label: "Språk", href: "/kitchensink/blocks#footer-sprak" },
];

/** One block: a label on the page's grid margin, then the block across the full width. */
function Block({
  id,
  title,
  figma,
  children,
}: {
  id: string;
  title: string;
  figma: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="flex gap-4 text-label-s">
        <span className="text-ui-primary">{title}</span>
        <span className="text-ui-tertiary">Figma {figma}</span>
      </h2>
      {/* The layout pads <main> with the grid margin; blocks bring their own, so cancel it. */}
      <div className="-mx-(--grid-margin) bg-bg-fill">{children}</div>
    </section>
  );
}

export default function KitchensinkBlocksPage() {
  if (getAppEnv() === "prod") notFound();

  return (
    <div className="w-full space-y-16 py-12">
      <header className="space-y-2">
        <p className="text-label-s text-ui-secondary">
          Milevas designsystem ·{" "}
          <Link href="/kitchensink" className="underline">
            Kitchensink
          </Link>
        </p>
        <h1 className="text-display-m text-ui-primary">Block</h1>
        <p className="max-w-prose text-text-m text-ui-secondary">
          Komponenter från Figma &quot;04 — Blocks&quot; med platshållarinnehåll. De blir
          Payload-block med riktiga fält senare.
        </p>
        <div className="border-l-4 border-status-info bg-bg-fill px-4 py-3 text-sm text-ui-primary">
          <strong>Fortsätta arbetet?</strong> Läs{" "}
          <code className="font-mono text-xs">docs/design-system.md</code> i repot: var allt finns,
          hur ett block byggs från Figma och vad som är nästa steg. Egna beslut står i{" "}
          <code className="font-mono text-xs">docs/figma-deviations.md</code>, blocken i{" "}
          <code className="font-mono text-xs">docs/blocks-backlog.md</code>.
        </div>
      </header>

      {/* The mobile menu follows the viewport, not this box: try it at phone width. */}
      <Block id="navigation" title="Navigation" figma="8309:4506">
        <Navigation links={navigationLinks} cta={navigationCta} />
      </Block>

      <Block id="footer" title="Footer" figma="6076:622">
        <Footer links={footerLinks} iconLinks={footerIconLinks} />
      </Block>
    </div>
  );
}
