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
import { Link } from "@/i18n/navigation";
import { getAppEnv } from "@/utilities/environment";
import truckCounterbalance from "./assets/truck-counterbalance.png";
import truckPallet from "./assets/truck-pallet.png";
import warehouse from "./assets/warehouse.jpg";
import { type Mode, modes } from "./breakpoints";
import { ChoiceDemo } from "./choice-demo";
import { type ColorToken, colorGroups, gradientStops } from "./colors";
import { cardGrids, fromFigma, grid, radii } from "./grid";
import { sizes, sizesForMode, type TextStyle, textStyles } from "./typography";

/**
 * Design-system reference built from Figma "01 — Foundations" and "02 — Components", one section
 * per token group or component. Blocks are on /kitchensink/blocks. Static, unlinked, not in
 * production.
 */
export const metadata: Metadata = {
  title: "Kitchensink",
  robots: { index: false, follow: false },
};

/** The page's parts, in order: Figma's pages, then one entry per section. */
const contents = [
  {
    id: "foundations",
    title: "01 — Foundations",
    sections: [
      { id: "colors", title: "Color styles" },
      { id: "typography", title: "Text styles" },
      { id: "breakpoints", title: "Breakpoints" },
      { id: "grids", title: "Grids" },
    ],
  },
  {
    id: "components",
    title: "02 — Components",
    sections: [
      { id: "logos", title: "Logos" },
      { id: "icons", title: "Icons" },
      { id: "arrows", title: "Arrows" },
      { id: "buttons", title: "Button" },
      { id: "links", title: "Link" },
      { id: "choice", title: "Choice" },
      { id: "product-card", title: "Product card" },
      { id: "card", title: "Card" },
      { id: "configurator-box", title: "Configurator box" },
      { id: "price-box", title: "Price box" },
      { id: "text-box", title: "Text box" },
      { id: "truck-column", title: "Truck column" },
    ],
  },
] as const;

type SectionId = (typeof contents)[number]["sections"][number]["id"];
type GroupId = (typeof contents)[number]["id"];

const sections: readonly { id: SectionId; title: string }[] = contents.flatMap(
  (group): readonly { id: SectionId; title: string }[] => group.sections,
);
const sectionTitle = (id: SectionId) => sections.find((section) => section.id === id)?.title ?? id;

/** One of Figma's pages: a heading the sections below belong to. */
function Group({ id, children }: { id: GroupId; children: React.ReactNode }) {
  const group = contents.find((candidate) => candidate.id === id);
  return (
    <div className="space-y-16">
      <h2 id={id} className="border-b border-border-secondary pb-4 text-display-m text-ui-primary">
        {group?.title}
      </h2>
      {children}
    </div>
  );
}

/**
 * One token group or component. `figma` is the node it is built from and `api` the component's
 * props, both shown under the title. `draft` marks a component whose Figma frame is not finished.
 */
function Section({
  id,
  figma,
  api,
  description,
  draft,
  children,
}: {
  id: SectionId;
  figma?: string;
  api?: string;
  description?: React.ReactNode;
  /** Why the component is a draft; shown as a notice under the title. */
  draft?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-8 space-y-6">
      <div className="space-y-2">
        <h3
          id={id}
          className="flex flex-wrap items-baseline gap-x-4 text-display-s text-ui-primary"
        >
          {sectionTitle(id)}
          {draft ? <span className="text-label-s text-status-warning">Utkast</span> : null}
        </h3>
        {figma || api ? (
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ui-tertiary">
            {figma ? <span>Figma {figma}</span> : null}
            {api ? <code className="text-ui-secondary">{api}</code> : null}
          </p>
        ) : null}
        {draft ? (
          <p className="max-w-prose border-l-4 border-status-warning bg-bg-fill px-4 py-3 text-sm text-ui-primary">
            {draft}
          </p>
        ) : null}
        {description ? (
          <div className="max-w-prose text-sm text-ui-secondary">{description}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** One variant with a label above it, so every example says what it shows. */
function Example({
  label,
  className,
  children,
}: {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`min-w-0 space-y-2 ${className ?? ""}`}>
      <figcaption className="font-mono text-xs text-ui-secondary">{label}</figcaption>
      {children}
    </figure>
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

const draftBlabla =
  'Figma-ramen "blabla" på "02 — Components" är inte klar, så komponenten kan ändras.';

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
    <div className="w-full space-y-24 py-12">
      <header className="space-y-6">
        <div className="space-y-2">
          <p className="text-label-s text-ui-secondary">Milevas designsystem</p>
          <h1 className="text-display-l text-ui-primary">Kitchensink</h1>
          <p className="max-w-prose text-text-m text-ui-secondary">
            Tokens och komponenter från Figma &quot;Milevas — Website&quot;. Blocken från &quot;04 —
            Blocks&quot; finns på{" "}
            <Link href="/kitchensink/blocks" className="text-ui-primary underline">
              Kitchensink: block
            </Link>
            .
          </p>
        </div>
        <nav aria-label="Innehåll" className="grid gap-6 tablet:grid-cols-3">
          {contents.map((group) => (
            <div key={group.id} className="space-y-2">
              <a href={`#${group.id}`} className="block text-label-s text-ui-primary">
                {group.title}
              </a>
              <ul className="space-y-1 text-sm">
                {group.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-ui-secondary hover:text-ui-primary">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="space-y-2">
            <Link href="/kitchensink/blocks" className="block text-label-s text-ui-primary">
              04 — Blocks →
            </Link>
          </div>
        </nav>
        <div className="border-l-4 border-status-info bg-bg-fill px-4 py-3 text-sm text-ui-primary">
          <strong>Fortsätta arbetet?</strong> Läs{" "}
          <code className="font-mono text-xs">docs/design-system.md</code> i repot: var allt finns,
          hur ett block byggs från Figma och vad som är nästa steg. Egna beslut står i{" "}
          <code className="font-mono text-xs">docs/figma-deviations.md</code>, blocken i{" "}
          <code className="font-mono text-xs">docs/blocks-backlog.md</code>.
        </div>
      </header>

      <Group id="foundations">
        <Section id="colors">
          <div className="space-y-8 bg-bg-fill p-4 sm:p-6">
            {colorGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-label-s text-ui-primary">{group.title}</h4>
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

        <Section id="typography">
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

        <Section id="breakpoints">
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

        <Section id="grids">
          {/*
          Own decision, not in Figma (2026-10-02): the Grids frame only shows Desktop L. Desktop S has
          the same 12 columns, so it follows the frame; Tablet (2 per row) and Mobile (1 per row) were
          decided by us. Update `card-grid-*` in site-theme.css and `cardGrids` in grid.ts if Figma
          gets frames for them.
        */}
          <p className="border-l-4 border-status-info bg-bg-fill px-4 py-3 text-sm text-ui-primary">
            <strong>Eget beslut, framgår inte i Figma (2026-10-02):</strong> Figma visar card grid
            bara för Desktop L. Desktop S har också 12 kolumner och följer samma uppdelning. På
            Tablet visas 2 kort per rad och på Mobile 1, för alla tre varianterna.
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
            <h4 className="text-label-s text-ui-primary">
              grid-layout <span className="text-ui-tertiary">(aktuellt antal kolumner)</span>
            </h4>
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
      </Group>

      <Group id="components">
        <Section
          id="logos"
          figma="6075:2513"
          api='<Logo /> · <Logo variant="symbol" />'
          description="Färgen kommer från text-*, storleken från h-* med w-auto."
        >
          <div className="grid gap-4 tablet:grid-cols-2">
            <Example label="På bg-surface (text-ui-primary)">
              <div className="flex flex-wrap items-center gap-8 bg-bg-surface p-8 text-ui-primary">
                <Logo className="h-10 w-auto" />
                <Logo variant="symbol" className="size-10" title="" />
              </div>
            </Example>
            <Example label="På bg-inv-fill (text-ui-inv-primary)">
              <div className="flex flex-wrap items-center gap-8 bg-bg-inv-fill p-8 text-ui-inv-primary">
                <Logo className="h-10 w-auto" />
                <Logo variant="symbol" className="size-10" title="" />
              </div>
            </Example>
          </div>
        </Section>

        <Section
          id="icons"
          figma="6075:2501"
          api='<Icon name="plus" title?="…" />'
          description="16px, utom arrow-* som är 12px. Med title får ikonen ett tillgängligt namn."
        >
          <Example label="Alla ikoner, med namn">
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
          </Example>
          <Example label="På mörk bakgrund (text-ui-inv-primary)">
            <div className="flex flex-wrap items-center gap-4 bg-bg-inv-fill p-4 text-ui-inv-primary">
              {iconNames.map((name) => (
                <Icon key={name} name={name} />
              ))}
            </div>
          </Example>
        </Section>

        <Section
          id="arrows"
          figma="8389:5810"
          api='<Arrow name="round" />'
          description="64px, den enda storleken."
        >
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
        </Section>

        <Section
          id="buttons"
          figma="8268:3068"
          api='<Button color="primary|inverted|tejp|gray" size="s|m" iconLeft iconRight> · <ButtonLink href>'
          description={
            <>
              Hover-kolumnen visas med{" "}
              <code className="font-mono text-xs">data-state=&quot;hover&quot;</code>; håll pekaren
              över en knapp i Default-kolumnen för den riktiga övergången. Den grå bakgrunden finns
              bara här så att alla fyra färgerna syns (Figma visar dem på lila). iconRight är
              arrow-right som standard.
            </>
          }
        >
          <Example label="Färg × storlek × läge" className="overflow-x-auto">
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
          </Example>
          <div className="flex flex-wrap items-start gap-8">
            <Example label='iconLeft="arrow-left" iconRight={null}'>
              <Button iconLeft="arrow-left" iconRight={null}>
                Tillbaka
              </Button>
            </Example>
            <Example label='color="tejp" size="m" iconRight="download"'>
              <Button color="tejp" size="m" iconRight="download">
                Ladda ner
              </Button>
            </Example>
            <Example label='<ButtonLink color="gray">'>
              <ButtonLink href="/kitchensink#buttons" color="gray">
                Länk som knapp
              </ButtonLink>
            </Example>
          </div>
        </Section>

        <Section id="links" figma="8309:3919" api="<TextLink href icon?>">
          <div className="flex flex-wrap items-start gap-8">
            <Example label="Default">
              <TextLink href="/kitchensink#links">Label</TextLink>
            </Example>
            <Example label='Hover (data-state="hover")'>
              <TextLink href="/kitchensink#links" data-state="hover">
                Label
              </TextLink>
            </Example>
            <Example label="icon={null}">
              <TextLink href="/kitchensink#links" icon={null}>
                Utan ikon
              </TextLink>
            </Example>
          </div>
        </Section>

        <Section
          id="choice"
          figma="8268:3371"
          api="<Choice title price text textSize selected borderRight image>"
          description="En button med aria-pressed."
        >
          <Example label="Variant × default/selected" className="overflow-x-auto">
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
          </Example>
          <Example label="Klickbar: välj ett alternativ">
            <ChoiceDemo />
          </Example>
        </Section>

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
                  href="/kitchensink#product-card"
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
          description="Från frame 6, den enda som har den. Den nyare Configurator-designen (frame 15) visar ett totalpris i stället; se frågorna i blocks-backlog.md."
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
                      href="/kitchensink#truck-column"
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
    </div>
  );
}
