import type { Metadata } from "next";
import { Alternative } from "@/components/ui/alternative";
import { Arrow, arrowNames } from "@/components/ui/arrow";
import {
  Button,
  ButtonLink,
  type ButtonSize,
  type ButtonVariant,
  TextLink,
} from "@/components/ui/button";
import { type ColorMode, modeClass } from "@/components/ui/color-mode";
import { FooterLink } from "@/components/ui/footer-link";
import { Icon, iconNames } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { NavLink } from "@/components/ui/nav-link";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { TimePicker, type TimePickerDay } from "@/components/ui/time-picker";
import { type Mode, modes } from "./breakpoints";
import { type ColorToken, colorGroups, colorModes } from "./colors";
import { cardGrids, grid, radii } from "./grid";
import { durations, easings } from "./motion";
import { primitiveGroups } from "./primitives";
import { spacing, strokes } from "./spacing";
import { sizes, sizesForMode, type TextStyle, textStyles } from "./typography";
import { Example, Group, KitchensinkPage, Section } from "./ui";

/** Tokens and the smallest building blocks from Figma "01 — Foundations" and "02 — Components". */
export const metadata: Metadata = { title: "Kitchensink: Grunder" };

/** A swatch in a mode's column: the token resolves inside the column's `mode-*` class. */
function ColorRow({ color, mode }: { color: ColorToken; mode: ColorMode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr_auto] items-center gap-x-3">
      <span
        aria-hidden
        className="size-8 border border-border-primary"
        style={{ backgroundColor: `var(${color.token})` }}
      />
      <span className="min-w-0">
        <span className="block font-medium text-ui-primary">{color.name}</span>
        <code className="block truncate font-mono text-xs text-ui-secondary">
          {color.className}
        </code>
      </span>
      <code className="text-right font-mono text-xs uppercase text-ui-secondary">
        {color.values[mode]}
      </code>
    </li>
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

const buttonRows: { variant: ButtonVariant; border: boolean }[] = [
  { variant: "primary", border: false },
  { variant: "secondary", border: false },
  { variant: "secondary", border: true },
];
const buttonSizes: ButtonSize[] = ["s", "m"];
const buttonStates = ["default", "hover", "disabled"] as const;

/** Placeholder days for the time picker. */
const timePickerDays: TimePickerDay[] = [
  "Idag 12 oktober",
  "Imorgon 13 oktober",
  "Tisdag 14 oktober",
].map((label) => ({
  label,
  times: [
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ],
}));

const widest = modes[0].maxWidth;

/** Variants that target only this mode: from its own breakpoint up to the next wider one. */
const onlyThisMode = (index: number) => {
  const from = modes[index].variant;
  const below = modes[index - 1]?.variant;
  return [from && `${from}:`, below && `max-${below}:`].filter(Boolean).join("");
};
const percentOfWidest = (px: number) => `${(px / widest) * 100}%`;

/**
 * Figma's breakpoint frame, scaled: the grey area runs to `width-min`, the open area on to
 * `width-max`. The widest mode has no end in the frame ("Inf"), so its open area runs to the edge
 * without a line.
 */
function BreakpointBar({ mode }: { mode: Mode }) {
  const open = mode.maxWidth === widest;
  return (
    <div className="flex h-24" style={{ width: percentOfWidest(mode.maxWidth) }}>
      <div
        className="flex shrink-0 items-start justify-between gap-2 border-r border-status-error bg-bg-fill p-2"
        style={{ width: `${(mode.minWidth / mode.maxWidth) * 100}%` }}
      >
        <span className="text-display-xs text-ui-primary">{mode.name}</span>
        <span className="text-text-s text-status-error">Min</span>
      </div>
      <div
        className={`flex flex-1 justify-end bg-bg-fill/50 p-2 ${open ? "" : "border-r border-status-error"}`}
      >
        <span className={`text-text-s ${open ? "text-ui-tertiary" : "text-status-error"}`}>
          {open ? "Inf" : "Max"}
        </span>
      </div>
    </div>
  );
}

export default function FoundationsPage() {
  return (
    <KitchensinkPage href="/kitchensink">
      <Group title="Tokens" figma="01 — Foundations">
        <Section id="colors">
          <div className="grid gap-2 desktop-s:grid-cols-3">
            {colorModes.map(({ mode, name }) => (
              <div key={mode} className={`${modeClass[mode]} space-y-8 bg-bg-fill p-4 sm:p-6`}>
                <h3 className="text-display-xs text-ui-primary">
                  {name} <code className="font-mono text-xs normal-case">mode-{mode}</code>
                </h3>
                {colorGroups.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="text-label-s text-ui-primary">{group.title}</h4>
                    <ul className="space-y-2 text-sm">
                      {group.colors.map((color) => (
                        <ColorRow key={color.token} color={color} mode={mode} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-label-s text-ui-primary">
              Primitives{" "}
              <span className="text-ui-tertiary">(---primitives, alias för färgerna ovan)</span>
            </h4>
            <div className="space-y-2">
              {primitiveGroups.map((group) => (
                <div
                  key={group.title}
                  className="grid grid-cols-[7rem_1fr] items-center gap-x-4 text-xs"
                >
                  <span className="font-mono text-ui-secondary">{group.title}</span>
                  <ul className="grid grid-cols-3 gap-1 tablet:grid-cols-9">
                    {group.colors.map((color) => (
                      <li key={color.token} title={color.token} className="space-y-1">
                        <span
                          aria-hidden
                          className="block h-8 border border-border-primary"
                          style={{ backgroundColor: `var(${color.token})` }}
                        />
                        <span className="block font-mono text-ui-secondary">
                          {color.name} · {color.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="typography">
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
                    <td className="py-2 pr-4">
                      {mode.maxWidth}px{mode.maxWidth === widest ? " (Inf i framen)" : ""}
                    </td>
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
          <p className="border-l-4 border-status-info bg-bg-fill px-4 py-3 text-sm text-ui-primary">
            Uppdelningen per läge kommer från komponenten Grid på "04 — Blocks" (8389:4440), som
            blocken lägger sitt innehåll i: 2, 3 eller 4 platser. Höjden bestäms av innehållet.
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
            <div className="grid-layout mode-dark bg-bg-fill py-2">
              {Array.from({ length: grid.columns["Desktop L"] }, (_, index) => (
                <div
                  key={index}
                  className={`mode-tejp rounded-sm bg-bg-fill py-3 text-center text-text-s text-ui-primary ${
                    index >= grid.columns.Mobile ? "max-desktop-s:hidden" : ""
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mode-dark bg-bg-fill px-(--grid-margin) py-2">
            {cardGrids.map((cardGrid) => (
              <div key={cardGrid.className} className="space-y-2">
                <p className="flex gap-8 text-display-s">
                  <span className="text-ui-primary">Card grid</span>
                  <span className="text-ui-tertiary">{cardGrid.name}</span>
                </p>
                <div className={cardGrid.className}>
                  {Array.from({ length: cardGrid.perRow["Desktop L"] }, (_, index) => (
                    <div
                      key={index}
                      className="mode-tejp rounded-lg bg-bg-fill"
                      style={{ height: cardGrid.slotHeight }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="spacing"
          description="Spacing används som p-(--spacing-xs), stroke som border-(length:--stroke-width)."
        >
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
                {[
                  ...Object.entries(spacing).map(
                    ([key, values]) => [`--spacing-${key}`, values] as const,
                  ),
                  ...Object.entries(strokes).map(
                    ([key, values]) => [`--stroke-${key}`, values] as const,
                  ),
                ].map(([token, values]) => (
                  <tr key={token} className="border-t border-border-primary">
                    <td className="py-2 pr-4">{token}</td>
                    {modes.map((mode) => (
                      <td key={mode.name} className="py-2 pr-4">
                        {values[mode.name]}px
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example label="Aktuellt läge">
            <ul className="space-y-2">
              {Object.keys(spacing).map((key) => (
                <li key={key} className="grid grid-cols-[6rem_1fr] items-center gap-4">
                  <code className="font-mono text-xs text-ui-secondary">{key}</code>
                  <span
                    className="block h-4 bg-ui-brand"
                    style={{ width: `var(--spacing-${key})` }}
                  />
                </li>
              ))}
              {Object.keys(strokes).map((key) => (
                <li key={key} className="grid grid-cols-[6rem_1fr] items-center gap-4">
                  <code className="font-mono text-xs text-ui-secondary">stroke-{key}</code>
                  <span
                    className="block w-32 bg-ui-primary"
                    style={{ height: `var(--stroke-${key})` }}
                  />
                </li>
              ))}
            </ul>
          </Example>
        </Section>

        <Section id="motion" description="Mode Fast. Håll pekaren över en rad för att se kurvan.">
          <ul className="space-y-2 text-sm">
            {easings.map((easing) => (
              <li
                key={easing.name}
                className="group/motion grid grid-cols-[8rem_1fr] items-center gap-x-4 lg:grid-cols-[8rem_14rem_1fr]"
              >
                <code className="font-mono text-xs text-ui-primary">{easing.className}</code>
                <code className="col-start-2 font-mono text-xs text-ui-secondary lg:col-start-auto">
                  {easing.value}
                </code>
                <span className="@container col-span-full block h-6 bg-bg-fill lg:col-span-1">
                  <span
                    className={`block size-6 bg-ui-primary transition-transform duration-medium group-hover/motion:translate-x-[calc(100cqw-1.5rem)] ${easing.className}`}
                  />
                </span>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 font-mono text-xs text-ui-secondary">
            {durations.map((duration) => (
              <li key={duration.name}>
                <span className="text-ui-primary">{duration.className}</span> · {duration.value}ms
              </li>
            ))}
          </ul>
        </Section>
      </Group>

      <Group title="Byggstenar" figma="02 — Components">
        <Section
          id="logos"
          figma="6075:2513"
          api='<Logo /> · <Logo variant="symbol" />'
          description="Färgen kommer från text-*, storleken från h-* med w-auto."
        >
          <div className="grid gap-4 tablet:grid-cols-2">
            <Example label="mode-tejp (text-ui-primary)">
              <div className="mode-tejp flex flex-wrap items-center gap-8 bg-bg-fill p-8 text-ui-primary">
                <Logo className="h-10 w-auto" />
                <Logo variant="symbol" className="size-10" title="" />
              </div>
            </Example>
            <Example label="mode-dark (text-ui-primary)">
              <div className="mode-dark flex flex-wrap items-center gap-8 bg-bg-fill p-8 text-ui-primary">
                <Logo className="h-10 w-auto" />
                <Logo variant="symbol" className="size-10" title="" />
              </div>
            </Example>
          </div>
        </Section>

        <Section
          id="icons"
          figma="9207:18160"
          api='<Icon name="add" title?="…" />'
          description="Alla 16px, med Figmas namn i kebab-case. Med title får ikonen ett tillgängligt namn."
        >
          <Example label="Alla ikoner, med namn">
            <ul className="grid grid-cols-2 gap-2 tablet:grid-cols-4 desktop-s:grid-cols-6">
              {iconNames.map((name) => (
                <li key={name} className="flex items-center gap-3 bg-bg-fill p-3">
                  <span className="mode-tejp flex size-12 items-center justify-center bg-bg-fill text-ui-primary">
                    <Icon name={name} />
                  </span>
                  <code className="font-mono text-xs text-ui-secondary">{name}</code>
                </li>
              ))}
            </ul>
          </Example>
          <Example label="mode-dark (text-ui-primary)">
            <div className="mode-dark flex flex-wrap items-center gap-4 bg-bg-fill p-4 text-ui-primary">
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
          description="64px på den långa sidan (size=L, den enda storleken), beskuren till formen."
        >
          <ul className="flex flex-wrap gap-4">
            {arrowNames.map((name) => (
              <li key={name} className="space-y-2">
                <span className="mode-tejp flex size-28 items-center justify-center bg-bg-fill text-ui-primary">
                  <Arrow name={name} />
                </span>
                <code className="block font-mono text-xs text-ui-secondary">{name}</code>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="buttons"
          figma="9207:21288"
          api='<Button variant="primary|secondary" mode?="light|dark|tejp" border? size="s|m" iconLeft iconRight> · <ButtonLink href>'
          description={
            <>
              Färgerna kommer från läget runt knappen, eller från{" "}
              <code className="font-mono text-xs">mode</code>. Hover-kolumnen visas med{" "}
              <code className="font-mono text-xs">data-state=&quot;hover&quot;</code>; håll pekaren
              över en knapp i Default-kolumnen för det riktiga hover-läget. iconRight är
              keyboard-arrow-right som standard. Figma ritar border bara på Tejp secondary.
              Tabellerna har en grå botten (primitiven neutral/400) så att alla knappar syns; Figma
              visar dem på lila.
            </>
          }
        >
          {colorModes.map(({ mode, name }) => (
            <Example key={mode} label={`${name}: mode-${mode}`} className="overflow-x-auto">
              <table
                className={`${modeClass[mode]} min-w-[36rem] bg-(--primitive-neutral-400-100) text-left`}
              >
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
                    buttonRows.map(({ variant, border }) => (
                      <tr key={`${size}-${variant}-${border}`}>
                        <th className="p-4 text-left font-mono text-xs font-normal text-ui-primary">
                          {variant}
                          {border ? " · border" : ""} · {size.toUpperCase()}
                        </th>
                        {buttonStates.map((state) => (
                          <td key={state} className="p-4">
                            <Button
                              variant={variant}
                              border={border}
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
          ))}
          <div className="flex flex-wrap items-start gap-8">
            <Example label='mode="dark" iconLeft="arrow-left" iconRight={null}'>
              <Button mode="dark" iconLeft="arrow-left" iconRight={null}>
                Tillbaka
              </Button>
            </Example>
            <Example label='mode="tejp" size="m" iconRight="download"'>
              <Button mode="tejp" size="m" iconRight="download">
                Ladda ner
              </Button>
            </Example>
            <Example label='<ButtonLink variant="secondary">'>
              <ButtonLink href="/kitchensink#buttons" variant="secondary">
                Länk som knapp
              </ButtonLink>
            </Example>
          </div>
        </Section>

        <Section
          id="links"
          figma="8309:3919"
          api="<TextLink href iconLeft? icon?> · <NavLink variant active? disabled?> · <FooterLink>"
          description="Färgen följer läget: Figmas Color=White är Dark. Navlink och footerlink används inte av blocken än; de väntar på sin genomgång av navigationen och footern."
        >
          <h4 className="text-label-s text-ui-primary">
            Link <span className="text-ui-tertiary">Figma 8309:3919</span>
          </h4>
          <div className="grid gap-2 tablet:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => (
              <div
                key={mode}
                className={`${modeClass[mode]} flex flex-wrap items-start gap-x-8 gap-y-4 bg-bg-fill p-4`}
              >
                <Example label={`mode-${mode}`}>
                  <TextLink href="/kitchensink#links">Label</TextLink>
                </Example>
                <Example label='data-state="hover"'>
                  <TextLink href="/kitchensink#links" data-state="hover">
                    Label
                  </TextLink>
                </Example>
                <Example label='iconLeft="arrow-right" icon={null}'>
                  <TextLink href="/kitchensink#links" iconLeft="arrow-right" icon={null}>
                    Label
                  </TextLink>
                </Example>
              </div>
            ))}
          </div>

          <h4 className="text-label-s text-ui-primary">
            Navlink <span className="text-ui-tertiary">Figma 9004:10878</span>
          </h4>
          <div className="grid gap-2 tablet:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => (
              <div key={mode} className={`${modeClass[mode]} space-y-4 bg-bg-fill p-4`}>
                <p className="font-mono text-xs text-ui-secondary">mode-{mode}</p>
                <div className="flex flex-wrap gap-x-8">
                  <Example label='variant="primary"'>
                    <NavLink href="/kitchensink#links">Motviktstruckar</NavLink>
                  </Example>
                  <Example label="disabled">
                    <NavLink href="/kitchensink#links" disabled>
                      Motviktstruckar
                    </NavLink>
                  </Example>
                </div>
                <Example label='variant="secondary" · default, active, disabled'>
                  <div>
                    <NavLink href="/kitchensink#links" variant="secondary">
                      Motviktstruckar
                    </NavLink>
                    <NavLink href="/kitchensink#links" variant="secondary" active>
                      Motviktstruckar
                    </NavLink>
                    <NavLink href="/kitchensink#links" variant="secondary" disabled>
                      Motviktstruckar
                    </NavLink>
                  </div>
                </Example>
              </div>
            ))}
          </div>

          <h4 className="text-label-s text-ui-primary">
            Footerlink <span className="text-ui-tertiary">Figma 9321:51222</span>
          </h4>
          <div className="flex flex-wrap gap-x-8 gap-y-4 bg-bg-fill p-4">
            <Example label="Default (hovra från Desktop S)">
              <FooterLink href="/kitchensink#links">Elektriska motviktstruckar</FooterLink>
            </Example>
            <Example label='data-state="hover"'>
              <FooterLink href="/kitchensink#links" data-state="hover">
                Elektriska motviktstruckar
              </FooterLink>
            </Example>
          </div>
        </Section>

        <Section
          id="text-field"
          figma="8861:10820"
          api="<TextField label number? error? success? …input> · <TextAreaField … rows?>"
          description='Ett input med etikett. Active är fokus; data-state="active" visar det utan fokus.'
        >
          <div className="grid grid-cols-[repeat(auto-fill,16.625rem)] items-start gap-6">
            <Example label="Default">
              <TextField number="01" label="Heading" placeholder="Supporting text" />
            </Example>
            <Example label='data-state="active"'>
              <TextField number="01" label="Heading" defaultValue="T" data-state="active" />
            </Example>
            <Example label='error="…"'>
              <TextField
                number="01"
                label="Heading"
                placeholder="Supporting text"
                error="Fältet måste fyllas i"
              />
            </Example>
            <Example label="success">
              <TextField number="01" label="Heading" defaultValue="Text" success />
            </Example>
            <Example label="<TextAreaField> (fyra rader)">
              <TextAreaField number="01" label="Heading" placeholder="Supporting text" />
            </Example>
          </div>
        </Section>

        <Section
          id="alternative"
          figma="8882:12777"
          api="<Alternative name value label? number?>text</Alternative> · <TimePicker name days placeholder>"
          description="Alternativ är radioknappar; ge alternativen i ett val samma name. Tidsväljaren skickar dag och tid som text."
        >
          <div className="grid grid-cols-[repeat(auto-fill,16.625rem)] items-start gap-6">
            <Example label="label och number">
              <Alternative name="demo-heading" number="01" label="Heading">
                Text
              </Alternative>
            </Example>
            <Example label='data-state="active"'>
              <Alternative
                name="demo-heading-active"
                number="01"
                label="Heading"
                data-state="active"
              >
                Text
              </Alternative>
            </Example>
            <Example label="Utan rubrik: välj ett">
              <fieldset className="flex flex-col gap-(--spacing-2xs)">
                <legend className="sr-only">När ska vi ringa?</legend>
                <Alternative name="demo-call" value="asap" defaultChecked>
                  Så snart som möjligt
                </Alternative>
                <Alternative name="demo-call" value="specific">
                  Jag önskar en särskild tid
                </Alternative>
              </fieldset>
            </Example>
            <Example label="TimePicker, stängd">
              <TimePicker name="demo-time" days={timePickerDays} placeholder="Välj tid" />
            </Example>
            <Example label="TimePicker, öppen">
              <TimePicker
                name="demo-time-open"
                days={timePickerDays}
                placeholder="Välj tid"
                defaultOpen
              />
            </Example>
          </div>
        </Section>
      </Group>
    </KitchensinkPage>
  );
}
