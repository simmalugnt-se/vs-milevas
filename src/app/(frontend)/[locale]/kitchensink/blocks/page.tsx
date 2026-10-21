import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ConfiguratorScreen } from "@/components/blocks/configurator-screen";
import { Footer, type FooterLink } from "@/components/blocks/footer";
import { MilevasHero } from "@/components/blocks/milevas-hero";
import { Navigation, type NavigationMenu } from "@/components/blocks/navigation";
import { ProductGrid } from "@/components/blocks/product-grid";
import { TextBoxinfo } from "@/components/blocks/text-boxinfo";
import { TextGrid, type TextGridCard } from "@/components/blocks/text-grid";
import { Button } from "@/components/ui/button";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox, choiceLayout } from "@/components/ui/configurator-box";
import type { ProductCardProps } from "@/components/ui/product-card";
import navigationTruck from "../assets/navigation-truck.png";
import truckCounterbalance from "../assets/truck-counterbalance.png";
import truckPallet from "../assets/truck-pallet.png";
import truckProductCard from "../assets/truck-product-card.png";
import warehouse from "../assets/warehouse.jpg";
import { FigmaNotes } from "../figma-notes-list";
import { type SectionId, sectionTitle } from "../sections";
import { KitchensinkPage } from "../ui";

/**
 * Blocks from Figma "04 — Blocks" as components with placeholder content, edge to edge as in the
 * page layout (backlog: docs/blocks-backlog.md).
 */
export const metadata: Metadata = { title: "Kitchensink: Block" };

/** Figma's three menus, with its texts; Modeller has Figma's truck. */
const navigationMenus: NavigationMenu[] = [
  {
    label: "Modeller",
    links: [
      "Elektriska motviktstruckar",
      "Skjutstativtruckar",
      "Låglyftare",
      "Ledstaplare",
      "Elektriska pallyftare",
      "Plocktruckar",
    ].map((label, index) => ({
      label,
      href: `/kitchensink/blocks#modell-${index + 1}`,
      // Placeholder trucks; the first is Figma's `Truck=1`.
      image: (
        <Image
          src={[truckProductCard, truckCounterbalance, truckPallet][index % 3]}
          alt=""
          fill
          sizes="25vw"
          className="object-cover"
        />
      ),
    })),
    image: <Image src={navigationTruck} alt="" fill sizes="25vw" className="object-contain" />,
  },
  {
    label: "Tjänster",
    links: ["Hur det fungerar", "Finansiering", "Bli återförsäljare"].map((label, index) => ({
      label,
      href: `/kitchensink/blocks#tjanst-${index + 1}`,
    })),
  },
  {
    label: "Om oss",
    links: ["Om Baoli", "Service & eftermarknad", "Kontakt"].map((label, index) => ({
      label,
      href: `/kitchensink/blocks#om-oss-${index + 1}`,
    })),
  },
];
const navigationLogin = {
  label: "Dealer login",
  shortLabel: "Login",
  href: "/kitchensink/blocks#login",
};

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

/** One block: its title and notes within the page margin, then the block edge to edge. */
function Block({ id, figma, children }: { id: SectionId; figma: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28 space-y-(--spacing-md)">
      <div className="space-y-(--spacing-xs)">
        <h2
          id={id}
          className="flex flex-wrap items-baseline gap-x-(--spacing-sm) text-display-xs text-ui-primary"
        >
          {sectionTitle(id)}
          <span className="font-mono text-xs text-ui-tertiary">Figma {figma}</span>
        </h2>
        <FigmaNotes target={id} />
      </div>
      <div data-layout-block={id} className="-mx-(--ks-gutter) bg-bg-fill">
        {children}
      </div>
    </section>
  );
}

export default function BlocksPage() {
  return (
    <KitchensinkPage href="/kitchensink/blocks" fullWidth>
      {/* The mobile menu follows the viewport, not this box: try it at phone width. */}
      <Block id="navigation" figma="9051:12518">
        <div className="mode-dark bg-bg-fill">
          <Navigation menus={navigationMenus} login={navigationLogin} color="dark" />
        </div>
        <Navigation menus={navigationMenus} login={navigationLogin} />
        <div className="mode-dark bg-bg-fill">
          <Navigation
            menus={navigationMenus}
            login={navigationLogin}
            color="dark"
            defaultActive={0}
          />
        </div>
        <div className="mode-dark bg-bg-fill">
          <Navigation
            menus={navigationMenus}
            login={navigationLogin}
            color="dark"
            defaultActive={0}
            defaultHovered={0}
          />
        </div>
      </Block>

      <Block id="hero" figma="8550:12778">
        <MilevasHero
          heading="Bygg din truck med Milevas"
          columns={Array.from({ length: 5 }, (_, index) => ({
            id: String(index),
            heading: "Bygg din truck:",
            label: `Bygg din truck, kolumn ${index + 1}`,
            href: "/configurator",
            rows: [
              { label: "Från", value: "169 000 kr" },
              { label: "Leasing från:", value: "3 326 kr/mån" },
            ],
          }))}
        />
      </Block>

      {/* Hover a card for the Desktop look; below Desktop S the arrow and prices always show. */}
      <Block id="product-grid" figma="8365:8988">
        <ProductGrid products={products} label="Modeller" />
      </Block>

      <Block id="text-grid" figma="8389:4705">
        <TextGrid heading={"Så enkelt\nfungerar det"} cards={textGridCards} />
      </Block>

      <Block id="text-boxinfo" figma="8389:8524">
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

      <Block id="configurator" figma="8721:16450">
        {configuratorSteps.map((step, index) => (
          <div key={step.number} id={`configurator-${step.number}`}>
            <p className="px-(--ks-gutter) pt-(--spacing-sm) font-mono text-xs text-ui-secondary">
              Steg {step.number}: {step.label}
            </p>
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
                    <Button variant="secondary" size="m" iconLeft="arrow-left" iconRight={null}>
                      Föregående
                    </Button>
                  ) : null}
                  <Button mode="dark" size="m">
                    Nästa
                  </Button>
                </>
              }
              contactText="Har du frågor eller önskar något annat av din konfiguration?"
              contact={
                <Button mode="tejp" size="m" iconRight="call" className="w-full">
                  Boka samtal
                </Button>
              }
            />
          </div>
        ))}
      </Block>

      <Block id="footer" figma="6076:622">
        <Footer
          links={footerLinks}
          email={{ address: "hej@example.com", label: "E-post" }}
          languageLabel="In English"
        />
      </Block>
    </KitchensinkPage>
  );
}
