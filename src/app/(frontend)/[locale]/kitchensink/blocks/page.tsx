import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer, type FooterLink } from "@/components/blocks/footer";
import { Navigation, type NavigationLink } from "@/components/blocks/navigation";
import { ProductGrid } from "@/components/blocks/product-grid";
import { TextGrid, type TextGridCard } from "@/components/blocks/text-grid";
import type { ProductCardProps } from "@/components/ui/product-card";
import { Link } from "@/i18n/navigation";
import { getAppEnv } from "@/utilities/environment";
import truckCounterbalance from "../assets/truck-counterbalance.png";
import truckPallet from "../assets/truck-pallet.png";
import warehouse from "../assets/warehouse.jpg";

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

/** The six truck types in Figma's product-grid; two placeholder images take turns. */
const products: ProductCardProps[] = [
  { name: "Elektriska motviktstruckar", specs: ["1.5 – 3.5 ton", "80 V 228 Ah"] },
  { name: "Skjutstativtruckar", specs: ["1.4 – 2.0 ton", "80 V 228 Ah"] },
  { name: "Låglyftare", specs: ["1.5 – 2.5 ton", "80 V 228 Ah"] },
  { name: "Ledstaplare", specs: ["1.2 – 2.0 ton", "80 V 228 Ah"] },
  { name: "Elektriska pallyftare", specs: ["1.4 – 2.0 ton", "80 V 228 Ah"] },
  { name: "Plocktruckar", specs: ["1.4 – 2.0 ton", "80 V 228 Ah"] },
].map(({ name, specs }, index) => ({
  href: `/kitchensink/blocks#product-grid-${index + 1}`,
  brand: "Baoli",
  category: "Modeller",
  name,
  specs,
  price: "169 000 kr",
  leasing: "3 326 kr",
  image: (
    <Image
      src={index % 2 === 0 ? truckCounterbalance : truckPallet}
      alt=""
      fill
      sizes="(width >= 64rem) 33vw, (width >= 48rem) 50vw, 90vw"
      className="object-contain"
    />
  ),
}));

/** Text+Grid's three cards; Figma has placeholder text and three photos, here one photo. */
const textGridCards: TextGridCard[] = ["Bygg din truck", "Få offert", "Leverans"].map(
  (label, index) => ({
    number: String(index + 1).padStart(2, "0"),
    label,
    text: "text",
    image: (
      <Image
        src={warehouse}
        alt=""
        fill
        sizes="(width >= 64rem) 33vw, 100vw"
        className="object-cover"
      />
    ),
  }),
);

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

      {/* Hover a card for the Desktop look; below Desktop S the arrow and prices always show. */}
      <Block id="product-grid" title="Product-Grid" figma="8365:8988">
        <ProductGrid products={products} label="Modeller" />
      </Block>

      <Block id="text-grid" title="Text+Grid" figma="8389:4705">
        <TextGrid heading={"Så enkelt\nfungerar det"} cards={textGridCards} />
      </Block>

      <Block id="footer" title="Footer" figma="6076:622">
        <Footer
          links={footerLinks}
          email={{ address: "hej@example.com", label: "E-post" }}
          languageLabel="In English"
        />
      </Block>
    </div>
  );
}
