import type { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Choice } from "@/components/ui/choice";
import { ColorImageCard } from "@/components/ui/color-image-card";
import { ConfiguratorBox } from "@/components/ui/configurator-box";
import { ConfiguratorTopbar } from "@/components/ui/configurator-topbar";
import { FinancingChoice } from "@/components/ui/financing-choice";
import { PriceBox } from "@/components/ui/price-box";
import { ProductCard } from "@/components/ui/product-card";
import { TextBox } from "@/components/ui/text-box";
import { TruckColumn } from "@/components/ui/truck-column";
import { TruckInfo } from "@/components/ui/truck-info";
import truckPallet from "../assets/truck-pallet.png";
import truckProductCard from "../assets/truck-product-card.png";
import warehouse from "../assets/warehouse.jpg";
import { ChoiceDemo, FinancingChoiceDemo } from "../choice-demo";
import { ContactFormDemo } from "../contact-form-demo";
import { Example, Group, KitchensinkPage, Section } from "../ui";

/** Composed components from Figma "02 — Components", with placeholder content. */
export const metadata: Metadata = { title: "Kitchensink: Komponenter" };

/** The truck in choice, cropped as Figma crops it in its 489:365 box. */
const choiceImage = (
  <span className="absolute inset-0 overflow-hidden">
    <Image
      src={truckPallet}
      alt=""
      sizes="15rem"
      className="absolute top-[-14.04%] left-[9.65%] h-[119.85%] w-[89.46%] max-w-none"
    />
  </span>
);

/** The Financiering choices Figma draws: Financiering with and without `bottom`, Financiering-02. */
const financingExamples = (["Financiering", "Financiering-02"] as const).flatMap((type) =>
  (type === "Financiering" ? [false, true] : [false]).flatMap((bottom) =>
    (["Default", "active", "hover"] as const).map((state) => ({ type, state, bottom })),
  ),
);

/** configurator-box's Standard variants, in Figma's order. */
const configuratorBoxes = (["grid", "stack"] as const).flatMap((layout) =>
  [2, 4, 6].map((choices) => ({ layout, choices })),
);

const draftBlabla =
  'Figma-ramen "blabla" på "02 — Components" är inte klar, så komponenten kan ändras.';

export default function ComponentsPage() {
  return (
    <KitchensinkPage href="/kitchensink/components">
      <Group title="Komponenter" figma="02 — Components">
        <Section
          id="product-card"
          figma="8268:2970"
          api="<ProductCard href brand category name specs price leasing image info? loggedIn? data-state?> · <TruckInfo text>"
          description={
            <>
              Desktop (från Desktop S): Default, och Hover med pil och priser. Tablet: pil och
              priser alltid. Mobile: Default, och Active (data-state=&quot;active&quot;) med pil och
              priser; Active syns bara under Tablet. Korten visas i Figmas bredd (430px). Ändra
              fönstrets bredd för de andra lägena.
            </>
          }
        >
          <div className="grid grid-cols-[repeat(auto-fill,26.875rem)] gap-(--grid-gap)">
            {(
              [
                { variant: "default", label: "Default (hovra för hover på Desktop)" },
                { variant: "hover", label: 'Hover (data-state="hover")' },
                { variant: "logged-in", label: 'loggedIn, data-state="hover" (hover-INLOGGAD)' },
                { variant: "active", label: 'data-state="active" (Mobile Active)' },
                { variant: "utan pris", label: "Utan price och leasing" },
              ] as const
            ).map(({ variant, label }) => (
              <Example key={variant} label={label}>
                <ProductCard
                  href="/kitchensink/components#product-card"
                  brand="Baoli"
                  category="Modeller"
                  name="Elektriska motviktstruckar"
                  specs={["1.5 – 3.5 ton", "80 V 228 Ah"]}
                  price={variant === "utan pris" ? undefined : "144 000 kr"}
                  leasing={
                    variant === "utan pris"
                      ? undefined
                      : variant === "logged-in"
                        ? "144 000 kr"
                        : "3 326 kr"
                  }
                  loggedIn={variant === "logged-in"}
                  info="Lyftkapacitet, power och höjd"
                  data-state={
                    variant === "hover" || variant === "logged-in"
                      ? "hover"
                      : variant === "active"
                        ? "active"
                        : undefined
                  }
                  image={
                    <Image
                      src={truckProductCard}
                      alt="Elektrisk motviktstruck"
                      fill
                      sizes="27rem"
                      className="object-cover"
                    />
                  }
                />
              </Example>
            ))}
          </div>
          <Example label="<TruckInfo> klickad (truckinfo, Figma 8268:2927)">
            <div className="flex justify-end bg-bg-fill p-(--spacing-sm) pt-(--spacing-4xl)">
              <TruckInfo text="Lyftkapacitet, power och höjd" defaultOpen />
            </div>
          </Example>
        </Section>

        <Section id="card" figma="8389:4461" api="<Card number label text paragraph? image>">
          <Example label="Tre kort i card-grid-3; det tredje med paragraph">
            <div className="card-grid-3">
              {["Service", "Uthyrning", "Begagnat"].map((label, index) => (
                <Card
                  key={label}
                  number={String(index + 1).padStart(2, "0")}
                  label={label}
                  text="text"
                  paragraph={index === 2 ? "text" : undefined}
                  image={
                    <Image
                      src={warehouse}
                      alt=""
                      fill
                      sizes="(width >= 64rem) 33vw, 100vw"
                      className="object-cover"
                    />
                  }
                />
              ))}
            </div>
          </Example>
        </Section>

        <Section
          id="color-image-card"
          figma="8825:10793"
          api='<ColorImageCard color="white|tejp|gray" static? number label heading text image>'
          description="I Figmas bredd (518,67px). Hovra över White och Tejp för bildläget; gray har inget hover-läge i Figma."
        >
          <div className="grid grid-cols-[repeat(auto-fill,32.4167rem)] gap-(--grid-gap)">
            {(
              [
                { label: 'color="white"', color: "white" },
                { label: 'color="tejp"', color: "tejp" },
                { label: 'color="gray"', color: "gray" },
                { label: 'color="white", data-state="hover"', color: "white", hover: true },
                { label: "static", color: "white", isStatic: true },
                { label: 'color="tejp", data-state="hover"', color: "tejp", hover: true },
              ] as const
            ).map((card) => (
              <Example key={card.label} label={card.label}>
                <ColorImageCard
                  color={card.color}
                  static={"isStatic" in card}
                  data-state={"hover" in card ? "hover" : undefined}
                  number="01"
                  label="Lager, leverans och service"
                  heading="Över 1 000 truckar på lager"
                  text="Baoli EMEA driver ett centralt produktlager i Italien med över 1 000 truckar redo för leverans."
                  image={
                    <Image
                      src={warehouse}
                      alt=""
                      fill
                      sizes="(width >= 64rem) 33vw, 100vw"
                      className="object-cover"
                    />
                  }
                />
              </Example>
            ))}
          </div>
        </Section>

        <Section
          id="configurator-topbar"
          figma="9207:32131"
          api="<ConfiguratorTopbar number label>"
          description="Huvudet på ett steg i konfiguratorn, i Figmas bredd (325px)."
        >
          <div className="grid grid-cols-[repeat(auto-fill,20.3125rem)] items-start gap-6">
            <Example label="Default">
              <ConfiguratorTopbar number="01" label="Label" />
            </Example>
          </div>
        </Section>

        <Section
          id="choice"
          figma="9207:30462"
          api='<Choice title price? text? textSize="s|m" selected? bottom? image? imageSize?> · <FinancingChoice title price? selected? bottom? onSelect? term? residual?>'
          description='En button med aria-pressed, i Figmas bredd (368px). data-state="hover" visar hover utan pekare.'
        >
          <div className="grid grid-cols-[repeat(auto-fill,23rem)] items-start gap-6">
            {(["s", "m"] as const).flatMap((textSize) =>
              [false, true].flatMap((bottom) =>
                (["Default", "active", "hover"] as const).map((state) => (
                  <Example
                    key={`${textSize}-${bottom}-${state}`}
                    label={`text ${textSize.toUpperCase()} · ${state}${bottom ? " · bottom" : ""}`}
                  >
                    <Choice
                      title="Title"
                      price="€€€€"
                      text="Text"
                      textSize={textSize}
                      bottom={bottom}
                      selected={state === "active"}
                      data-state={state === "hover" ? "hover" : undefined}
                    />
                  </Example>
                )),
              ),
            )}
            {(["big", "small"] as const).flatMap((imageSize) =>
              [false, true].flatMap((bottom) =>
                (["Default", "active", "hover"] as const).map((state) => (
                  <Example
                    key={`${imageSize}-${bottom}-${state}`}
                    label={`image ${imageSize} · ${state}${bottom ? " · bottom" : ""}`}
                  >
                    <Choice
                      title="Title"
                      price="€€€€"
                      text="Text"
                      image={choiceImage}
                      imageSize={imageSize}
                      bottom={bottom}
                      selected={state === "active"}
                      data-state={state === "hover" ? "hover" : undefined}
                    />
                  </Example>
                )),
              ),
            )}
            {financingExamples.map(({ type, state, bottom }) => (
              <Example
                key={`${type}-${state}-${bottom}`}
                label={`${type} · ${state}${bottom ? " · bottom" : ""}`}
              >
                <FinancingChoice
                  title="Title"
                  price="€€€€"
                  bottom={bottom}
                  selected={state === "active"}
                  data-state={state === "hover" ? "hover" : undefined}
                  term={
                    type === "Financiering"
                      ? { label: "Avtalslängd", steps: [24, 36, 48, 60, 72, 84], value: 60 }
                      : undefined
                  }
                  residual={
                    type === "Financiering" ? { label: "Restvärde", value: "10%" } : undefined
                  }
                />
              </Example>
            ))}
          </div>
          <Example label="Klickbar: välj ett alternativ">
            <ChoiceDemo />
          </Example>
          <Example label="Klickbar: finansiering och avtalslängd">
            <FinancingChoiceDemo />
          </Example>
        </Section>

        <Section
          id="configurator-box"
          figma="9250:32719"
          api='<ConfiguratorBox number label layout="grid|stack" mobileLayout?>{<Choice>…}</ConfiguratorBox>'
          description="Figmas Standard-varianter i Figmas bredd (469px)."
        >
          <div className="grid grid-cols-[repeat(auto-fill,29.3125rem)] items-start gap-6">
            {configuratorBoxes.map((box) => (
              <Example
                key={`${box.layout}-${box.choices}`}
                label={`layout="${box.layout}" · ${box.choices} val`}
              >
                <ConfiguratorBox number="01" label="Label" layout={box.layout}>
                  {Array.from({ length: box.choices }, (_, choice) => (
                    <Choice key={choice} title="Title" price="€€€€" text="Text" />
                  ))}
                </ConfiguratorBox>
              </Example>
            ))}
          </div>
        </Section>

        <Section
          id="price-box"
          figma="9207:25676"
          api='<PriceBox variant="configurator|checkout" totalLabel total rows note?>'
          description="Med Figmas texter, i Figmas bredd (283px)."
        >
          <div className="grid grid-cols-[repeat(auto-fill,17.6875rem)] items-start gap-6">
            <Example label='variant="configurator"'>
              <PriceBox
                totalLabel="Totalpris"
                total="205 400 kr"
                rows={[
                  { label: "Leasing (48mån)", value: "3 561kr/mån" },
                  { label: "Långtidshyra", value: "3250 kr/mån" },
                ]}
              />
            </Example>
            <Example label='variant="checkout"'>
              <PriceBox
                variant="checkout"
                totalLabel="Totalpris"
                total="205 400 kr"
                rows={[
                  { label: "Leasing (48mån)", value: "3 561kr/mån" },
                  { label: "Uppskattad leverans", value: "4–6 veckor" },
                ]}
                note={{
                  label: "Garanti",
                  value: "4 år",
                  text: "Omfattar fabrikationsfel på drivlina, elsystem och chassi. Slitdelar och handhavandefel ingår inte.",
                }}
              />
            </Example>
          </div>
        </Section>

        <Section
          id="text-box"
          figma="8502:6114"
          api="<TextBox heading label text border?>"
          draft={draftBlabla}
        >
          <div className="grid gap-6 tablet:grid-cols-2">
            <Example label="Med linje (standard)">
              <TextBox heading="Heading" label="Label" text="Text" />
            </Example>
            <Example label="border={false}">
              <TextBox heading="Heading" label="Label" text="Text" border={false} />
            </Example>
          </div>
        </Section>

        <Section
          id="truck-column"
          figma="8539:7382"
          draft={draftBlabla}
          api="<TruckColumn href heading rows scrollLabel?>"
          description={
            <>
              Kolumner över en bild, i Figmas proportion (287 × 727 per kolumn). Från Desktop S syns
              innehållet vid hover; under Desktop S är alla kolumner aktiva (beslut 2026-10-02).
              Hero-blocket bygger på dem.
            </>
          }
        >
          <Example label='Fyra kolumner: den andra aktiv (data-state="active"), den tredje aktiv med scrollLabel; hovra över de andra'>
            <div className="relative overflow-hidden rounded-lg desktop-s:aspect-[1148/727]">
              <Image src={warehouse} alt="" fill sizes="100vw" className="object-cover" />
              <div className="relative grid h-full grid-cols-1 tablet:grid-cols-2 desktop-s:grid-cols-4">
                {["Motviktstruckar", "Ledstaplare", "Låglyftare", "Höglyftare"].map(
                  (name, index) => (
                    <TruckColumn
                      key={name}
                      href="/kitchensink/components#truck-column"
                      aria-label={`Bygg din truck: ${name}`}
                      heading="Bygg din truck:"
                      rows={[
                        { label: "Från", value: "169 000 kr" },
                        { label: "Leasing från:", value: "3 326 kr/mån" },
                      ]}
                      scrollLabel={index === 2 ? "Skrolla" : undefined}
                      data-state={index === 1 || index === 2 ? "active" : undefined}
                    />
                  ),
                )}
              </div>
            </div>
          </Example>
        </Section>

        <Section
          id="contact-form"
          figma="9309:27343"
          api='<ContactForm type="order|call|contact" heading text submit onClose>{fält}</ContactForm>'
          description="Med Figmas texter och platshållare. Desktop från Tablet, Mobile under; ändra fönstrets bredd för Mobile. Panelerna visas i Figmas bredd."
        >
          <Example label='type="order"' className="max-w-[51rem]">
            <div className="bg-(--primitive-neutral-400-100) p-(--spacing-sm)">
              <ContactFormDemo type="order" />
            </div>
          </Example>
          <Example label='type="call"' className="max-w-[51rem]">
            <div className="bg-(--primitive-neutral-400-100) p-(--spacing-sm)">
              <ContactFormDemo type="call" />
            </div>
          </Example>
          <Example label='type="contact", i en Dark-sektion' className="max-w-[43.75rem]">
            <div className="mode-dark bg-bg-fill p-(--spacing-sm)">
              <ContactFormDemo type="contact" />
            </div>
          </Example>
        </Section>
      </Group>
    </KitchensinkPage>
  );
}
