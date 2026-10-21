import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox } from "@/components/ui/configurator-box";
import { PriceBox } from "@/components/ui/price-box";
import { ProductCard } from "@/components/ui/product-card";
import { TextBox } from "@/components/ui/text-box";
import { TruckColumn } from "@/components/ui/truck-column";
import truckCounterbalance from "../assets/truck-counterbalance.png";
import truckPallet from "../assets/truck-pallet.png";
import warehouse from "../assets/warehouse.jpg";
import { Example, Group, KitchensinkPage, Section } from "../ui";

/** Composed components from Figma "02 — Components", with placeholder content. */
export const metadata: Metadata = { title: "Kitchensink: Komponenter" };

/** configurator-box variants shown, in Figma frame 9's order. */
const configuratorBoxes = [
  { choices: 2, layout: "grid", textSize: "s" },
  { choices: 2, layout: "grid", textSize: "m" },
  { choices: 6, layout: "grid", textSize: "s" },
  { choices: 4, layout: "grid", textSize: "s" },
  { choices: 2, layout: "stack", textSize: "s" },
  { choices: 4, layout: "stack", textSize: "m" },
  { choices: 2, layout: "stack", textSize: "s", image: true },
  { choices: 4, layout: "grid", textSize: "s", image: true },
] as const;

const priceRows = [
  { label: "Leasing (48 mån)", value: "3 261 kr/mån" },
  { label: "Långtidshyra (48 mån)", value: "3 261 kr/mån" },
];

const draftBlabla =
  'Figma-ramen "blabla" på "02 — Components" är inte klar, så komponenten kan ändras.';

export default function ComponentsPage() {
  return (
    <KitchensinkPage href="/kitchensink/components">
      <Group title="Komponenter" figma="02 — Components">
        <Section
          id="product-card"
          figma="8268:2970"
          api="<ProductCard href brand category name specs price leasing image>"
          description={
            <>
              Under Desktop S syns pilen och priserna alltid (Figmas läge &quot;tablet&quot;), från
              Desktop S vid hover.
            </>
          }
        >
          <div className="card-grid-3">
            {(
              [
                { variant: "default", label: "Default (hovra för hover)" },
                { variant: "hover", label: 'Hover (data-state="hover")' },
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
                  price={variant === "utan pris" ? undefined : "169 000 kr"}
                  leasing={variant === "utan pris" ? undefined : "3 326 kr"}
                  data-state={variant === "hover" ? "hover" : undefined}
                  image={
                    <Image
                      src={truckCounterbalance}
                      alt="Elektrisk motviktstruck"
                      fill
                      sizes="(width >= 64rem) 25vw, 50vw"
                      className="object-contain"
                    />
                  }
                />
              </Example>
            ))}
          </div>
        </Section>

        <Section id="card" figma="8389:4461" api="<Card number label text image>">
          <Example label="Tre kort i card-grid-3">
            <div className="card-grid-3">
              {["Service", "Uthyrning", "Begagnat"].map((label, index) => (
                <Card
                  key={label}
                  number={String(index + 1).padStart(2, "0")}
                  label={label}
                  text="text"
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
          id="configurator-box"
          figma="8721:17422"
          api="<ConfiguratorBox number label layout>{<Choice>…}</ConfiguratorBox>"
          description="Från frame 9 (frame 6 är den gamla, urblekta versionen). Det andra valet i varje box visas som valt."
        >
          <div className="grid items-start gap-6 tablet:grid-cols-2">
            {configuratorBoxes.map((box, index) => (
              <Example
                key={`${box.layout}-${box.choices}-${box.textSize}-${"image" in box}`}
                label={`${box.choices} val · layout="${box.layout}" · text ${box.textSize.toUpperCase()}${"image" in box ? " · med bild" : ""}`}
              >
                <ConfiguratorBox
                  number={String(index + 1).padStart(2, "0")}
                  label="Label"
                  layout={box.layout}
                >
                  {Array.from({ length: box.choices }, (_, choice) => (
                    <Choice
                      key={choice}
                      title="Title"
                      price="€€€€"
                      text="Text"
                      textSize={box.textSize}
                      selected={choice === 1}
                      image={
                        "image" in box ? (
                          <Image
                            src={truckPallet}
                            alt=""
                            fill
                            sizes="12rem"
                            className="object-contain"
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </ConfiguratorBox>
              </Example>
            ))}
          </div>
        </Section>

        <Section
          id="price-box"
          figma="8389:7276"
          api="<PriceBox price rows delivery? action>"
          description="Från frame 6, den enda som har den. Den nyare Configurator-designen (frame 15) visar ett totalpris i stället; se Configurator på /kitchensink/blocks."
        >
          <div className="grid items-start gap-6 tablet:grid-cols-2">
            <Example label="Utan delivery">
              <PriceBox
                price="173 900 kr"
                rows={priceRows}
                action={
                  <Button size="m" className="w-full">
                    Label
                  </Button>
                }
              />
            </Example>
            <Example label="Med delivery">
              <PriceBox
                price="173 900 kr"
                rows={priceRows}
                delivery={{ label: "Uppskattad leverans", value: "4–6 veckor" }}
                action={
                  <Button size="m" className="w-full">
                    Label
                  </Button>
                }
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
          api="<TruckColumn href heading rows>"
          description={
            <>
              Kolumner över en bild. Från Desktop S syns innehållet vid hover eller fokus; under
              Desktop S är alla kolumner aktiva, eftersom Figma saknar beteende utan hover (eget
              beslut, som product-card). Hero-blocket (backlog 7, väntar på designen) bygger på dem.
            </>
          }
        >
          <Example label='Fyra kolumner; den andra visas aktiv med data-state="active", hovra över de andra'>
            <div className="relative overflow-hidden rounded-lg desktop-s:h-[28rem]">
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
                      data-state={index === 1 ? "active" : undefined}
                    />
                  ),
                )}
              </div>
            </div>
          </Example>
        </Section>
      </Group>
    </KitchensinkPage>
  );
}
