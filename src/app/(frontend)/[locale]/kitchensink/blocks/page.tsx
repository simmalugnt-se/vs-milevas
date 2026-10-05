import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConfiguratorScreen } from "@/components/blocks/configurator-screen";
import { Footer, type FooterLink } from "@/components/blocks/footer";
import { Navigation, type NavigationLink } from "@/components/blocks/navigation";
import { ProductGrid } from "@/components/blocks/product-grid";
import { TextBoxinfo } from "@/components/blocks/text-boxinfo";
import { TextGrid, type TextGridCard } from "@/components/blocks/text-grid";
import { Button } from "@/components/ui/button";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox, choiceLayout } from "@/components/ui/configurator-box";
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

/** The configurator's two steps in Figma: lift capacity (six, in a grid) and battery (two, stacked). */
const configuratorSteps = [
  {
    number: "01",
    label: "Lyftkapacitet",
    choices: [
      ["1.5 ton", "Från 169 tkr", "KBE 15 Li G1"],
      ["1.8 ton", "Från 184 tkr", "KBE 18 Li G1"],
      ["2.0 ton", "Från 196 tkr", "KBE 20 Li G1"],
      ["2.5 ton", "Från 211 tkr", "KBE 25 Li G1"],
      ["3.0 ton", "Från 246 tkr", "KBE 30 Li G1"],
      ["3.5 ton", "Från 276 tkr", "KBE 35 Li G1"],
    ],
  },
  {
    number: "02",
    label: "Batteri",
    choices: [
      ["Standard", "Ingår", "150 Ah — räcker gott för normal drift, upp till ett skift per dag."],
      [
        "Stort batteri",
        "+8 000 kr",
        "228 Ah — längre räckvidd utan laddning. Perfekt om ni kör flera skift eller vill undvika mellanladdning.",
      ],
    ],
    help: (
      <>
        Behöver du hjälp med andra batterier?{" "}
        <span className="text-ui-primary underline">Kontakta oss</span> så löser vi det.
      </>
    ),
  },
] as const;

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
      <div data-layout-block={id} className="-mx-(--grid-margin) bg-bg-fill">
        {children}
      </div>
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

      <Block id="text-boxinfo" title="Text & boxinfo" figma="8389:8524">
        <TextBoxinfo
          heading="Truck från 390 kr/mån"
          highlight="Easy peasy lemon squeezy."
          text="Vi erbjuder enkel finansiering så du kan fokusera på verksamheten."
          items={[
            {
              heading: "Leasing",
              label: "Fast kostnad",
              text: "Förmånliga leasingavtal med fasta månadskostnader.",
            },
            {
              heading: "Insats",
              label: "0 kr",
              text: "Kom igång utan stora initiala investeringar.",
            },
            {
              heading: "Besked",
              label: "-24h",
              text: "Enkel ansökningsprocess med svar inom 24h.",
            },
          ]}
          cta={{ label: "Läs mer", href: "/kitchensink/blocks#text-boxinfo" }}
        />
      </Block>

      {configuratorSteps.map((step, index) => (
        <Block
          key={step.number}
          id={`configurator-${step.number}`}
          title={`Configurator, steg ${step.number}`}
          figma="8721:16450"
        >
          <ConfiguratorScreen
            total="Totalt: 173 900 kr"
            prices={[
              { label: "Leasing (48 mån)", value: "3 261 kr/mån" },
              { label: "Långtidshyra (48 mån)", value: "3 261 kr/mån" },
            ]}
            image={
              <Image
                src={truckCounterbalance}
                alt="Elektrisk motviktstruck"
                fill
                sizes="(width >= 64rem) 66vw, 100vw"
                className="object-contain"
              />
            }
            step={
              <ConfiguratorBox
                number={step.number}
                label={step.label}
                {...choiceLayout(step.choices.map(([, price]) => price))}
              >
                {step.choices.map(([title, price, text], choice) => (
                  <Choice
                    key={title}
                    title={title}
                    price={price}
                    text={text}
                    textSize={step.choices.length > 2 ? "m" : "s"}
                    selected={choice === 1}
                  />
                ))}
              </ConfiguratorBox>
            }
            help={"help" in step ? step.help : undefined}
            actions={
              <>
                {index > 0 ? (
                  <Button color="gray" size="m" iconLeft="arrow-left" iconRight={null}>
                    Föregående
                  </Button>
                ) : null}
                <Button size="m">Nästa</Button>
              </>
            }
            contactText="Har du frågor eller önskar något annat av din konfiguration?"
            contact={
              <Button color="tejp" size="m" iconRight="phone" className="w-full">
                Boka samtal
              </Button>
            }
          />
        </Block>
      ))}

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
