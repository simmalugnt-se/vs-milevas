import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Arrow, arrowNames } from "@/components/ui/arrow";
import {
  Button,
  type ButtonColor,
  ButtonLink,
  type ButtonSize,
  TextLink,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox } from "@/components/ui/configurator-box";
import { Icon, iconNames } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { PriceBox } from "@/components/ui/price-box";
import { ProductCard } from "@/components/ui/product-card";
import { TextBox } from "@/components/ui/text-box";
import { TruckColumn } from "@/components/ui/truck-column";
import { getAppEnv } from "@/utilities/environment";
import truckCounterbalance from "./assets/truck-counterbalance.png";
import truckPallet from "./assets/truck-pallet.png";
import warehouse from "./assets/warehouse.jpg";
import { type Mode, modes } from "./breakpoints";
import { ChoiceDemo } from "./choice-demo";
import { type ColorToken, colorGroups, gradientStops } from "./colors";
import { cardGrids, fromFigma, grid, radii } from "./grid";
import { sizes, sizesForMode, type TextStyle, textStyles } from "./typography";

/** Design-system reference built from Figma "01 — Foundations". Static, unlinked, not in production. */
export const metadata: Metadata = {
  title: "Kitchensink",
  robots: { index: false, follow: false },
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-6">
      <h2 id={id} className="text-3xl font-bold uppercase tracking-tight text-ui-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SwatchRow({
  swatch,
  name,
  token,
  className,
  value,
}: {
  swatch: React.ReactNode;
  name: string;
  token: string;
  className: string;
  value: string;
}) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] items-center gap-x-4 lg:grid-cols-[2.5rem_12rem_1fr_1fr_6rem]">
      {swatch}
      <span className="font-medium text-ui-primary">{name}</span>
      <code className="col-start-2 font-mono text-xs whitespace-pre text-ui-secondary lg:col-start-auto">
        {token}
      </code>
      <code className="col-start-2 font-mono text-xs whitespace-pre text-ui-secondary lg:col-start-auto">
        {className}
      </code>
      <code className="col-start-2 font-mono text-xs whitespace-pre uppercase text-ui-secondary lg:col-start-auto">
        {value}
      </code>
    </li>
  );
}

function ColorRow({ color }: { color: ColorToken }) {
  return (
    <SwatchRow
      swatch={
        <span
          aria-hidden
          className="size-10 border border-border-primary"
          style={{ backgroundColor: `var(${color.token})` }}
        />
      }
      {...color}
    />
  );
}

function GradientRow() {
  return (
    <SwatchRow
      swatch={<span aria-hidden className="size-10 border border-border-primary bg-gradient-inv" />}
      name="Gradient"
      token={gradientStops.map((stop) => stop.token).join("\n")}
      className="bg-gradient-inv"
      value={gradientStops.map((stop) => stop.value).join("\n")}
    />
  );
}

/** One row per text style, one cell per Figma mode; each cell pins `--sizes-*` to its mode. */
function TextStyleCells({ style }: { style: TextStyle }) {
  return modes.map((mode) => (
    <div
      key={mode.name}
      style={sizesForMode(mode.name)}
      className="space-y-3 border-t border-border-primary pt-4 pr-16 pb-12"
    >
      <p className={`${style.className} whitespace-nowrap text-ui-primary`}>{style.name}</p>
      <p className="font-mono text-xs text-ui-tertiary">
        {sizes[style.size][mode.name]}px · {style.weight} · {style.lineHeight}
      </p>
    </div>
  ));
}

function TextStyleSpec({ style }: { style: TextStyle }) {
  return (
    <li className="grid grid-cols-[8rem_1fr] gap-x-4 lg:grid-cols-[8rem_10rem_8rem_1fr]">
      <span className="font-medium text-ui-primary">{style.name}</span>
      <code className="font-mono text-xs text-ui-secondary">{style.className}</code>
      <code className="col-start-2 font-mono text-xs text-ui-secondary lg:col-start-auto">
        --font-{style.family}
      </code>
      <code className="col-start-2 font-mono text-xs text-ui-secondary lg:col-start-auto">
        --sizes-{style.size} · {style.weight} · lh {style.lineHeight}
        {style.letterSpacing ? ` · ${style.letterSpacing}em` : ""}
        {style.uppercase ? " · uppercase" : ""}
      </code>
    </li>
  );
}

const buttonColors: ButtonColor[] = ["primary", "inverted", "tejp", "gray"];
const buttonSizes: ButtonSize[] = ["s", "m"];
const buttonStates = ["default", "hover", "disabled"] as const;

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

const widest = modes[0].maxWidth;

/** Variants that target only this mode: from its own breakpoint up to the next wider one. */
const onlyThisMode = (index: number) => {
  const from = modes[index].variant;
  const below = modes[index - 1]?.variant;
  return [from && `${from}:`, below && `max-${below}:`].filter(Boolean).join("");
};
const percentOfWidest = (px: number) => `${(px / widest) * 100}%`;

/** Figma's breakpoint frame, scaled: the grey area runs to `width-min`, the open area on to `width-max`. */
function BreakpointBar({ mode }: { mode: Mode }) {
  return (
    <div className="flex h-24" style={{ width: percentOfWidest(mode.maxWidth) }}>
      <div
        className="flex shrink-0 items-start justify-between gap-2 border-r border-status-error bg-bg-fill p-2"
        style={{ width: `${(mode.minWidth / mode.maxWidth) * 100}%` }}
      >
        <span className="text-display-xs text-ui-primary">{mode.name}</span>
        <span className="text-text-s text-status-error">Min</span>
      </div>
      <div className="flex flex-1 justify-end border-r border-status-error bg-bg-fill/50 p-2">
        <span className="text-text-s text-status-error">Max</span>
      </div>
    </div>
  );
}

export default function KitchensinkPage() {
  if (getAppEnv() === "prod") notFound();

  return (
    <div className="w-full space-y-16 py-12">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ui-secondary">
          Milevas designsystem
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ui-primary">Kitchensink</h1>
      </header>

      <Section id="colors" title="Color styles">
        <div className="space-y-8 bg-bg-fill p-4 sm:p-6">
          {colorGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="font-bold uppercase text-ui-primary">{group.title}</h3>
              <ul className="space-y-2 text-sm">
                {group.colors.map((color) => (
                  <ColorRow key={color.token} color={color} />
                ))}
                {group.title === "Background" && <GradientRow />}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="typography" title="Text styles">
        {/* TODO(clash-grotesk): remove this notice when the font is loaded in the layout. */}
        <p className="border-l-4 border-status-warning bg-bg-fill px-4 py-3 text-sm text-ui-primary">
          Platshållare: Clash Grotesk Variable saknas än, så Display och Text visas i Geist.
          Storlek, vikt och radavstånd följer Figma.
        </p>
        <ul className="space-y-2 text-sm">
          {textStyles.map((style) => (
            <TextStyleSpec key={style.className} style={style} />
          ))}
        </ul>
        <div className="overflow-x-auto">
          <div className="grid w-max min-w-full grid-cols-[repeat(4,max-content)]">
            {modes.map((mode) => (
              <p key={mode.name} className="pt-4 pr-16 pb-12 text-text-m text-ui-tertiary">
                {mode.name}
                {` (≥ ${mode.minWidth}px)`}
              </p>
            ))}
            {textStyles.map((style) => (
              <TextStyleCells key={style.className} style={style} />
            ))}
          </div>
        </div>
      </Section>

      <Section id="breakpoints" title="Breakpoints">
        <p className="text-text-m text-ui-secondary">
          Aktuell brytpunkt:{" "}
          <strong className="text-ui-primary">
            <span className="tablet:hidden">Mobile</span>
            <span className="hidden tablet:inline desktop-s:hidden">Tablet</span>
            <span className="hidden desktop-s:inline desktop-l:hidden">Desktop S</span>
            <span className="hidden desktop-l:inline">Desktop L</span>
          </strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-ui-tertiary">
              <tr>
                <th className="py-2 pr-4 font-medium">Läge</th>
                <th className="py-2 pr-4 font-medium">Variant</th>
                <th className="py-2 pr-4 font-medium">Bara detta läge</th>
                <th className="py-2 pr-4 font-medium">width-min</th>
                <th className="py-2 pr-4 font-medium">width-max</th>
                <th className="py-2 font-medium">width-design</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-ui-secondary">
              {modes.map((mode, index) => (
                <tr key={mode.name} className="border-t border-border-primary">
                  <td className="py-2 pr-4 font-sans text-sm font-medium text-ui-primary">
                    {mode.name}
                  </td>
                  <td className="py-2 pr-4">{mode.variant ? `${mode.variant}:` : "(bas)"}</td>
                  <td className="py-2 pr-4">{onlyThisMode(index)}</td>
                  <td className="py-2 pr-4">{mode.minWidth}px</td>
                  <td className="py-2 pr-4">{mode.maxWidth}px</td>
                  <td className="py-2">{mode.designWidth}px</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          {modes.map((mode) => (
            <BreakpointBar key={mode.name} mode={mode} />
          ))}
        </div>
      </Section>

      <Section id="grids" title="Grids">
        {/*
          Own decision, not in Figma (2026-10-02): the Grids frame only shows Desktop L. Desktop S has
          the same 12 columns, so it follows the frame; Tablet (2 per row) and Mobile (1 per row) were
          decided by us. Update `card-grid-*` in site-theme.css and `cardGrids` in grid.ts if Figma
          gets frames for them.
        */}
        <p className="border-l-4 border-status-info bg-bg-fill px-4 py-3 text-sm text-ui-primary">
          <strong>Eget beslut, framgår inte i Figma (2026-10-02):</strong> Figma visar card grid
          bara för Desktop L. Desktop S har också 12 kolumner och följer samma uppdelning. På Tablet
          visas 2 kort per rad och på Mobile 1, för alla tre varianterna.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-ui-tertiary">
              <tr>
                <th className="py-2 pr-4 font-medium" />
                {modes.map((mode) => (
                  <th key={mode.name} className="py-2 pr-4 font-medium">
                    {mode.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-ui-secondary">
              {(["columns", "margin", "gap"] as const).map((key) => (
                <tr key={key} className="border-t border-border-primary">
                  <td className="py-2 pr-4">--grid-{key}</td>
                  {modes.map((mode) => (
                    <td key={mode.name} className="py-2 pr-4">
                      {grid[key][mode.name]}
                      {key === "columns" ? "" : "px"}
                    </td>
                  ))}
                </tr>
              ))}
              {cardGrids.map((cardGrid) => (
                <tr key={cardGrid.className} className="border-t border-border-primary">
                  <td className="py-2 pr-4">{cardGrid.className}</td>
                  {modes.map((mode) => (
                    <td key={mode.name} className="py-2 pr-4">
                      {cardGrid.perRow[mode.name]} per rad
                      {fromFigma[mode.name] ? "" : " (eget beslut)"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border-primary">
                <td className="py-2 pr-4">rounded-sm / rounded-lg</td>
                <td className="py-2 pr-4" colSpan={modes.length}>
                  {radii.sm}px / {radii.lg}px
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold uppercase text-ui-primary">
            grid-layout <span className="text-ui-tertiary">(aktuellt antal kolumner)</span>
          </h3>
          <div className="grid-layout bg-bg-inv-fill py-2">
            {Array.from({ length: grid.columns["Desktop L"] }, (_, index) => (
              <div
                key={index}
                className={`rounded-sm bg-bg-surface py-3 text-center text-text-s text-ui-primary ${
                  index >= grid.columns.Mobile ? "max-desktop-s:hidden" : ""
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-bg-inv-fill px-(--grid-margin) py-2">
          {cardGrids.map((cardGrid) => (
            <div key={cardGrid.className} className="space-y-2">
              <p className="flex gap-8 text-display-s">
                <span className="text-ui-inv-primary">Card grid</span>
                <span className="text-ui-tertiary">{cardGrid.name}</span>
              </p>
              <div className={cardGrid.className}>
                {Array.from({ length: cardGrid.perRow["Desktop L"] }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-bg-surface"
                    style={{ height: cardGrid.slotHeight }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="logos" title="Logos">
        <div className="grid gap-2 tablet:grid-cols-2">
          <div className="flex flex-wrap items-center gap-8 bg-bg-surface p-8 text-ui-primary">
            <Logo className="h-10 w-auto" />
            <Logo variant="symbol" className="size-10" title="" />
          </div>
          <div className="flex flex-wrap items-center gap-8 bg-bg-inv-fill p-8 text-ui-inv-primary">
            <Logo className="h-10 w-auto" />
            <Logo variant="symbol" className="size-10" title="" />
          </div>
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {"<Logo />"} · {'<Logo variant="symbol" />'} · färg från text-*, storlek med h-*/w-auto
        </p>
      </Section>

      <Section id="icons" title="Icons">
        <ul className="grid grid-cols-2 gap-2 tablet:grid-cols-4 desktop-s:grid-cols-6">
          {iconNames.map((name) => (
            <li key={name} className="flex items-center gap-3 bg-bg-fill p-3">
              <span className="flex size-12 items-center justify-center bg-bg-surface text-ui-primary">
                <Icon name={name} />
              </span>
              <code className="font-mono text-xs text-ui-secondary">{name}</code>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4 bg-bg-inv-fill p-4 text-ui-inv-primary">
          {iconNames.map((name) => (
            <Icon key={name} name={name} />
          ))}
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {'<Icon name="plus" />'} · 16px (arrow-* 12px) · {'title="…"'} ger ett tillgängligt namn
        </p>
      </Section>

      <Section id="arrows" title="Arrows">
        <ul className="flex flex-wrap gap-4">
          {arrowNames.map((name) => (
            <li key={name} className="space-y-2">
              <span className="flex size-28 items-center justify-center bg-bg-surface text-ui-primary">
                <Arrow name={name} />
              </span>
              <code className="block font-mono text-xs text-ui-secondary">{name}</code>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-ui-secondary">{'<Arrow name="round" />'} · 64px</p>
      </Section>

      <Section id="buttons" title="Buttons">
        <p className="text-sm text-ui-secondary">
          Hover-kolumnen visas med{" "}
          <code className="font-mono text-xs">data-state=&quot;hover&quot;</code>; håll pekaren över
          en knapp i Default-kolumnen för den riktiga övergången. Den grå bakgrunden finns bara här
          så att alla fyra färgerna syns (Figma visar dem på lila).
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-[36rem] bg-ui-tertiary text-left">
            <thead className="text-xs text-ui-primary">
              <tr>
                <th className="p-4 font-medium" />
                {buttonStates.map((state) => (
                  <th key={state} className="p-4 font-medium">
                    {state}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buttonSizes.flatMap((size) =>
                buttonColors.map((color) => (
                  <tr key={`${size}-${color}`}>
                    <th className="p-4 text-left font-mono text-xs font-normal text-ui-primary">
                      {color} · {size.toUpperCase()}
                    </th>
                    {buttonStates.map((state) => (
                      <td key={state} className="p-4">
                        <Button
                          color={color}
                          size={size}
                          disabled={state === "disabled"}
                          data-state={state === "hover" ? "hover" : undefined}
                        >
                          Label
                        </Button>
                      </td>
                    ))}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button iconLeft="arrow-left" iconRight={null}>
            Tillbaka
          </Button>
          <Button color="tejp" size="m" iconRight="download">
            Ladda ner
          </Button>
          <ButtonLink href="/kitchensink#buttons" color="gray">
            Länk som knapp
          </ButtonLink>
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {'<Button color="primary|inverted|tejp|gray" size="s|m" iconLeft iconRight>'} ·{" "}
          {"<ButtonLink href>"} · iconRight är arrow-right som standard
        </p>
      </Section>

      <Section id="links" title="Link">
        <div className="flex flex-wrap items-center gap-8">
          <TextLink href="/kitchensink#links">Label</TextLink>
          <TextLink href="/kitchensink#links" data-state="hover">
            Label
          </TextLink>
          <TextLink href="/kitchensink#links" icon={null}>
            Utan ikon
          </TextLink>
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {"<TextLink href>"} · Default, hover (data-state), utan ikon
        </p>
      </Section>

      <Section id="choice" title="Choice">
        <div className="overflow-x-auto">
          <table className="min-w-[48rem] text-left">
            <thead className="text-xs text-ui-tertiary">
              <tr>
                <th className="w-40 p-2 font-medium" />
                <th className="p-2 font-medium">default</th>
                <th className="p-2 font-medium">selected</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  { label: "text S", textSize: "s", borderRight: false },
                  { label: "text M", textSize: "m", borderRight: false },
                  { label: "text S · border-right", textSize: "s", borderRight: true },
                  { label: "text M · border-right", textSize: "m", borderRight: true },
                  { label: "image · text S", textSize: "s", borderRight: false, image: true },
                ] as const
              ).map((variant) => (
                <tr key={variant.label}>
                  <th className="p-2 align-top font-mono text-xs font-normal text-ui-secondary">
                    {variant.label}
                  </th>
                  {[false, true].map((selected) => (
                    <td key={String(selected)} className="w-[368px] p-2 align-top">
                      <Choice
                        title="Title"
                        price="€€€€"
                        text="Text"
                        textSize={variant.textSize}
                        borderRight={variant.borderRight}
                        selected={selected}
                        image={
                          "image" in variant ? (
                            <Image
                              src={truckPallet}
                              alt=""
                              fill
                              sizes="16rem"
                              className="object-contain"
                            />
                          ) : undefined
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="font-bold uppercase text-ui-primary">Klickbar</h3>
        <ChoiceDemo />
        <p className="font-mono text-xs text-ui-secondary">
          {"<Choice title price text textSize selected borderRight image>"} · en button med
          aria-pressed
        </p>
      </Section>

      <Section id="cards" title="Cards">
        <p className="text-sm text-ui-secondary">
          product-card: under Desktop S syns pilen och priserna alltid (Figmas läge
          &quot;tablet&quot;), från Desktop S vid hover. Mittenkortet visas med
          data-state=&quot;hover&quot;.
        </p>
        <div className="card-grid-3">
          {(["default", "hover", "utan pris"] as const).map((variant) => (
            <ProductCard
              key={variant}
              href="/kitchensink#cards"
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
          ))}
        </div>
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
        <p className="font-mono text-xs text-ui-secondary">
          {"<ProductCard href brand category name specs price leasing image>"} ·{" "}
          {"<Card number label text image>"}
        </p>
      </Section>

      <Section id="configurator" title="Configurator">
        <p className="text-sm text-ui-secondary">
          configurator-box från frame 9 (frame 6 är den gamla, urblekta versionen) och price-box
          från frame 6, som är den enda som har den. Det andra valet i varje box visas som valt.
        </p>
        <div className="grid items-start gap-4 tablet:grid-cols-2">
          {configuratorBoxes.map((box, index) => (
            <div
              key={`${box.layout}-${box.choices}-${box.textSize}-${"image" in box}`}
              className="space-y-2"
            >
              <p className="font-mono text-xs text-ui-secondary">
                {box.choices} val · {box.layout} · text {box.textSize.toUpperCase()}
                {"image" in box ? " · bild" : ""}
              </p>
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
            </div>
          ))}
        </div>
        <div className="grid items-start gap-4 tablet:grid-cols-2">
          <PriceBox
            price="173 900 kr"
            rows={priceRows}
            action={
              <Button size="m" className="w-full">
                Label
              </Button>
            }
          />
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
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {"<ConfiguratorBox number label layout>{<Choice>…}</ConfiguratorBox>"} ·{" "}
          {"<PriceBox price rows delivery action>"}
        </p>
      </Section>

      <Section id="blabla" title="Text box & truck column">
        <div className="grid gap-4 tablet:grid-cols-2">
          <TextBox heading="Heading" label="Label" text="Text" />
          <TextBox heading="Heading" label="Label" text="Text" border={false} />
        </div>
        <p className="text-sm text-ui-secondary">
          truck-column över en bild: från Desktop S syns innehållet vid hover eller fokus (den andra
          kolumnen visas med data-state=&quot;active&quot;). Under Desktop S är alla kolumner
          aktiva, eftersom Figma saknar beteende utan hover (eget beslut, som product-card).
        </p>
        <div className="relative overflow-hidden rounded-lg desktop-s:h-[28rem]">
          <Image src={warehouse} alt="" fill sizes="100vw" className="object-cover" />
          <div className="relative grid h-full grid-cols-1 tablet:grid-cols-2 desktop-s:grid-cols-4">
            {["Motviktstruckar", "Ledstaplare", "Låglyftare", "Höglyftare"].map((name, index) => (
              <TruckColumn
                key={name}
                href="/kitchensink#blabla"
                aria-label={`Bygg din truck: ${name}`}
                heading="Bygg din truck:"
                rows={[
                  { label: "Från", value: "169 000 kr" },
                  { label: "Leasing från:", value: "3 326 kr/mån" },
                ]}
                data-state={index === 1 ? "active" : undefined}
              />
            ))}
          </div>
        </div>
        <p className="font-mono text-xs text-ui-secondary">
          {"<TextBox heading label text border>"} · {"<TruckColumn href heading rows>"}
        </p>
      </Section>
    </div>
  );
}
