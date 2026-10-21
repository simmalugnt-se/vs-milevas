import type { SectionId } from "./sections";

/**
 * Where the code departs from Figma "Milevas — Website", or fills a gap Figma leaves, and the
 * questions for the designer. Each entry belongs to the kitchensink section or block where it shows
 * (`target`) and is listed there; all of them, and the `general` ones, are on /kitchensink/notes.
 *
 * The rule is that Figma's variable names and values apply. Add a note whenever the code departs from
 * Figma or fills a gap, with the date, and remove it when Figma and the code agree again. Text in
 * backticks is shown as code.
 */

/** A kitchensink section (`sections.ts`), or `general` for the whole site. */
export type NoteTarget = "general" | SectionId;

/**
 * - `Beslut`: decided together; applies until Figma changes.
 * - `Antagande`: our reading; applies until the designer says otherwise.
 * - `Platshållare`: temporary, to be replaced (search the code for `TODO(...)`).
 */
export type NoteStatus = "Beslut" | "Beslut (teknisk)" | "Antagande" | "Platshållare";

export type FigmaNote = {
  target: NoteTarget;
  topic: string;
  /** What Figma says or shows. */
  figma: string;
  /** What the code does. */
  code: string;
  why: string;
  status: NoteStatus;
  /** When it was decided or written down, `YYYY-MM-DD`. */
  date?: string;
};

export type DesignQuestion = {
  target: NoteTarget;
  question: string;
  /** Figma node the question is about. */
  figma?: string;
};

export const designQuestions: DesignQuestion[] = [
  // General
  {
    target: "hero",
    question:
      "Startsidan har fem hero-kolumner och sex produktkort. Testet kopplar en kolumn till varje befintlig truckfamilj; är det rätt indelning?",
    figma: "8539:7103",
  },
  {
    target: "general",
    question:
      'Ramen "blabla" på "02 — Components" (text-box, truck-column): när är den klar, och vad ska den heta?',
  },
  {
    target: "general",
    question:
      "Image & Text (`8721:19164`): skärmdumpen av Desktop L är en grå yta. Platshållare, eller en bild som inte exporteras?",
    figma: "8721:19164",
  },
  {
    target: "general",
    question:
      "Flera varianter heter `Device4`–`Device8` och `Variant2` i stället för Mobile och Desktop S. Det påverkar inte bygget, men namnen är otydliga.",
  },

  // Foundations
  {
    target: "colors",
    question:
      "I `---primitives` är `neutral/700/85` (`#363636`) och `brand/tejp/85` (`#e5ff59`) fasta färger, medan alla andra `85` är basfärgen på 85 %. Därför är knapparnas hover genomskinlig i Light men fast i Dark och Tejp. Avsiktligt?",
  },
  {
    target: "colors",
    question:
      "`neutral/100/0`–`90` är `#fcfcfc` med opacitet, men `neutral/100/100` är `#ffffff`. Ska de ha samma bas?",
  },
  {
    target: "typography",
    question:
      "Temats `Font/*`-variabler stämmer inte med textstilarna: `Font/Label/family` pekar på `font/family/text` (Clash Grotesk), men Label L och S använder `font/family/label` (Geist Mono). `Font/Text/weight L` är Semibold men Text L är Medium, och `Font/Text/weight-S` är 450 men Text S är Semibold. Koden följer textstilarna.",
  },
  {
    target: "colors",
    question:
      "GRIDS-framen använder fortfarande `Color/UI/inv-primary`, `Color/BG/inv-fill` och `Color/BG/surface`, som inte finns i `theme`-samlingen. Ska de ersättas med lägena (Dark `BG/fill`, Tejp `BG/fill` och så vidare) och den gamla samlingen tas bort? Koden använder redan lägena.",
    figma: "6075:1689",
  },
  {
    target: "breakpoints",
    question:
      'Desktop L har "Inf" i BREAKPOINTS-framen men `breakpoints/width-max` 1920. Ska Desktop L sakna övre gräns, som koden gör, eller ska något hända vid 1920?',
    figma: "8004:139",
  },
  {
    target: "typography",
    question: 'TEXT STYLES-framen kallar kolumnen "Desktop M"; läget i `layout` heter Desktop S.',
  },
  {
    target: "motion",
    question:
      "Exporten av `motion` har bara läget Fast. Finns det fler lägen, och när ska de gälla?",
  },
  {
    target: "colors",
    question:
      "`BORDER/secondary` är `#121212` i Dark, samma som `BG/fill`, så ramen syns inte. Ska den vara ljus i Dark?",
    figma: "6073:1230",
  },

  // Components
  {
    target: "buttons",
    question:
      "I Dark har `BTN/primary/fill` (`#121212`) samma färg som `BG/fill`, och knappkomponenten ritar ingen ram på primary, så en Dark primary syns inte på Dark-botten. Ska den ha `border=true` där, eller används den bara på ljus botten?",
    figma: "9207:21288",
  },
  {
    target: "buttons",
    question:
      "Disabled i storlek M använder `btn/primary/text` (full färg), medan S använder `btn/primary/text-disabled`. Ska M också tonas ner? Koden tonar ner båda.",
    figma: "9207:21288",
  },
  {
    target: "buttons",
    question:
      "Färgen heter `primary` i storlek S men `black` i M, och `gray` (secondary) finns bara i S. Samma knapp, eller avsiktligt olika?",
    figma: "9207:21288",
  },
  {
    target: "buttons",
    question:
      "`BTN/secondary` disabled: Light har fill `#575757d9` (samma som hover) och ram `#57575799`, Dark det omvända (fill `#57575799`, ram `#575757d9`). Är Light ombytt? Knappen `gray` disabled ser därför likadan ut som hover.",
    figma: "6073:1230",
  },
  {
    target: "buttons",
    question:
      "Dark `BTN/secondary/text-disabled` är `#f0f0f0`, samma som texten, så disabled syns bara på fyllningen. I Light och Tejp är den `#f0f0f099`. Avsiktligt?",
  },
  {
    target: "buttons",
    question:
      'Light visar "Secondary Disabled" två gånger. Koden läser dem som `fill-disabled` och `border disabled`, efter variablerna.',
    figma: "6073:1230",
  },
  {
    target: "logos",
    question:
      "`public/milevas-logo.svg` (SEO och landningssidan) har en annan form än Figmas logotyp.",
  },
  {
    target: "icons",
    question:
      "`close` har färgen `#1C1B1F` (Material-ikonernas standard), de andra `#121212`. Koden behandlar den som de andra.",
    figma: "9321:33977",
  },
  {
    target: "icons",
    question:
      "`globe` (språklänken i footern) finns inte längre på Icons-framen. Ska den läggas tillbaka, eller ska footern ha en annan ikon?",
    figma: "9207:18160",
  },
  {
    target: "arrows",
    question:
      "`arrow-up&forward` är en rak högerpil, och den svängda pilen heter `arrow-halfup`. Koden följer Figmas namn.",
  },
  {
    target: "arrows",
    question:
      "Pilarna är nu beskurna till formen (`arrow-back` 64 × 40, `arrow-halfup` 48 × 64), men product-card har fortfarande `arrow-halfup` som en 64 × 64-instans. Ska den följa pilen? Koden centrerar pilen i en 64 px-ruta så att kortet inte ändras.",
    figma: "8268:2971",
  },
  {
    target: "links",
    question:
      "navlink Primary har lägena Default och disabled men inget Active. Navigationen visar i dag aktuell sida mörk och de andra gråa. Ska de andra vara `disabled`, eller ska Primary få ett Active?",
    figma: "9004:10878",
  },
  {
    target: "links",
    question:
      "footerlink Desktop har vikten Regular utan textstil (24px, radhöjd 1,2); Text L är Medium. Ska den vara Text L? Koden använder Text L.",
    figma: "9321:51222",
  },
  {
    target: "text-field",
    question:
      "Fältets text är Text XS (12px). Safari på iPhone zoomar in sidan när man trycker i ett fält med mindre text än 16px. Ska fälten ha 16px på mobil?",
    figma: "8861:10820",
  },
  {
    target: "text-field",
    question:
      'Felmeddelandet i Figma är engelskt och felstavat ("This field is requierd"). Koden skriver meddelandet per fält, på svenska.',
    figma: "8861:10845",
  },
  {
    target: "choice",
    question:
      "`choice` har bara `Default` och `active`, inget hover-läge. Koden ger bara pekhanden. Förslag: vit bakgrund (`bg-active`) vid hover, som inte förväxlas med det gula valda läget.",
    figma: "8268:3371",
  },

  // Blocks
  {
    target: "navigation",
    question:
      "Färgramen har `NAVIGATION/FILL` (`#121212eb`) och `NAVIGATION/OVERLAY` (`#00000066`). Är navigationen nu mörk, och var används overlay? Koden har båda som tokens (`navigation-fill`, `navigation-overlay`), men använder dem inte ännu.",
    figma: "6073:1230",
  },
  {
    target: "product-grid",
    question:
      "Mobile är en slider där det första kortet är gult med pil och priser och de andra grå utan priser. Ska kortet som syns bli gult, eller är det bara ett exempel på hover? Koden visar alla kort grå med pil och priser, som på Tablet.",
    figma: "8389:569",
  },
  {
    target: "text-boxinfo",
    question:
      'Tablet och Mobile: "390kr/mån" i rubriken har storleken 96px, resten 64 och 48px. Det syns inte i skärmdumpen; koden använder rubrikens storlek för hela raden.',
  },
  {
    target: "configurator",
    question:
      "Figma visar olika förstoring och beskärning per breakpoint för samma truck. Ska varje truckfamilj ha egna bildutsnitt per breakpoint, eller ska alla följa en gemensam regel? Koden använder tills vidare object-contain med marginal (beslut 2026-10-05).",
    figma: "8721:16450",
  },
];

export const figmaNotes: FigmaNote[] = [
  {
    target: "general",
    topic: "Global sidlayout",
    figma:
      "Fullbreddsblock med grid/margin för innehållet; navigationen ligger över sidans innehåll",
    code: "Alla publika sidor har en gemensam layout utan yttre padding eller automatiska mellanrum mellan CMS-block. Headern är sticky och överlagrad; varje block ansvarar för sin egen spacing.",
    why: "Användaren förtydligade att layouten ska gälla globalt. Kopplingen till första blockets typ och klassen milevas-page är borttagen.",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "general",
    topic: "Dynamisk rem-skala",
    figma: "Desktop L är ritad vid 1440px; ingen regel för skalning över designbredden",
    code: "Publika sajten behåller grundstorleken upp till 1440px och skalar därefter rem med viewportens bredd: 1rem = bredd / 90. Text, spacing, ikoner och layoutmått följer samma skala",
    why: "Användarens önskemål att behålla proportionerna från 1440px på större skärmar. Payload-admin har en separat root-layout och omfattas inte",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "hero",
    topic: "Mindre skärmar",
    figma:
      "Page Template har tomma blockytor på Desktop S, Tablet och Mobile; hero-blocket är inte färdigritat under desktop",
    code: "Fem kolumner på desktop; horisontell snap-lista under Desktop S, 85 % kortbredd på Mobile och 55 % på Tablet, alla val synliga",
    why: "Första testversionen behöver fungerande länkar även utan hover",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "hero",
    topic: "Höjd på desktop",
    figma: "Hero-ramen har proportionen 1440:832",
    code: "Från Desktop S är heron 100svh hög utan aspektförhållande. Kolumnernas text ligger längst ner inom den synliga höjden",
    why: "På breda skärmar blev den breddstyrda höjden större än viewporten och dolde texten. Anpassat till viewportens höjd efter användarens granskning",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "hero",
    topic: "Aktiv kolumn",
    figma: "Den tredje av fem kolumner är gul",
    code: "Startkolumnen väljs i Payload; hover och tangentbordsfokus aktiverar en annan kolumn",
    why: "Figma visar ett läge men ingen regel för startkolumnen",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "hero",
    topic: "Rubrik och priser",
    figma: "Bygg din truck: med exempelpriser, ingen sidrubrik",
    code: "En redigerbar h1 för skärmläsare; pris och leasing från vald truckfamilj och konfiguratorns finansieringsinställningar",
    why: "Riktigt CMS-innehåll och priser som följer konfiguratorn",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "product-grid",
    topic: "Truckdata och plocktruck",
    figma: "Sex kort med exempel på namn, specifikationer och bilder",
    code: "Familjekopplade kort hämtar priser och länkar från konfiguratorn. Bild, namn, kapacitet och batteritext kan ersättas i blocket. Plocktruckar länkar tills vidare till kontakt utan priser",
    why: "Plocktruckar finns inte i konfiguratorns katalog; specifikationerna i testet följer Figmas exempel och behöver innehållsgranskas",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "product-grid",
    topic: "Bildproportioner",
    figma: "Anpassade bildutsnitt per truck",
    code: "Anpassade utsnitt använder object-contain så bildens proportioner bevaras",
    why: "Object-fill sträckte bilderna i kortens viloläge; korrigerat efter granskning av startsidan",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "text-grid",
    topic: "Testinnehåll",
    figma: "Tre etiketter med 01 och label, två texter med text",
    code: "01/02/03 och Bygg din truck/Få offert/Leverans; fotografierna från Figma, text-platshållarna kvar",
    why: "Samma etiketter som kitchensink, redigerbara i Payload",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "text-boxinfo",
    topic: "Knappens mål",
    figma: "Label med pil, inget mål angivet",
    code: "Läs mer länkar till kontakt i teststartsidan; både text och mål går att ändra i Payload",
    why: "Finansieringssidan finns inte än",
    status: "Antagande",
    date: "2026-10-07",
  },

  // General
  {
    target: "general",
    topic: "Sidbredd",
    figma: "Blocken är ritade i full bredd med `grid/margin`",
    code: "`main`, header och footer har full bredd och `px-(--grid-margin)`; boilerplatens `max-w-7xl` är borttagen",
    why: "Samma marginal för allt innehåll",
    status: "Beslut",
    date: "2026-10-02",
  },

  // Foundations
  {
    target: "colors",
    topic: "Lägen",
    figma:
      "En uppsättning variabler med lägena Light, Dark och Tejp; de tidigare `UI/inv-*`, `BG/inv-*` och `BG/surface` finns inte på färgramen",
    code: "`@theme` har Light-värdena; `mode-light`, `mode-dark` och `mode-tejp` byter färgerna för ett element och allt i det, och tar varianter (`hover:mode-tejp`). `ui-inv-*`, `bg-surface` och `bg-inv-*` (även `#0b0b0b`) är borttagna",
    why: "Som en Figma-frames läge; klasserna följer variablernas namn",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Lika i alla lägen",
    figma: "Brand, Navigation, Status och `BORDER/secondary` har samma värde i alla tre lägena",
    code: "Bara i `@theme`; lägena sätter de färger som skiljer sig",
    why: "Kortare CSS; testet flyttar en färg till lägena om Figma ändrar den",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Gradient",
    figma: "`Color/gradient` finns inte på färgramen",
    code: "`bg-gradient-inv` och dess två tokens är borttagna",
    why: "Användes bara på kitchensink; card har en egen svart gradient",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Primitiver",
    figma:
      "`---primitives` (läget Value): palett med nyans och opacitet, som `color/neutral/700/100`",
    code: "`--primitive-neutral-700-100` i `:root`, utan Tailwind-klasser; temafärgerna pekar på samma primitiv som i Figma",
    why: "Komponenterna använder temafärgerna, som i Figma",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Utan primitiv",
    figma: "Dark `BG/active` (`#000000`), status och navigation har egna värden, inget alias",
    code: "Värdet direkt",
    why: "Det finns ingen primitiv för dem",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Figmas export",
    figma: "Variables → samling → Export ger en JSON-fil per läge",
    code: "Filerna ligger i `docs/figma-variables`; `tests/design-tokens.test.mts` jämför CSS:en med dem",
    why: "Exporten visar alla lägen och alias, även det som framarna inte visar",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "spacing",
    topic: "Stroke",
    figma: "`stroke/width` (0,5 px på Mobile, annars 1 px) och `stroke/width-icon` (1 och 2 px)",
    code: "`--stroke-width` och `--stroke-width-icon`, ännu inte använda; ramar är 1 px och ikonerna har strecken från sina SVG:er",
    why: "Figmas komponenter visar inte var de används",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Färgnamn",
    figma: "Både `Color/BG/*` och `Color/BACKGROUND/*`, och `Color/status/iinfo`",
    code: "`bg-*` och `status-info`",
    why: "Stavfel i Figma, rättas där",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "colors",
    topic: "`Color/BACKGROUND/border`",
    figma: "Variabel (`#999999`)",
    code: "Ingen token",
    why: "Används bara som ram runt färgrutorna i Figma",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "typography",
    topic: "Typsnitt",
    figma: "Clash Grotesk Variable för Display och Text",
    code: "Clash Grotesk Variable för Display, Text och sajtens standardtext; Geist Mono för Label",
    why: "Fontshares officiella WOFF2-fil laddas lokalt via next/font/local, med viktintervallet 200–700. Licensen ligger tillsammans med fontfilen i repot.",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "typography",
    topic: "Versaler",
    figma:
      'Display- och Label-raderna i "Text styles" har `uppercase` på instanserna; stilarna säger inget',
    code: "`text-display-*` och `text-label-*` sätter versaler",
    why: "Alla exempel i Figma är versaler",
    status: "Antagande",
  },
  {
    target: "typography",
    topic: "Text M spärrning",
    figma: "`letterSpacing: -1`",
    code: "`-0.01em`",
    why: "Designkontexten ger -0.16px vid 16px, alltså -1 %",
    status: "Antagande",
  },
  {
    target: "typography",
    topic: 'Läget "Desktop M"',
    figma: 'Kolumnrubrik i "Text styles"; variabelläget heter "Desktop S"',
    code: "Desktop S",
    why: "Variabelns namn gäller",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "breakpoints",
    topic: "Desktop L max",
    figma: 'Framen "Breakpoints" säger "Inf"; `breakpoints/width-max` är 1920',
    code: "Ingen övre gräns: från 1440 skalar sidan (`1rem` = bredden / 90). 1920 står bara i kitchensinks tabell",
    why: "Framen och skalningen säger samma sak; variabeln används inte till något",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "breakpoints",
    topic: "Tailwinds brytpunkter",
    figma: "Bara Tablet, Desktop S och Desktop L",
    code: "`tablet:`, `desktop-s:`, `desktop-l:` plus Tailwinds `sm`–`2xl`",
    why: "Boilerplate-blocken använder `sm:`/`md:`/`lg:`; ny kod använder Figmas namn",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "grids",
    topic: "Card grid under Desktop S",
    figma: 'Framen "Grids" visar bara Desktop L',
    code: "Tablet 2 kort per rad, Mobile 1, för alla tre varianterna",
    why: "Inget ritat",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "grids",
    topic: "`grid/margin`",
    figma: '8px runt om i framen "Grids"',
    code: "Bara på sidorna (`padding-inline`)",
    why: "Framen är hela viewporten; marginalen upptill och nedtill ser tillfällig ut",
    status: "Antagande",
  },
  {
    target: "grids",
    topic: "`shape/radius-*`",
    figma: "`radius-sm` 8, `radius-lg` 16",
    code: "Ersätter Tailwinds `rounded-sm`/`rounded-lg` (4/8)",
    why: "Klassen motsvarar Figmas variabel; adminbaren blir något rundare",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "spacing",
    topic: "`layout/spacing/*`",
    figma: "Variabler som `spacing/xs`",
    code: "`p-(--spacing-xs)`, inte `p-xs`",
    why: "I Tailwinds tema skulle `--spacing-*` även styra `w-*`/`max-w-*` och ändra `max-w-2xl` i boilerplate",
    status: "Beslut (teknisk)",
  },

  // Components
  {
    target: "text-field",
    topic: "Höjd och ikoner",
    figma: "Fältet är 40px högt; Error har den gamla `icon-close` (12px), Success `icon-check`",
    code: "Minst 40px (`min-h-10`), så att texten får plats om den blir större; ikonerna `close` i 12px och `check` från Icons",
    why: "Fasta höjder undviks; de gamla ikonerna finns inte längre",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "text-field",
    topic: "Krysset vid fel",
    figma: "Ett kryss i fältet när det är fel",
    code: "Bara en markering, ingen knapp som tömmer fältet",
    why: "Figma visar inte vad krysset gör",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "links",
    topic: "footerlink Desktop och Mobile",
    figma: "`Device=Desktop` och `Device=Mobile`, utan brytpunkt; raden är 38px hög",
    code: "Mobile under Desktop S, Desktop från Desktop S där det finns hover; raden är texten plus `spacing/4xs`, ingen fast höjd",
    why: "Hovern behöver en pekare; fasta höjder undviks",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "links",
    topic: "Färg",
    figma: "`Color=Black` och `Color=White`, båda `color/ui/primary`; hover byter inte färg",
    code: "Ingen färg-prop: länken är `text-ui-primary` och följer läget (White är Dark)",
    why: "Samma variabel i två lägen",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "icons",
    topic: "Namn",
    figma: "Material-namn med understreck: `keyboard_arrow_down`, `open_in_new`, `arrow_up-right`",
    code: "Samma namn i kebab-case: `keyboard-arrow-down`, `open-in-new`, `arrow-up-right`",
    why: "Som de andra namnen i koden",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "icons",
    topic: "Borttagna",
    figma:
      "Den nya Icons-framen saknar `play`, `pause`, `skip-*`, `maximize`, `minimize`, `sound-*` och `globe`",
    code: "Borttagna utom `globe`, som footern använder; den har den gamla SVG:n",
    why: "Ingen annan använde dem",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Animation",
    figma: "Hover byter läge (pilraden från start till slut), utan animation",
    code: "Pilen glider 20px med `duration-short` (300 ms) och `ease-slow-out`",
    why: "Figmas motion-variabler; vilka som gäller för knappen är vårt val",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Med bild",
    figma: "Fast höjd 262px",
    code: "Bilden tar två tredjedelar av bredden",
    why: "Fungerar i alla bredder; ungefär samma proportion",
    status: "Antagande",
  },
  {
    target: "choice",
    topic: "Titel och pris",
    figma: "Titeln till vänster och priset uppe till höger, ritat med korta titlar och priser",
    code: "Får titel och pris inte plats bredvid varandra hamnar priset på en rad under titeln, och ett ord som är längre än valet avstavas (`hyphens-auto`) eller bryts",
    why: 'Långa namn och priser (trucktypen, "FRÅN 169 900 KR") gick in i varandra när rutan är smal, till exempel från Desktop S till ungefär 1300px; där det får plats ser valet ut som i Figma',
    status: "Antagande",
    date: "2026-10-05",
  },
  {
    target: "choice",
    topic: "Fokus",
    figma: "Inget hover- eller fokusläge",
    code: "Webbläsarens fokusram",
    why: "Inget ritat",
    status: "Antagande",
  },
  {
    target: "product-card",
    topic: 'Läget "tablet"',
    figma: "Läget visar pil och priser utan hover",
    code: "Under Desktop S syns pil och priser alltid; från Desktop S vid hover",
    why: '"tablet" läses som "ingen hover"',
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "product-card",
    topic: "Storlek",
    figma: "430 × 507 i komponenten; 507px hög i varje instans i product-grid, oavsett bredd",
    code: "Proportionen från product-grids instanser per läge: 339:507, 388:507, 416:507 och 469:507",
    why: "Inga fasta höjder; samma mått som Figma vid varje lägens designbredd, och samma form när skärmen är bredare",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "product-card",
    topic: "Stabil layout vid hover",
    figma: "Pil och priser visas i hover-läget",
    code: "Kortets yttre proportioner bestämmer höjden. Innehållet ligger i en absolut positionerad flex-layout; bilden krymper när pil och priser visas vid hover eller tangentbordsfokus",
    why: "Bilden ska ändra storlek enligt designen, medan innehållets storlek inte ska kunna ändra kortets höjd eller flytta nästa rad",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "product-grid",
    topic: "Scrollankring vid hover",
    figma: "Bilden ändrar storlek vid hover utan att sidan flyttas",
    code: "Produktgridden använder overflow-anchor:none; kortens innehåll får inte användas som webbläsarens scrollankare",
    why: "När kortets topp låg utanför viewport flyttade webbläsaren scrollpositionen för att kompensera för bildens storleksändring. Det kunde också flytta kortens kanter under pekaren och växla hover-läge",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "buttons",
    topic: "Färger",
    figma:
      "Komponenten (`9207:21288`) använder `BTN/primary` och `BTN/secondary` men heter efter färger: `primary`/`black`, `inverted`, `tejp`, `tejp` med `border=true` och `gray`",
    code: '`variant="primary|secondary"` och läget runt knappen, eller `mode`: `primary`/`black` är Dark primary, `inverted` Light primary, `tejp` Tejp primary, `tejp` med ram Tejp secondary och `gray` Light secondary',
    why: "Variablerna gäller; färgnamnen är lägen",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Läge i blocken",
    figma: "Blocken använder knappkomponentens fyra färger",
    code: 'Mörka knappar på ljus botten har `mode="dark"`, gula `mode="tejp"`',
    why: "Samma utseende som förut, tills blocken ritas med lägen",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Ram",
    figma: "`border=true` (bara på Tejp secondary): `stroke/width` i `BTN/secondary/border`",
    code: "`border`-prop för båda varianterna, ritad som en ring inuti knappen (`ring-inset`) så att storleken är oförändrad",
    why: "Figmas ram ligger inuti; propen följer komponenten",
    status: "Beslut",
    date: "2026-10-21",
  },
  {
    target: "card",
    topic: "Färger",
    figma: "Text `#f5f5f5`, gradient `rgba(0,0,0,.4)` → `.2`; inga variabler",
    code: "Kortet i Dark (text `ui-primary`, `#f0f0f0`), etiketten i Tejp, gradient svart 40 % → 20 %",
    why: "Närmaste token",
    status: "Antagande",
  },
  {
    target: "configurator-box",
    topic: "Version",
    figma: "Frame 9 (nyare, `Text size=S/M`) och frame 6 (urblekt)",
    code: "Frame 9; price-box från frame 6, där den enda finns",
    why: "Frame 6 är den gamla versionen",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "configurator-box",
    topic: "Variant",
    figma: "`choises=2, image=true, Variant=Grid` finns bara i frame 6",
    code: "Utelämnad",
    why: "Saknas i frame 9; borttagen eller bortglömd",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "configurator-box",
    topic: "Linjer",
    figma: "Staplade val har linje upp- och nedtill, dubbla mellan valen",
    code: "En linje mellan valen",
    why: "Dubbla linjer ser oavsiktliga ut",
    status: "Antagande",
  },
  {
    target: "configurator-box",
    topic: "Mobil",
    figma: "Inget ritat",
    code: "Två kolumner även på mobil",
    why: "Inget ritat",
    status: "Antagande",
  },
  {
    target: "truck-column",
    topic: "Linje",
    figma: "Variabeln `Color/BG/surface` (gul); ser grå ut i framen",
    code: "Gul linje: kolumnen är i Tejp, linjen `border-bg-fill`",
    why: "Variabeln gäller",
    status: "Antagande",
  },
  {
    target: "truck-column",
    topic: "Under Desktop S",
    figma: "Inget beteende utan hover",
    code: "Alltid aktiv, med gul bakgrund och innehåll",
    why: "Som product-card, men med bakgrund eftersom mörk text på foto är oläslig",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "truck-column",
    topic: "I en rad",
    figma: "Inget ritat",
    code: "En kolumn per rad på Mobile, två på Tablet, fyra från Desktop S (kitchensink-exemplet)",
    why: "Fyra gula kolumner täcker bilden och priserna bryts på mobil",
    status: "Beslut",
    date: "2026-10-02",
  },
  {
    target: "truck-column",
    topic: "Pilen",
    figma: "Egen smal SVG, 24 × 32, kallad `arrow-halfup`",
    code: '`<Arrow name="halfup-s">`',
    why: 'Ingen egen komponent i "Arrows"',
    status: "Beslut (teknisk)",
  },

  // Blocks
  {
    target: "navigation",
    topic: "Hover",
    figma: "Inget hover-läge för länkarna",
    code: "Länken blir `ui-primary` vid hover, som den aktiva",
    why: "Inget ritat",
    status: "Antagande",
  },
  {
    target: "navigation",
    topic: "Om Baoli i testet",
    figma: "Om Baoli i navigationen",
    code: "Länkar till kontakt tills sidan finns; redigerbart i Header-globalen",
    why: "Ingen Om Baoli-sida i lokala testinnehållet",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "navigation",
    topic: "Mobilmenyn",
    figma: 'Knappen heter "MENY" stängd och "Close" öppen',
    code: '"Meny" och "Stäng" (props)',
    why: "Svenska i båda lägena",
    status: "Antagande",
  },
  {
    target: "navigation",
    topic: "Position",
    figma: "Okänt om den ska följa med vid scroll",
    code: "Navigationen ligger över innehållet och följer med vid scroll på alla publika sidor",
    why: "Global sidlayout enligt användarens förtydligande; Page Template på Desktop L visar navigationen i ett sticky lager ovanpå sidan",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "navigation",
    topic: "Färg",
    figma: "Navigationsblocket använder `Color/BG/active` (`#ffffff`)",
    code: "`bg-bg-active`; `navigation-fill` och `navigation-overlay` från färgramen används inte än",
    why: "Blocket gås igenom mot Figma i ett eget steg",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Språkväljare",
    figma: "Ingen i navigationen",
    code: "Boilerplatens språkväljare är borttagen ur headern; språket byts med globe-ikonen i footern",
    why: "Navigationen följer Figma",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "navigation",
    topic: "Data",
    figma: 'Länkar och knappen "Bygg din truck"',
    code: "Header-globalens `navItems` och det nya länkfältet `cta`; `siteName` och `siteTagline` finns kvar i globalen men visas inte",
    why: "Figmas navigation har bara logosymbolen",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "navigation",
    topic: "Aktiv länk",
    figma: "Den aktiva länken är mörk",
    code: "Aktiv när sidans sökväg är länkens (eller under den)",
    why: "Figma visar läget men inte regeln",
    status: "Antagande",
  },
  {
    target: "navigation",
    topic: "Announcement bar",
    figma: "Finns inte i Figma",
    code: "Boilerplatens fält är kvar och visas, när det är påslaget, ovanför navigationen i Dark `bg-fill`",
    why: "Valfritt för redaktörerna; utseendet är vårt eget",
    status: "Antagande",
  },
  {
    target: "footer",
    topic: "Avstånd",
    figma: "Primitiva `scale/xs` (8) och `scale/md-root` (16), inte `spacing/*`",
    code: "`spacing/2xs` och `spacing/sm`, samma värden",
    why: "Endast `layout`-variablerna finns som tokens",
    status: "Antagande",
  },
  {
    target: "footer",
    topic: "Marginal",
    figma: "Indrag 16px från länkarnas och logotypens padding, inte `grid/margin` (8)",
    code: "Som Figma: 16px",
    why: "Figma ritar så i alla fyra lägen; avviker från beslutet om `grid/margin` för allt innehåll, men får göra det",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "footer",
    topic: "Hover",
    figma: "Inget hover-läge för länkarna",
    code: "Inget",
    why: "Inget ritat",
    status: "Antagande",
  },
  {
    target: "footer",
    topic: "Globe",
    figma: "Ikonen utan förklaring",
    code: 'Byter till samma sida på det andra språket (sv ↔ en); tillgängligt namn "In English" eller "På svenska"',
    why: "Plats för språkbytet utan att ändra navigationen",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "footer",
    topic: "Data",
    figma: "Länkar och mail-ikonen",
    code: "Footer-globalens `navItems` och det nya fältet `email` (`mailto:`); `copyright` finns kvar men visas inte",
    why: "Figmas footer har ingen copyright-rad",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "product-grid",
    topic: "Mobil",
    figma: 'En "product-slider" med alla sex kort; kortet är 339px, ur sliderns fasta bredd',
    code: "Horisontell slider med snap; kortet är bredden minus `spacing/md` (335px vid 375)",
    why: "Närmaste token; nästa kort syns vid kanten som i Figma",
    status: "Antagande",
  },
  {
    target: "product-grid",
    topic: "Mobilkortet",
    figma: "Det första kortet är gult med pil och priser (hover), de andra i Default utan priser",
    code: 'Alla kort i product-cards "tablet"-läge: grå, med pil och priser',
    why: "Samma regel som under Desktop S i övrigt; se frågan ovan",
    status: "Antagande",
  },
  {
    target: "product-grid",
    topic: "Namn",
    figma: '"Elektriska Palllyftare" (tre l)',
    code: '"Elektriska pallyftare" på kitchensink',
    why: "Stavfel i Figma",
    status: "Beslut (teknisk)",
  },
  {
    target: "text-grid",
    topic: "Rubrik",
    figma: 'Två textrader ("Så enkelt" / "fungerar det") och pilen bredvid den första',
    code: "En `h2` där en radbrytning i texten behålls; pilen står inline före texten",
    why: "En rubrik för skärmläsare, och redaktören väljer radbrytningen",
    status: "Antagande",
  },
  {
    target: "text-grid",
    topic: "Pilens storlek",
    figma: "64px (Desktop), 48px (Tablet), 32px (Mobile); ingen variabel",
    code: "Samma storlekar per läge",
    why: "Inget att ta från tokens",
    status: "Beslut (teknisk)",
  },
  {
    target: "text-grid",
    topic: "Höjder",
    figma:
      "Panelen 800px hög (Desktop), blocket 1000px (Tablet), korten 405px (Desktop) och 840px tillsammans (Mobile)",
    code: "Inga fasta höjder: panelen är så hög som innehållet, korten har Figmas proportion per läge (327:275, 752:242, 1:1, 459:405), och avståndet under rubriken är `spacing/4xl` på Desktop, `spacing/lg` under",
    why: "Samma mått som Figma vid 375, 800 och 1440; vid 1280 blir panelen 757px i stället för 800",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "text-grid",
    topic: "Korten",
    figma: "Tre instanser med olika toning: komponentens gradient, svart 20 % och ingen",
    code: "Alla med `card`s gradient",
    why: "Ser ut som rester; komponenten gäller",
    status: "Antagande",
  },
  {
    target: "text-boxinfo",
    topic: "Höjd",
    figma: "Desktop-ramarna är 800px höga, med texten upptill och boxen nedtill",
    code: "Minhöjd 50rem från Desktop S, texten upptill och boxen nedtill. Blocket kan växa med innehållet; under Desktop bestäms höjden av innehållet.",
    why: "Den tidigare tolkningen utan minhöjd gav 631px vid 1440 och 596px vid 1280. Minhöjden behåller Figmas luft (800px vid rotstorlek 16px) och följer den proportionella rem-skalningen över 1440.",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "text-boxinfo",
    topic: "Typografi och radbrytning",
    figma:
      "Desktop L (`8389:8525`): Clash Grotesk Variable, rubrik 96px med radavstånd 0.9 och fyra rader; brödtext 36px med radavstånd 1.1",
    code: "Clash Grotesk Variable med samma storlekar och radavstånd som Figma.",
    why: "Den tidigare Geist-platshållaren gav en extra rad vid 1440. Den officiella variabla fontfilen är nu inlagd; layoutmåtten och rem-skalningen är oförändrade.",
    status: "Beslut",
    date: "2026-10-07",
  },
  {
    target: "text-boxinfo",
    topic: "Textbredd",
    figma:
      "Desktop L: textnoderna `8389:8880` och `8389:8881` har explicit bredd 803px inom en kolumnyta på 827.33px med 16px vänsterpadding",
    code: "Texten fyller gridytan efter padding: 811.33px vid 1440",
    why: "Den gemensamma griden följer Figmas 12 kolumner med 8px marginal och gap; textnodernas explicita bredd lämnar ytterligare cirka 8px tomt i Figma.",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "text-boxinfo",
    topic: "Färger",
    figma: "Rubrikens andra del `#e0ff3c` och brödtexten `#f5f5f5`, utan variabler",
    code: "Blocket i Dark: `ui-brand` och `ui-primary`",
    why: "Närmaste token, som för card",
    status: "Antagande",
  },
  {
    target: "text-boxinfo",
    topic: "Text-box",
    figma: 'Använder text-box från ramen "blabla", som inte är klar',
    code: "`TextBox` som den är",
    why: "Blocket är färdigritat; ändras text-box ändras blocket med den",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Version",
    figma: "Ram 15 (`8721:16450`) och den urblekta ram 12 (`8389:6544`)",
    code: "Ram 15; price-box används inte längre i konfiguratorn",
    why: "Ram 12 är den gamla designen",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Nedre raden",
    figma: "Ram 15:s Device5–8 visar ett steg med två staplade val och en hjälptext",
    code: "Samma skärm i ett annat steg, inte ett eget läge",
    why: "Innehållet skiljer sig, inte layouten",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Föregående",
    figma:
      'Inte i ram 15; ett exempel ("bababa") har en grå "Föregående" bredvid "Nästa", lika breda',
    code: '`Button variant="secondary"` med pil vänster, från andra steget; första steget har bara "Nästa"',
    why: "Följer exemplet",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Stegindikator",
    figma: "Bara `[02]` i rutan",
    code: "Ingen annan indikator",
    why: "Användarens beslut",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Proportioner",
    figma:
      "Verifierat i ram 15: Desktop L 1440×800 med bildyta 893.33×704; Desktop S 1280×800 med bildyta 687.33×704; Tablet 800×1000 med gemensam pris-/bildyta 704×478; Mobile 375×800 med gemensam pris-/bildyta 359×315",
    code: "Minhöjd 50rem på Mobile och Desktop, 62.5rem på Tablet. Bildytan får återstående utrymme efter valpanelen; under Desktop delar pris och truck samma yta. Bildytan har minhöjd 19.6875rem på Mobile och 29.875rem på Tablet så längre val kan öka blockets höjd.",
    why: "Figmas grid ändrar bildytans höjd mellan stegen för att hålla samma ramhöjd. Minhöjd och innehållsstyrd grid behåller detta, samtidigt som längre texter och staplade mobilval kan växa utan att klippas.",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "configurator",
    topic: "Navigation och totalpris",
    figma:
      "Den markerade blockramen innehåller ingen navigation. Den globala överlagrade navigationen är beslutad separat.",
    code: "Payload-blocket reserverar 6rem i samma grå bakgrund ovanför ConfiguratorScreen för sajtens överlagrade navigation. Kitchensinks fristående skärm behåller Figmas egna mått.",
    why: "Den fristående blockramen visar ingen header. Den reserverade ytan hindrar sajtens navigation från att täcka totalpriset och skalar med samma rem-regel som resten av sidan.",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "configurator",
    topic: "Testinnehåll jämfört med designexemplet",
    figma: "Ram 15 visar en Baoli-truck och val med både Title och Text.",
    code: "Kontrollerad truckfamilj använder truck-placeholder.webp (annan truck), och lyftkapacitetsvalen saknar beskrivningstext. Valpanelen var därför 229.39px hög vid 1280px, mot Figmas 362px.",
    why: "Bilden kommer från TruckFamilies i Payload, och valens text från katalogen. Skillnaden i panelhöjd beror delvis på innehållet och ska inte kompenseras med manuella mått.",
    status: "Platshållare",
    date: "2026-10-07",
  },
  {
    target: "configurator",
    topic: "Sidbredd",
    figma: "Konfiguratorns bakgrund fyller sidbredden",
    code: "Blocket följer den globala fullbreddslayouten utan negativa sidmarginaler. ConfiguratorScreen ansvarar för sin interna padding.",
    why: "Den gamla kompensationen för main-padding gav sidscroll när den globala paddingen togs bort.",
    status: "Beslut (teknisk)",
    date: "2026-10-07",
  },
  {
    target: "configurator",
    topic: "Bilden",
    figma:
      "Trucken förstorad och beskuren olika per läge, med kontaktrutan över bilden. Valpanelen ligger efter img&btn-ytan med 8px gap, även på Mobile.",
    code: "Trucken får plats med object-contain och spacing/md marginal. Kontaktrutan ligger över bilden; under Desktop ligger även priset i samma yta och steget under.",
    why: "Utsnittet skiljer sig från designexemplet. Frågan gäller hur Figmas utsnitt ska tillämpas på olika truckfamiljers dynamiska bilder; valpanelen överlappar inte bildytan i den nu markerade ramen.",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Val",
    figma:
      'Rutnät med textstorlek M (6 val), staplade med S (2 val); på Mobile två per rad även med "FRÅN 169TKR"',
    code: 'Rutnät när en grupp har fler än två val, annars staplade; under Tablet staplade när något pris är längre än "+3500 kr" (`choiceLayout`)',
    why: 'Långa priser tryckte ihop titlarna ("1.5 / ton") i halva bredden',
    status: "Beslut",
    date: "2026-10-05",
  },

  {
    target: "configurator",
    topic: "Trucktyp",
    figma: "Inte ritat; ram 15 börjar med lyftkapaciteten som `[01]`",
    code: 'Valet av truckfamilj är första steget, `[01]`, med familjerna som `Choice` med bild och "Från"-pris; familjens steg följer som `[02]` och framåt',
    why: "Familjeval behövs när /configurator öppnas utan family i URL:en. Startsidan kan nu välja familjen genom sina direktlänkar, som går direkt till familjens första konfigurationssteg.",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Före familjen",
    figma: "Inte ritat",
    code: 'Totalpriset visar "Från" och familjernas lägsta pris; pris-/kontaktytan behåller platsen även utan truckbild. "Boka samtal" är inaktiv tills en familj är vald',
    why: "Samtalet behöver en familj",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Rubriker",
    figma: 'Rutan heter som steget ("Välj lyfthöjd")',
    code: "Stegets rubrik när steget har en grupp, annars gruppens namn i varje ruta",
    why: "Steg med flera grupper (gaffellängd och sidoförskjutning)",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Finansiering",
    figma: "Inte ritat",
    code: 'Ett eget steg: finansieringssätten som val med pris (kr eller kr/mån), serviceavtalet som en egen ruta när det går att välja, "Alla priser visas exkl. moms" som hjälptext och "Visa offert" i stället för "Nästa"',
    why: "Samma delar som stegen",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Val som kräver annat val",
    figma: "Inget läge",
    code: '`Choice` inaktiv och halvt genomskinlig, texten säger "Kräver ett annat tidigare val"',
    why: "Lucka i Figma",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Boka samtal",
    figma: "Knappen syns i varje steg; inget formulär ritat",
    code: 'Öppnar samtalsformuläret i en dialog (`<dialog>`), också från "Kontakta oss" i stegets hjälptext; konfigurationen följer med som den är, markerad som ofullständig om steg återstår',
    why: "Användarens beslut",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Sammanfattning",
    figma: "Ingen",
    code: "Den gamla sidopanelen (valda tillval, artikelnummer, broschyr) är borttagen; valen syns i offerten",
    why: "Figma har bara totalpriset",
    status: "Antagande",
  },
];
