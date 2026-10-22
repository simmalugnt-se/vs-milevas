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
 * - `Beslut (teknisk)`: how the code carries out what Figma shows; does not change the look.
 * - `Antagande`: our reading; applies until the designer says otherwise.
 * - `Lucka`: Figma seems to lack something (a state, a behaviour). The code follows Figma without
 *   it; `code` says what was there before or what it would take, so it can be added if wanted.
 * - `Platshållare`: temporary, to be replaced (search the code for `TODO(...)`).
 */
export type NoteStatus = "Beslut" | "Beslut (teknisk)" | "Antagande" | "Lucka" | "Platshållare";

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
      "Knappens och länkens hover flyttar pilen ett steg, och footerlänkens byter till texten under. Ska bytet animeras? Figmas `motion`-samling har tider och kurvor, men komponenterna visar inte vilka. Koden byter direkt.",
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
    target: "alternative",
    question:
      "Alternativen, kalendern och länkarna har inget fokusläge för tangentbord, som behövs för tillgänglighet: med tangentbordet syns det inte var man är. Hur ska det se ut? Koden har inget eget.",
    figma: "8882:12777",
  },
  {
    target: "alternative",
    question:
      "Kalendern visar inget valt läge för en tid, och alla tider är grå (`ui-tertiary`). Hur ser en vald tid ut, och finns det upptagna tider? Koden visar dem som Figma; den valda tiden syns bara i rutans text.",
    figma: "9207:25710",
  },
  {
    target: "alternative",
    question:
      "Kalenderns pilar ser likadana ut på första och sista dagen. Ska de se annorlunda ut där? Koden låter dem se ut som i Figma men göra ingenting.",
    figma: "9207:25710",
  },
  {
    target: "alternative",
    question:
      "Var kommer dagarna och tiderna i kalendern ifrån, och hur många dagar framåt ska man kunna välja? I dag skriver man en önskad tid som fritext.",
    figma: "9207:25710",
  },
  {
    target: "product-card",
    question:
      "Pilen i Hover ligger mitt i en 64 × 64-ruta (8px från kanten), men i hover-INLOGGAD är den 48 × 64 och ligger kant i kant. Ska de ligga likadant?",
    figma: "8268:2970",
  },
  {
    target: "product-card",
    question:
      "När är ett kort Active på Mobile, till exempel det som syns i slidern? Det avgör blocket som använder kortet.",
    figma: "9425:31341",
  },
  {
    target: "price-box",
    question:
      "Varje rad har en linje både upptill och nedtill, så mellan raderna blir linjen dubbelt så tjock. Avsiktligt?",
    figma: "9207:25676",
  },
  {
    target: "configurator-box",
    question:
      "Varje val har en egen ram, så linjen mellan två val, och mellan topbar och första raden, blir dubbelt så tjock. Avsiktligt? Tidigare drog koden en linje.",
    figma: "9250:32719",
  },
  {
    target: "configurator-box",
    question:
      "Rutnät med 2 stora bilder är 278px högt, så valen blir 234px; med 4 är valen 262px, som choice. Koden använder 262 i båda. Vilket gäller?",
    figma: "9250:33079",
  },
  {
    target: "footer",
    question:
      "Copyright-raden är svart (`#000`) utan variabel, inte `ui-primary` (`#121212`) som resten. Avsiktligt?",
    figma: "9264:22483",
  },
  {
    target: "footer",
    question:
      "Var ska man byta till engelska? Globe-ikonen finns inte längre i footern, och navigationen har inget språkbyte.",
    figma: "9264:22371",
  },
  {
    target: "contact-form",
    question:
      "order numrerar fälten 01, 02, 04 och 05. Saknas fält 03, och ska det finnas ett meddelandefält som i call och contact?",
    figma: "9321:45053",
  },
  {
    target: "contact-form",
    question:
      'call och contact har platshållarrubriker ("Heading") på alla fält, och call har knapptexten "Skicka avtal för signering" från order. Vilka rubriker och vilken knapptext ska de ha?',
    figma: "9321:47587",
  },
  {
    target: "contact-form",
    question:
      'I call står ett alternativ ("Text") bredvid kalendern. Är det två val, till exempel "så snart som möjligt" och "välj tid", och hur visas det valda?',
    figma: "9321:47587",
  },

  // Blocks
  {
    target: "navigation",
    question:
      "I Modeller har den andra kolumnen med länkar 8px mellan länkarna, den första ingen. Avsiktligt?",
    figma: "9051:12686",
  },
  {
    target: "navigation",
    question: "Chevronen i dragspelet är 1px på Mobile och 2px på Tablet. Vilken gäller?",
    figma: "9051:12754",
  },
  {
    target: "navigation",
    question:
      "Varje rad i dragspelet har en linje både upptill och nedtill, så mellan raderna blir linjen dubbelt så tjock. Avsiktligt?",
    figma: "9051:12754",
  },
  {
    target: "product-grid",
    question:
      "Mobile är en slider där det första kortet är gult med pil och priser och de andra grå utan priser. Ska kortet som syns bli gult, eller är det bara ett exempel på hover? Product-card har nu ett Active-läge för Mobile; koden visar tills vidare alla kort i Default.",
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
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "colors",
    topic: "Primitiver",
    figma:
      "`---primitives` (läget Value): palett med nyans och opacitet, som `color/neutral/700/100`",
    code: "`--primitive-neutral-700-100` i `:root`, utan Tailwind-klasser; temafärgerna pekar på samma primitiv som i Figma",
    why: "Komponenterna använder temafärgerna, som i Figma",
    status: "Beslut (teknisk)",
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
    target: "product-card",
    topic: "Länken och info-knappen",
    figma: "Hela kortet är klickbart och har `truckinfo`, en knapp, vid specifikationerna",
    code: "Namnet är länken och täcker kortet (`after:absolute`); info-knappen ligger ovanpå. Utan `info` är ikonen ingen knapp",
    why: "En knapp får inte ligga i en länk",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Stänga infotexten",
    figma: "`clicked` visar texten; inget om hur den stängs",
    code: "Ett nytt klick på ikonen döljer den",
    why: "Inte ritat; klick utanför eller Escape skulle behöva läggas till",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "configurator-topbar",
    topic: "Ram",
    figma: "Ett streck inuti (`stroke/width`) runt hela topbar, rundat bara upptill",
    code: "En ring inuti, så att topbar är Figmas 44px hög",
    why: "En vanlig ram hade gjort den högre",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "price-box",
    topic: "Linjer",
    figma: "Ramen och radernas linjer är streck inuti (`stroke/width`)",
    code: "Ramen är en kontur inuti och radernas linjer skuggor inuti, så att rutan är Figmas 109 och 193px höga",
    why: "Vanliga ramar hade gjort rutan högre",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "color-image-card",
    topic: "Proportion",
    figma: "518,667 × 388 i alla lägen",
    code: "Samma proportion (`aspect-[389/291]`); ingen fast storlek",
    why: "Fasta höjder undviks",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "color-image-card",
    topic: "Hover på gray",
    figma: "gray har bara Default",
    code: "Inget hover-läge för gray",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "color-image-card",
    topic: "Hover utan pekare",
    figma: "Bildläget visas vid hover; inget läge för pekskärmar eller tangentbord",
    code: "Bara hover, och `static` för bildläget hela tiden",
    why: "Inte ritat; på mobil syns bildläget bara som `static`",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "contact-form",
    topic: "Desktop och Mobile",
    figma: "`Device=Desktop` och `Device=Mobile`, utan brytpunkt",
    code: "Mobile under Tablet, Desktop från Tablet, där panelens 784px får plats",
    why: "Panelen är för bred för Mobile",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "contact-form",
    topic: "Panelens höjd",
    figma: "Panelen är fast 784 × 816 (Mobile 375 × 816), innehållet centrerat",
    code: "Figmas proportioner (`aspect-[784/816]`, `aspect-[375/816]`); blir innehållet högre växer panelen",
    why: "Fasta höjder undviks",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "contact-form",
    topic: "Kryss på Mobile",
    figma: "Mobile har inget kryss",
    code: "Inget kryss under Tablet. Ska formuläret kunna stängas där behövs ett kryss eller en annan väg",
    why: "Figma visar inget sätt att stänga på Mobile",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "contact-form",
    topic: "Fälten i Dark",
    figma: "I contact är rubrikerna ljusa (Dark) men fälten ljusgrå",
    code: "Fältens ruta är alltid i Light (`mode-light`), rubriken följer läget runt fältet",
    why: "Så ser det ut i Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "contact-form",
    topic: "Meddelandefältet",
    figma: "Ett formfält med fyra tomma rader, ingen dragkant",
    code: "`TextAreaField`: fyra rader Text XS (72px), utan dragkant",
    why: "Så ser det ut i Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Animation vid hover",
    figma: "Default och hover (pilraden ett steg åt vänster), ingen rörelse mellan dem",
    code: "Byts direkt. Tidigare gled pilen 300 ms (`duration-short`, `ease-slow-out`) och fyllningen tonade över 150 ms (`transition-colors`)",
    why: "Figma visar lägena men inte rörelsen; se frågan om animation",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "links",
    topic: "Animation vid hover",
    figma: "Link: pilraden ett steg; footerlink: texten utrullad. Ingen rörelse mellan lägena",
    code: "Byts direkt. Tidigare gled länkens pil och footerlänkens text rullade 300 ms (`duration-short`, `ease-slow-out`), och footerlänken visade hover-läget även vid tangentbordsfokus",
    why: "Figma visar lägena men inte rörelsen eller fokus; se frågorna",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Fokusläge",
    figma: "Inget läge för tangentbordsfokus på alternativen",
    code: "Inget. Tidigare en 2px kontur i `ui-primary`, 2px utanför rutan",
    why: "Behövs för tillgänglighet men finns inte i Figma; se frågan",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Vald tid i kalendern",
    figma:
      "Alla tider ser likadana ut (`ui-tertiary`, ram `border-primary`); inget valt läge och ingen hover",
    code: "Den valda tiden syns bara i rutans text. Tidigare fick den vald tid ram `border-secondary` och text `ui-primary`, och tiderna blev `ui-primary` vid hover",
    why: "Ett val utan synlig markering; se frågan",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Kalenderns pilar på första och sista dagen",
    figma: "Pilarna ser alltid likadana ut",
    code: "Ser ut som i Figma men gör ingenting. Tidigare var de grå (`ui-tertiary`) där",
    why: "Figma visar inte första och sista dagen; se frågan",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Kalendern innan en tid valts",
    figma: "Texten i rutan är `ui-primary`; inget tomt läge",
    code: 'Platshållartexten ("Välj tid") i `ui-primary`. Tidigare var den grå (`ui-tertiary`), som formfältens',
    why: "Figma visar inget tomt läge",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Fokus",
    figma: "Inget fokusläge",
    code: "Inget. Tidigare visade kortet hover-läget (gult, pil och priser) vid tangentbordsfokus",
    why: "Figma visar inget fokusläge; se frågan om fokus",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Färgövergång vid hover",
    figma: "Default och hover, ingen rörelse mellan dem",
    code: "Byts direkt. Tidigare tonade färgen över 150 ms (`transition-colors`)",
    why: "Figma visar inte rörelsen",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "truck-column",
    topic: "Färgövergång vid hover",
    figma: "Default och active, ingen rörelse mellan dem",
    code: "Byts direkt. Tidigare tonade färgen över 150 ms (`transition-colors`)",
    why: "Figma visar inte rörelsen",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Färgövergång",
    figma: "Default och active, ingen rörelse mellan dem",
    code: "Byts direkt. Tidigare tonade färgen över 150 ms (`transition-colors`)",
    why: "Figma visar inte rörelsen",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Hover och färgövergång",
    figma: "Inga hover-lägen för menylänkarna",
    code: "Ingen hover. Tidigare blev länken `ui-primary` vid hover och tonade över 150 ms (`transition-colors`)",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Alternativ som radioknapp",
    figma: "`form-alternative` är en knapp med `Default` och `Active`, med eller utan rubrik",
    code: "`Alternative`: en dold radioknapp i rutan; vald är Active. Inget fokusläge, som i Figma (se frågan)",
    why: "Ett av flera alternativ; samma som samtalsformulärets val av tid",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "alternative",
    topic: "Kalendern",
    figma:
      "`calendar-close` 60px högt, `calendar-open` med dag, pilar (gamla `icon-arrow-right`, 12px) och tider fyra per rad; kalendern är fast 230px bred i en 234px bred ruta, så den har 16px luft till vänster och 20px till höger",
    code: "`TimePicker`: stängd tar chevronen 12px i raden så att rutan blir 60px; pilarna är Figmas gamla 12px-pil (`arrow-right-s`), vänd för vänster; kalendern är 4px smalare än rutan till höger, som i Figma; vald dag och tid skickas som text",
    why: "Ingen fast höjd; samtalsförfrågan sparar önskad tid som text",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
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
    code: "Bara en markering. Om krysset ska tömma fältet behöver det bli en knapp",
    why: "Figma visar inte vad krysset gör",
    status: "Lucka",
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
    target: "choice",
    topic: "Financiering som egen komponent",
    figma:
      "`Type=Financiering` och `Financiering-02` är varianter av choice; valt har Financiering ett reglage för avtalslängd",
    code: "`FinancingChoice`: huvudet är knappen och reglaget ligger i en panel under den",
    why: "Ett reglage kan inte ligga inuti en knapp",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Reglagets lägen",
    figma: "Reglaget ritat i ett läge; inget fokus-, hover- eller dragläge",
    code: "Ett osynligt range-fält över det ritade reglaget tar mus, pek och tangentbord, men fokus syns inte",
    why: "Inte ritat; för tangentbordet behövs ett synligt fokusläge",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Höjd med bild",
    figma: "`image=big` är 262px och `image=small` 140px höga, som 234,5, 368 och 469px breda val",
    code: "Samma höjder i rem (`h-[16.375rem]`, `h-[8.75rem]`), som skalar med sidan; big-bilden fyller rummet mellan titel och text",
    why: "Figma håller höjden fast när valet blir bredare, så en proportion hade gett fel höjd i de andra bredderna",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Långa titlar och priser",
    figma: "Titeln tar platsen bredvid priset och radbryts där; ett ord som inte får plats bryts",
    code: "Som Figma. Tidigare flyttades priset till en rad under titeln när de inte fick plats bredvid varandra, och långa ord avstavades (`hyphens-auto`)",
    why: 'Inte ritat; långa namn och priser (trucktypen, "FRÅN 169 900 KR") blir trånga när rutan är smal, till exempel från Desktop S till ungefär 1300px',
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Fokus",
    figma: "Inget fokusläge",
    code: "Webbläsarens egen fokusram",
    why: "Inte ritat; ett eget fokusläge skulle behöva ritas",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Ej valbart",
    figma: "Inget läge för ett val som inte går att välja",
    code: "Knappen är `disabled` men ser ut som Default och blir gul vid hover. Tidigare halv opacitet och en förbjuden-markör",
    why: "Inte ritat; konfiguratorn har val som kräver ett annat val först",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Ram",
    figma: "Varje val har ett eget streck inuti (`stroke/width`) runt om",
    code: "En ring inuti, så att valet är Figmas 90 och 99px högt. Linjer mellan valen i en box sätter configurator-box",
    why: "En vanlig ram hade gjort valet högre",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Lägen per enhet",
    figma:
      "Desktop: Default, Hover och hover-INLOGGAD; tablet: pil och priser utan hover; Mobile: Default och Active",
    code: 'Mobile under Tablet, tablet till Desktop S, Desktop från Desktop S. Active med `data-state="active"` (bara Mobile), inloggad med `loggedIn`; hover bara på Desktop',
    why: "Komponentens lägen per enhet",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Storlek",
    figma:
      "430 × 507 i alla komponentens lägen; instanserna i product-grid är 507px höga i andra bredder",
    code: "Komponentens proportion, 430:507, i alla lägen och bredder. Tidigare product-grids instanser (339–469:507), som gjorde bilden för liten vid hover",
    why: "Komponenten gäller; inga fasta höjder. Blockets bredder tas när product-grid gås igenom",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "product-card",
    topic: "Stabil layout vid hover",
    figma: "Pil och priser visas i hover-läget",
    code: "Kortets yttre proportioner bestämmer höjden. Innehållet ligger i en absolut positionerad flex-layout; bilden krymper när pil och priser visas",
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
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Läge i blocken",
    figma: "Blocken använder knappkomponentens fyra färger",
    code: 'Mörka knappar på ljus botten har `mode="dark"`, gula `mode="tejp"`',
    why: "Samma utseende som förut, tills blocken ritas med lägen",
    status: "Antagande",
    date: "2026-10-21",
  },
  {
    target: "buttons",
    topic: "Ram",
    figma: "`border=true` (bara på Tejp secondary): `stroke/width` i `BTN/secondary/border`",
    code: "`border`-prop på secondary, ritad som en ring inuti knappen (`ring-inset`) så att storleken är oförändrad; primary har ingen ram, som i Figma",
    why: "Figmas ram ligger inuti; propen följer komponenten",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "card",
    topic: "Färger",
    figma:
      "Texten `color/ui/primary` (`#f0f0f0`), brödtexten den gamla `Color/UI/inv-primary`; gradienten `rgba(0,0,0,.4)` → `.2` utan variabel",
    code: "Kortet i Dark (`ui-primary` för både text och brödtext), etiketten i Tejp, gradienten svart 40 % → 20 %",
    why: "Samma färg; gradienten har ingen variabel",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "Mobil",
    figma: "Ritad bara i Desktop-bredd (469px)",
    code: "Samma layout i alla bredder; `mobileLayout` staplar ett rutnät under Tablet när konfiguratorn ber om det (beslutet om långa priser vid configurator)",
    why: "Inte ritat; en ritad mobilvariant skulle behövas för att veta om valen ska staplas",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "Udda antal val i rutnät",
    figma: "Rutnät ritat med 2, 4 och 6 val",
    code: "Med ett udda antal står det sista valet ensamt till vänster, med båda nederhörnen rundade",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "Smala val med stor bild",
    figma:
      "Den stora bilden behåller sin höjd och går ut över valets sidomarginal när valet är 234,5px brett (rutnät)",
    code: "Som Figma",
    why: "Inte ritat smalare än så; i ännu smalare val skulle bilden kunna gå utanför valet",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "Serviceavtalets kryssruta",
    figma:
      '`CheckboxChoice` ("Lägg till serviceavtal") är bara ritad omarkerad; ett dolt textlager finns under raden',
    code: "En riktig kryssruta som ser likadan ut ikryssad som omarkerad; den dolda texten visas inte",
    why: "Inte ritat; ett ikryssat läge behövs för att se valet, och kanske texten när avtalet är valt",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "När serviceavtalet visas",
    figma: "Under boxen i click-01 och click-02, inte i default och click-03",
    code: "`addon` visar det som konfiguratorn skickar in; boxen avgör inte när",
    why: "Vilka finansieringar som har serviceavtal bestäms i konfiguratorn",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "configurator-box",
    topic: "Hörn",
    figma: "Valen i sista raden har rundade nederhörn (`radius-sm`) mot boxens kant",
    code: "Boxen rundar hörnen på sista raden, så att valen inte behöver veta var de står",
    why: "Samma utseende oavsett antal val",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "truck-column",
    topic: "Linje",
    figma: "`color/bg/fill` i Tejp (gul), `stroke/width` bred",
    code: "Kolumnen är i Tejp; linjen är `border-bg-fill`, `stroke/width` bred",
    why: "Som i Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
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
    topic: "Scroll-läget",
    figma:
      '`Acitve+scroll`: "Skrolla" (Label L) under `arrow-up&down` vriden, 38,4 × 24, `spacing/5xl` från toppen',
    code: "`scrollLabel` visar tipset i aktivt läge; pilen är `up-down` i 24 × 38,4, vriden",
    why: "Läget beskriver inte när det gäller; det avgör blocket",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "truck-column",
    topic: "Fokus",
    figma: "Inget fokusläge",
    code: "Inget. Tidigare blev kolumnen aktiv vid tangentbordsfokus",
    why: "Figma visar inget fokusläge",
    status: "Lucka",
    date: "2026-10-21",
  },

  // Blocks
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
    topic: "Menyknappen",
    figma:
      '"[Meny]" både stängd och öppen; vilket dragspel som är öppet när menyn öppnas är inte ritat, inte heller att alla är stängda',
    code: 'Samma text i båda lägena. Menyn öppnas med det första dragspelet utfällt; ett klick på det öppna stänger det. Tidigare stod "Stäng" när menyn var öppen',
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
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
    figma:
      "Genomskinlig rad med `Color=Dark` (ljus text) och `Color=Light` (mörk text); inte när vilken används, eller hur raden ser ut över innehåll när sidan skrollas",
    code: "`color` väljer läge; sajten använder Dark, eftersom sektionerna är mörka",
    why: "Inte ritat; raden har ingen bakgrund, så texten kan hamna över ljust innehåll vid scroll",
    status: "Lucka",
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
    figma:
      'Menyerna Modeller, Tjänster och Om oss, med länkar och en bild, och länken "Dealer login"',
    code: 'Header-globalens `navItems` är menyerna: etikett, länkar (med en bild per länk) och en bild; utan länkar är menyn en vanlig länk. `login` är login-länken med en kort etikett. `cta` ("Bygg din truck") finns kvar i globalen men visas inte, och inte heller `siteName` och `siteTagline`',
    why: "Fälten följer Figma; `cta` tas bort ur globalen först när innehållet inte behövs",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "navigation",
    topic: "Testinnehållet",
    figma: "Länkar till sidor som modellerna, tjänsterna och login",
    code: "`pnpm seed:globals` fyller i Figmas menyer och truckbilder lokalt; länkarna går till startsidans sektioner och login till `/login`, som inte finns än",
    why: "Sidorna finns inte än",
    status: "Platshållare",
    date: "2026-10-22",
  },
  {
    target: "navigation",
    topic: "Stänga menyn",
    figma: "Öppen meny med en mörk overlay över resten av sidan; inget om hur den stängs",
    code: 'Ett nytt klick på menyn (på Desktop) eller på "[Meny]" stänger den; klick på overlayn eller Escape gör inget',
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Truckbilderna",
    figma:
      "`Truck=1` till `6`: på Desktop S och L blir länken man pekar på `ui-brand`, de andra `ui-tertiary`, och trucken visas i rutan",
    code: "Bara vid hover med pekaren, inte vid tangentbordsfokus, och inte i dragspelet på Tablet och Mobile; en länk utan egen bild ändrar ingenting",
    why: "Inte ritat för fokus eller mindre skärmar",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Öppna med hover",
    figma: "Öppna lägen, men inte om de öppnas med klick eller hover",
    code: "Klick",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Öppen i Light",
    figma: "De öppna lägena finns bara i Dark",
    code: "Öppen blir navigationen Dark, även när `color` är Light",
    why: "Inte ritat; panelen (`navigation-fill`) är mörk",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Många länkar",
    figma: "Menyer med tre och sex länkar",
    code: "Fler än tre länkar delas i två kolumner, den första med hälften (avrundat uppåt)",
    why: "Inte ritat med fler än sex",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Aktiv länk",
    figma: "Inget läge för sidan man är på",
    code: "Bara `aria-current`; tidigare var den aktiva länken mörk och de andra grå",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-21",
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
    topic: "Data",
    figma:
      "Kolumnerna Produkter och Tjänster, kolumnen Kontakt (e-post, telefon, ort) och copyright-raden",
    code: 'Footer-globalens nya `linkGroups` (rubrik och länkar), `contactHeading`, `email`, `phone` och `location`, och `copyright` efter "© år"; året sätts automatiskt. `navItems` finns kvar men visas inte. `pnpm seed:globals` fyller i Figmas innehåll lokalt',
    why: "Fälten följer Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "footer",
    topic: "Länkarnas höjd",
    figma: "footerlink har en fast höjd i footern: 25px på Mobile och Tablet, 38px från Desktop S",
    code: "Samma höjder i rem (`h-[1.5625rem]`, `h-[2.375rem]`) med texten centrerad; orten likadant",
    why: "Figma ritar höjden fast, inte som luft runt texten",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "footer",
    topic: "Logotypen",
    figma:
      "Logotypens ruta går ut till kortets högra kant, men vektorn slutar `spacing/sm` (16px) innan och är då hoptryckt på bredden (811 × 95,7 i en ruta på 827 × 95,7 vid 1440)",
    code: "Logotypen `spacing/sm` från högerkanten i sina rätta proportioner, alltså 93,8 i stället för 95,7 hög; kortet blir 2px lägre",
    why: "Samma marginal som i Figma utan att logotypen förvrängs",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "footer",
    topic: "Språkbyte",
    figma: "Ingen globe-ikon eller annat språkbyte, varken i footern eller i navigationen",
    code: "Inget språkbyte på sajten. Tidigare bytte globe-ikonen i footern mellan svenska och engelska; den engelska sajten nås nu bara via adressen (`/en`)",
    why: "Inte ritat; ett språkbyte behöver en plats i designen",
    status: "Lucka",
    date: "2026-10-22",
  },
  {
    target: "footer",
    topic: "Hover",
    figma:
      "Footerlänkarna rullar fram en kopia vid hover på Desktop; e-post och telefon är footerlänkar, orten vanlig text",
    code: "Som Figma; ingen övergång mellan lägena och inget fokusläge",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-22",
  },
  {
    target: "footer",
    topic: "Fler kolumner",
    figma: "Två länkkolumner och kontaktkolumnen",
    code: "Globalen tar högst två länkkolumner",
    why: "Inte ritat med fler",
    status: "Lucka",
    date: "2026-10-22",
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
    code: "Alla kort i product-cards Mobile Default: grå utan pil och priser; blocket sätter inte Active än",
    why: "Blocket gås igenom för sig; se frågan ovan",
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
