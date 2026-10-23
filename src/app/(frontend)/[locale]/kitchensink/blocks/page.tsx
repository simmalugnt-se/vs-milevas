import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ConfiguratorQuote } from "@/components/blocks/configurator-quote";
import { ConfiguratorScreen } from "@/components/blocks/configurator-screen";
import {
  ConfiguratorStep,
  type ConfiguratorStepDisplay,
} from "@/components/blocks/configurator-step";
import { ConfiguratorThanks } from "@/components/blocks/configurator-thanks";
import { Footer, type FooterGroup } from "@/components/blocks/footer";
import { ImageText } from "@/components/blocks/image-text";
import { MilevasHero } from "@/components/blocks/milevas-hero";
import { Navigation, type NavigationMenu } from "@/components/blocks/navigation";
import { ProductGrid } from "@/components/blocks/product-grid";
import { TextBlockColumns } from "@/components/blocks/text-block-columns";
import { TextBoxinfo } from "@/components/blocks/text-boxinfo";
import { TextGrid, type TextGridCard } from "@/components/blocks/text-grid";
import { Button, TextLink } from "@/components/ui/button";
import { PriceBox } from "@/components/ui/price-box";
import type { ProductCardProps } from "@/components/ui/product-card";
import heroCounterbalance from "../../../../../../scripts/figma-homepage-assets/hero-counterbalance.png";
import heroLowLift from "../../../../../../scripts/figma-homepage-assets/hero-low-lift.png";
import heroOrderPicker from "../../../../../../scripts/figma-homepage-assets/hero-order-picker.png";
import heroPalletTruck from "../../../../../../scripts/figma-homepage-assets/hero-pallet-truck.png";
import heroReachTruck from "../../../../../../scripts/figma-homepage-assets/hero-reach-truck.png";
import heroStacker from "../../../../../../scripts/figma-homepage-assets/hero-stacker.png";
import imageTextService from "../../../../../../scripts/figma-homepage-assets/image-text-service.jpg";
import logoBaoli from "../../../../../../scripts/figma-homepage-assets/logo-baoli.png";
import logoKion from "../../../../../../scripts/figma-homepage-assets/logo-kion.png";
import logoLinde from "../../../../../../scripts/figma-homepage-assets/logo-linde.png";
import logoStill from "../../../../../../scripts/figma-homepage-assets/logo-still.png";
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

/** Figma's footer columns, with its texts. */
const footerGroups: FooterGroup[] = [
  {
    heading: "Produkter",
    links: [
      "Elektriska motviktstruckar",
      "Skjutstativtruckar",
      "Låglyftare",
      "Ledstaplare",
      "Elektriska pallyftare",
      "Plocktruckar",
    ].map((label, index) => ({ label, href: `/kitchensink/blocks#produkt-${index + 1}` })),
  },
  {
    heading: "Tjänster",
    links: ["Konfigurator", "Finansiering", "Bli återförsäljare"].map((label, index) => ({
      label,
      href: `/kitchensink/blocks#tjanst-${index + 1}`,
    })),
  },
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
/** Figma's five step types (Configurator `9264:6653`, types 1–5), with the seed's content. */
const configuratorSteps: Array<{
  type: number;
  label: string;
  display: ConfiguratorStepDisplay;
  pictured?: boolean;
  options: Array<[title: string, price: string, text?: string]>;
  help?: ReactNode;
}> = [
  {
    type: 1,
    label: "Lyftkapacitet",
    display: "grid",
    options: [
      ["1,5 ton", "169 000 kr", "Kompakt för trånga lager."],
      ["1,8 ton", "179 900 kr", "Det vanligaste valet."],
      ["2,0 ton", "196 000 kr", "För tyngre pallar."],
      ["2,5 ton", "211 000 kr", "Fyrhjulig, för ute och inne."],
      ["3,0 ton", "246 000 kr", "För terminal och industri."],
      ["3,5 ton", "276 000 kr", "Den största i serien."],
    ],
  },
  {
    type: 2,
    label: "Lyfthöjd",
    display: "stack",
    options: [
      ["Lyfthöjd 4700 mm", "Ingår", "Bygghöjd 2130 mm."],
      ["Lyfthöjd 6000 mm", "+3 500 kr", "Bygghöjd 2765 mm."],
    ],
    help: (
      <>
        Behöver du hjälp med andra mastalternativ?{" "}
        <span className="text-ui-primary underline">Kontakta oss</span> så löser vi det.
      </>
    ),
  },
  {
    type: 3,
    label: "Gaffellängd",
    display: "images",
    pictured: true,
    options: [
      ["1150 mm", "Ingår", "För EU-pall."],
      ["1500 mm", "+2 400 kr", "För långa laster."],
      ["1800 mm", "+3 900 kr", "För två pallar."],
      ["2000 mm", "+4 800 kr", "För skrymmande gods."],
    ],
  },
  {
    type: 4,
    label: "Åkplatta",
    display: "imageRows",
    pictured: true,
    options: [
      ["Utan", "Ingår", "Föraren går bakom."],
      ["Fällbar", "+4 200 kr", "För längre sträckor."],
      ["Fast", "+6 900 kr", "Med sidoskydd."],
    ],
  },
  {
    type: 5,
    label: "Finansiering",
    display: "prices",
    options: [
      ["Köp", "205 400 kr"],
      ["Leasing (48 mån)", "3 851 kr/mån"],
      ["Långtidshyra (48 mån)", "3 937 kr/mån"],
    ],
  },
];

/** The quote's and the thank-you page's price box, with Figma's example. */
const checkoutPrice = (
  <PriceBox
    variant="checkout"
    totalLabel="Totalpris"
    total="205 400 kr"
    rows={[
      { label: "Leasing (48 mån)", value: "3 851 kr/mån" },
      { label: "Uppskattad leverans", value: "4–6 veckor" },
    ]}
    note={{
      label: "Garanti",
      value: "4 år",
      text: "Omfattar fabrikationsfel på drivlina, elsystem och chassi. Slitdelar och handhavandefel ingår inte.",
    }}
  />
);

const quoteTables = [
  {
    heading: "Konfiguration",
    action: (
      <TextLink href="/kitchensink/blocks#configurator-1" iconLeft="arrow-left" icon={null}>
        Tillbaka till konfigurator
      </TextLink>
    ),
    rows: [
      ["Elektriska motviktstruckar – bas (1,8 ton)", "179 900 kr"],
      ["Stort batteri (Li-Ion)", "18 000 kr"],
      ["4-hjulig (KBE)", "4 000 kr"],
      ["Lyfthöjd 6000 mm", "3 500 kr"],
      ["Sidoförskjutning", "0 kr"],
    ].map(([label, value]) => ({ label, value })),
  },
  {
    heading: "Tekniska specifikationer",
    rows: [
      ["Vändradie", "1870 / 1850 mm"],
      ["Körhastighet (lastad/olastad)", "15 / 15 km/h"],
      ["Batterikapacitet", "76,8 V · 150 / 228 Ah"],
      ["Vikt", "3 293 kg"],
      ["Truckens bygghöjd", "2765 mm"],
    ].map(([label, value]) => ({ label, value })),
  },
];

const nextSteps = [
  ["Bekräftelse", "Du får en bekräftelse direkt via mejl."],
  ["Personlig kontakt", "En säljare hör av sig inom kort."],
  ["Plockning", "Din truck plockas ut från Baolis lager i Rolo, Italien."],
  ["Avtal", "Du får ett digitalt avtal att signera (BankID)."],
  ["Leverans", "Beräknad leverans 4–6 veckor."],
].map(([heading, text]) => ({ heading, text }));

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

/** The hero's trucks, from its Figma Make prototype; Plocktruckar from Figma's product-grid. */
const heroTrucks = [
  ["Elektriska motviktstruckar", heroCounterbalance],
  ["Skjutstativtruckar", heroReachTruck],
  ["Låglyftare", heroLowLift],
  ["Ledstaplare", heroStacker],
  ["Elektriska pallyftare", heroPalletTruck],
  ["Plocktruckar", heroOrderPicker],
] as const;

/** Text block Collumns' logos and their Desktop widths, from Figma. */
const textBlockLogos = [
  ["KION", logoKion, 116],
  ["STILL", logoStill, 131],
  ["Linde", logoLinde, 147],
  ["Baoli", logoBaoli, 108],
] as const;

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
          heading="Bygg din baoli"
          highlight="På typ 30 sekunder"
          prompt="Välj trucktyp för att börja"
          activeColumn={5}
          columns={heroTrucks.map(([name, image], index) => ({
            id: String(index),
            name,
            heading: "Bygg din truck:",
            label: `Bygg din truck: ${name}`,
            href: "/configurator",
            rows: [
              { label: "Från", value: "169 000 kr" },
              { label: "Leasing från:", value: "3 326 kr/mån" },
            ],
            image: (
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 1024px) 26.25rem, 75vw"
                className="object-contain object-bottom"
              />
            ),
          }))}
        />
      </Block>

      {/* On its own; right after the hero on a page the two share their lines (LinkedColumns). */}
      <Block id="text-block-columns" figma="8982:9898">
        <TextBlockColumns
          heading="Ett varumärke inom"
          highlight="KION Group"
          text="Baoli är en del av KION Group – samma koncern som står bakom Linde och STILL. Det gör Baoli till det praktiska instegsvalet inom en global industrikoncern med över 100 års erfarenhet av materialhantering."
          logos={textBlockLogos.map(([alt, image, width]) => ({
            width,
            image: <Image src={image} alt={alt} sizes="10rem" className="block h-auto w-full" />,
          }))}
        />
      </Block>

      <Block id="image-text" figma="9098:16638">
        <ImageText
          image={
            <Image
              src={imageTextService}
              alt="Mekaniker som servar en truck i en verkstad"
              fill
              sizes="100vw"
              className="object-cover"
            />
          }
          heading="Service du kan räkna med"
          text="Baoli EMEA har ett av branschens största reservdelslager i Europa. Tillsammans med ett centralt produktlager i Italien med över 1 000 truckar redo för leverans ger det korta ledtider."
          cta={{ label: "Bygg din truck", href: "/kitchensink/blocks#configurator" }}
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
          cta={{ label: "Bygg din truck", href: "/kitchensink/blocks#configurator" }}
        />
      </Block>

      <Block id="configurator" figma="9264:6653">
        {configuratorSteps.map((step, index) => (
          <div key={step.type} id={`configurator-${step.type}`}>
            <p className="px-(--ks-gutter) pt-(--spacing-sm) font-mono text-xs text-ui-secondary">
              Typ {step.type}: {step.label}
            </p>
            <ConfiguratorScreen
              price={
                <PriceBox
                  totalLabel="Totalpris"
                  total="205 400 kr"
                  rows={[
                    { label: "Leasing (48 mån)", value: "3 851 kr/mån" },
                    { label: "Långtidshyra (48 mån)", value: "3 937 kr/mån" },
                  ]}
                />
              }
              contact={
                <Button mode="dark" size="s" iconRight="call" className="w-full">
                  Boka samtal
                </Button>
              }
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
                <ConfiguratorStep
                  number={String(index + 2).padStart(2, "0")}
                  label={step.label}
                  display={step.display}
                  options={step.options.map(([title, price, text], option) => ({
                    key: title,
                    title,
                    price,
                    text,
                    selected: option === 1,
                    image: step.pictured ? (
                      <Image
                        src={truckPallet}
                        alt=""
                        fill
                        sizes="15rem"
                        className="object-contain"
                      />
                    ) : undefined,
                  }))}
                />
              }
              help={step.help}
              actions={
                <>
                  <Button variant="secondary" size="s" iconLeft="arrow-left" iconRight={null}>
                    Föregående
                  </Button>
                  <Button mode="dark" size="s" iconRight="arrow-right">
                    {step.display === "prices" ? "Visa offert" : "Nästa"}
                  </Button>
                </>
              }
            />
          </div>
        ))}
        <div id="configurator-offert">
          <p className="px-(--ks-gutter) pt-(--spacing-sm) font-mono text-xs text-ui-secondary">
            Offert
          </p>
          <ConfiguratorQuote
            heading="Elektrisk motviktstruck"
            back={
              <TextLink href="/kitchensink/blocks#configurator-1" iconLeft="arrow-left" icon={null}>
                Tillbaka till konfigurator
              </TextLink>
            }
            price={checkoutPrice}
            contact={
              <Button mode="dark" size="s" iconRight="call" className="w-full">
                Boka samtal
              </Button>
            }
            image={
              <Image
                src={truckCounterbalance}
                alt="Elektrisk motviktstruck"
                fill
                sizes="(width >= 64rem) 50vw, 100vw"
                className="object-contain"
              />
            }
            tables={quoteTables}
            copy={
              <div className="flex items-end gap-(--spacing-2xs)">
                <label className="flex min-w-0 flex-1 flex-col gap-(--spacing-2xs)">
                  <span className="text-text-m text-ui-primary">Skicka kopia till mig</span>
                  <input
                    type="email"
                    placeholder="namn@foretag.se"
                    className="h-10 w-full rounded-sm bg-bg-fill px-(--spacing-sm) text-text-xs text-ui-primary ring-(length:--stroke-width) ring-border-primary ring-inset placeholder:text-ui-tertiary"
                  />
                </label>
                <Button variant="secondary" size="s" iconRight="mail">
                  Skicka
                </Button>
              </div>
            }
            order={
              <Button
                mode="tejp"
                size="m"
                iconRight="shopping-cart"
                className="w-full max-desktop-s:gap-(--spacing-xs) max-desktop-s:p-(--spacing-xs)"
              >
                Fortsätt beställning
              </Button>
            }
          />
        </div>
        <div id="configurator-tack">
          <p className="px-(--ks-gutter) pt-(--spacing-sm) font-mono text-xs text-ui-secondary">
            Tack
          </p>
          <ConfiguratorThanks
            heading="Tack för din beställning!"
            price={checkoutPrice}
            contact={
              <Button mode="dark" size="s" iconRight="call" className="w-full">
                Boka samtal
              </Button>
            }
            image={
              <Image
                src={truckCounterbalance}
                alt="Elektrisk motviktstruck"
                fill
                sizes="(width >= 64rem) 60vw, 100vw"
                className="object-contain"
              />
            }
            stepsHeading="Vad händer nu?"
            steps={nextSteps}
          />
        </div>
      </Block>

      <Block id="footer" figma="9264:22371">
        <Footer
          groups={footerGroups}
          contact={{
            heading: "Kontakt",
            email: { address: "info@milevas.se" },
            phone: { number: "08-123 45 67" },
            location: "Stockholm, Sverige",
          }}
          copyright="Milevas AB. Alla rättigheter förbehållna."
        />
      </Block>
    </KitchensinkPage>
  );
}
