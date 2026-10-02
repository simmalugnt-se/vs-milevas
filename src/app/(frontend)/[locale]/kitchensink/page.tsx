import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppEnv } from "@/utilities/environment";
import { type Mode, modes } from "./breakpoints";
import { type ColorToken, colorGroups, gradientStops } from "./colors";
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
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-8">
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
    </div>
  );
}
