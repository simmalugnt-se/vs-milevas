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
      "Heron har nu sex kolumner, en per trucktyp som produktkorten, men Figmas hero-ramar visar fem. Ska ramarna ritas om med sex? Plocktruckar behöver också en större frilagd bild.",
    figma: "8539:7103",
  },
  {
    target: "hero",
    question:
      'Den aktiva kolumnen visar i Figma "Bygg din Truck:" i Display XS och priserna i Text XS/S på rader, men i Make-prototypen rubriken och priserna i 24px bredvid varandra. Vilken gäller? Koden följer Figma.',
    figma: "8539:7104",
  },
  {
    target: "hero",
    question:
      "Introt stannar på den sista kolumnen i Make-prototypen, men Figma visar den tredje gul. Vilken kolumn ska vara aktiv efter introt? Koden låter Payload välja (testet: den sista).",
    figma: "8539:7104",
  },
  {
    target: "hero",
    question:
      "Mobile: den första kolumnen är 283px bred och de andra 299 (Tablet 482 och 498), och prototypen använder 314. Vilken bredd gäller? Koden ger alla samma bredd: på en telefon så att kanten hamnar mitt mellan Login och [Meny], annars Figmas 79,73 % respektive 498.",
    figma: "8539:7128",
  },
  {
    target: "text-block-columns",
    question:
      "Strecken i prototypen ligger på 372, 744 och 1068px, men Text block Collumns har fyra lika breda kolumner (360, 720, 1080). Koden följer blocket. Stämmer det?",
    figma: "9321:52209",
  },
  {
    target: "text-block-columns",
    question:
      "Ska strecken flyttas på Tablet och Mobile också? Där är heron en lista man scrollar i sidled, och prototypen finns bara för desktop.",
    figma: "8982:9918",
  },
  {
    target: "image-text",
    question:
      "Image & Text: Desktop L och S är 1424 och 1264px breda, 16px smalare än sidan, men Tablet och Mobile är hela bredden. Ska fotot gå kant i kant som de andra blocken, eller ha 8px marginal (`grid/margin`) på desktop?",
    figma: "9098:16639",
  },
  {
    target: "hero",
    question:
      "Navigationen (Dark, ljus text) ligger över heron, och över en gul kolumn syns texten knappt. Prototypen döljer navigationen. Ska den byta färg, eller få en bakgrund, över heron?",
    figma: "8539:7104",
  },
  {
    target: "general",
    question:
      'Ramen "blabla" på "02 — Components" (text-box, truck-column): när är den klar, och vad ska den heta?',
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
    target: "motion",
    question:
      "Prototypens tider och kurvor skiljer sig per komponent: knappen 0,18 s `cubic-bezier(0.76, 0, 0.26, 1)`, footerlink 0,18 s `cubic-bezier(0.688, 0, 0.33, 1)`, product-card 0,2 s `cubic-bezier(0.81, 0, 0.28, 0.99)`, color-image-card 0,3 s `cubic-bezier(0.796, 0, 0.3, 1)`, Financiering 0,18 s `ease-out` och navigation 0,6 s `cubic-bezier(0.9, 0, 0.17, 1.01)`. Ingen använder `motion`-variablerna. Ska de, eller gäller prototypens värden?",
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
    target: "alternative",
    question:
      "Alternativen, kalendern och länkarna har inget fokusläge för tangentbord, som behövs för tillgänglighet: med tangentbordet syns det inte var man är. Hur ska det se ut? Koden har inget eget.",
    figma: "8882:12777",
  },
  {
    target: "alternative",
    question:
      "Kalendern visar inget valt läge för en tid, och alla tider är grå (`ui-tertiary`). Koden ger den valda tiden svart text och ram; stämmer det, och finns det upptagna tider?",
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
      "När är ett kort Active på Mobile, till exempel det som syns i slidern? Prototypen byter till Active vid Mouse enter och tillbaka vid Mouse leave, men en pekskärm har ingen pekare. Det avgör blocket som använder kortet.",
    figma: "9425:31341",
  },
  {
    target: "product-card",
    question:
      "Prototypen har en Mouse leave från `State=Default, Device=tablet` till ett läge utan pil och priser, fast Tablet annars alltid visar dem. Ska Tablet ha hover, eller är övergången en rest?",
    figma: "8268:2970",
  },
  {
    target: "color-image-card",
    question:
      "Vid hover krymper fotot på White och Tejp från 609 × 456 till kortets storlek medan det tonar in; på gray tonar det bara in. Ska gray göra som de andra?",
    figma: "8825:10793",
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
    target: "grids",
    question:
      "Grid med 4 platser visar bara 3 platser på Mobile. Ska alla 4 ligga under varandra, som koden gör?",
    figma: "8389:4739",
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

  // Blocks
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
    target: "product-grid",
    question:
      "Product-Grid har ingen bakgrund i Figma, så det som ligger bakom syns mellan korten. Ska det vara mörkt (Dark `bg-fill`), som koden har, eller sidans bakgrund?",
    figma: "8365:8988",
  },
  {
    target: "card-slider",
    question:
      "Hur bläddrar man i slidern med en mus? Figma visar inga pilar eller annan kontroll, och utan styrplatta går det bara med tangentbordet eller Skift och hjulet.",
    figma: "8946:8317",
  },
  {
    target: "card-slider",
    question:
      "På Tablet och Mobile visar det första kortet bildläget. Ska det vara så bara för det första, eller för kortet som syns, eller för alla på en pekskärm?",
    figma: "8946:8350",
  },
  {
    target: "contact",
    question:
      'Formulärets fält heter "Heading" med "Supporting text". Koden har Namn *, Företag, E-post *, Telefon och Meddelande *, utan platshållare. Stämmer det?',
    figma: "9098:22568",
  },
  {
    target: "contact",
    question:
      "Vad ska synas när meddelandet är skickat, och när det inte gick att skicka? Koden visar ett tack i formulärets ställe och felet ovanför knappen.",
    figma: "9098:22568",
  },
  {
    target: "contact",
    question:
      "Vilka sidor ska Facebook och Linkedin leda till? Koden har platshållare som går att ändra i sidfotens inställningar.",
    figma: "9098:22568",
  },
  {
    target: "contact",
    question:
      "På Desktop L är raderna fast 684px breda, mellan kolumn 5 och 6; på Desktop S går de över kolumn 1–6. Ska de gå över kolumn 1–6 på Desktop L också, som koden har?",
    figma: "9098:22569",
  },
  {
    target: "login",
    question:
      'Skapa konto har knappen "Logga in" och frågar bara efter e-post och lösenord. Ska knappen heta "Skapa konto", och behövs fler fält (namn, företag)?',
    figma: "9170:26943",
  },
  {
    target: "login",
    question:
      'Vad händer efter inloggningen, vid fel lösenord och vid "Jag har glömt mitt lösenord"? Figma visar inga sådana lägen.',
    figma: "9170:26321",
  },
  {
    target: "text-boxinfo",
    question:
      'Tablet och Mobile: "390kr/mån" i rubriken har storleken 96px, resten 64 och 48px. Det syns inte i skärmdumpen; koden använder rubrikens storlek för hela raden.',
  },
  {
    target: "configurator",
    question:
      "Figma visar ett foto som fyller bildytan och beskärs olika per läge. Ska trucktypens huvudbild beskäras så, eller ska hela trucken synas? Koden visar tills vidare hela (object-contain).",
    figma: "9264:6654",
  },
  {
    target: "configurator",
    question:
      '"Skicka" i offerten är mörk på Desktop och grå på Tablet och Mobile. Vilken ska den vara?',
    figma: "9264:10759",
  },
  {
    target: "configurator",
    question:
      "Popupen har inget bakom sig, så sidan syns som vanligt. Ska sidan tonas ner, och ska ett klick utanför stänga?",
    figma: "8882:14589",
  },
  {
    target: "configurator",
    question:
      'Trucktypssteget, när /configurator öppnas utan vald truck, är inte ritat. Koden visar trucktyperna som typ 4 i ett bredare steg (7 av 12 kolumner), två per rad när rutan är minst 45rem bred och annars en per rad; långa namn bryts där redaktören satt `|` ("Skjutstativ|truckar"). Hur ska steget se ut?',
    figma: "9264:6653",
  },
];

export const figmaNotes: FigmaNote[] = [
  {
    target: "general",
    topic: "Sidans bakgrund och luckorna",
    figma:
      "Sidmallarna (05 — Pages) har 8px mellan blocken och före sidfoten, där sidans bakgrund syns: mörk på Startsida, Om oss och Login, ljusgrå på Konfigurator",
    code: "Samma. Varje sida i Payload har Background (Dark som standard, eller Light grey); Login är mörk i koden. Sidor utanför Payload, som kitchensink, är kvar på vit",
    why: "Sidfotens kanter och luckorna fick annars fel färg",
    status: "Beslut",
    date: "2026-10-23",
  },
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
    target: "text-block-columns",
    topic: "Strecken efter heron",
    figma:
      "Startsidesprototypen (Pages, MacBook Air 109 → 110): ett lager med kolumner står kvar medan innehållet glider upp, och ändrar bredderna från heronas till text blockets. On click → Smart animate, 2600 ms, `cubic-bezier(0.82, 0, 0.22, 1)`; i 111 följer strecken med text blocket upp",
    code: "Två block i Payload. Ligger text blocket direkt efter heron, och heron har två kolumner fler (sex och fyra), delar de ett lager streck (`LinkedColumns`) som följer scrollen med prototypens kurva, från att text blocket syns i underkant tills det når toppen, och sedan går upp med det. Heronas kolumner byter bredd i samma takt: den första och sista krymper till inget och de andra blir text blockets, så en gul kolumn växer med sina streck. Med andra antal kopplas blocken inte ihop. Blockens egna streck döljs från Desktop S",
    why: "Användarens val 2026-10-22: blocken ska kunna användas var för sig, antalet kolumner ska stämma så att övergången blir naturlig, och på en riktig sida scrollar man i stället för att klicka",
    status: "Beslut",
    date: "2026-10-22",
  },
  {
    target: "text-block-columns",
    topic: "Strecken på Tablet och Mobile",
    figma: "Prototypen finns bara för desktop",
    code: "Under Desktop S har varje block sina egna streck, utan rörelse",
    why: "Inte ritat; se frågan",
    status: "Lucka",
    date: "2026-10-22",
  },
  {
    target: "text-block-columns",
    topic: "Rubrikens läge och höjden",
    figma: "Rubriken börjar 191, 220, 331 och 226px ner i ramarna 832, 832, 1000 och 800 höga",
    code: "Samma andel av höjden (23, 26, 33 och 28 %), och blocket är `100svh` högt, minst 37,5rem, som heron",
    why: "Ramarna är skärmhöga och blocket ska fylla skärmen när strecken flyttas",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "text-block-columns",
    topic: "Logotyperna",
    figma:
      "Desktop: KION 116, STILL 131, Linde 147 och Baoli 108px breda; Tablet 90 och Mobile 60px alla. Lindes bild är beskuren upptill",
    code: "Bredden på desktop är ett fält per logotyp i Payload (Figmas bredder i testet); Tablet och Mobile som Figma. Lindes bild visas hel, nederkanten i linje som i Figma",
    why: "Logotyperna har olika form och Figma ger dem egna bredder",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "text-block-columns",
    topic: "Avstavning på Mobile",
    figma: '"Ett varu-märke inom" på Mobile',
    code: "Rubriken avstavas automatiskt under Tablet (`hyphens-auto`), så texten skrivs utan bindestreck",
    why: "Samma text i alla bredder",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "image-text",
    topic: "Bredden",
    figma: "Desktop L 1424 och Desktop S 1264px breda, Tablet 800 och Mobile 375",
    code: "Kant i kant i alla bredder, som de andra blocken; textens kolumner (3–10 av 12) räknas från den bredden",
    why: "Tablet och Mobile är hela bredden, och ingen annan ram är smalare än sidan; se frågan",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "image-text",
    topic: "Höjden",
    figma: "800px i alla fyra lägen",
    code: "Minst 50rem, och växer om texten blir längre",
    why: "Redaktörens text kan bli längre än Figmas",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "image-text",
    topic: "Lagret över fotot",
    figma:
      "Svart med 65 % opacitet, utan variabel; luften upptill och nedtill är `shape/radius-lg`",
    code: "Samma svarta lager som ett fast värde; luften är `spacing/sm`, som har samma värde (16px)",
    why: "Ingen färgvariabel finns för lagret, och en radie är inte ett avstånd",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "image-text",
    topic: "Fotot",
    figma: "Ett foto, 4096 × 2734px, beskuret med `object-cover` i alla lägen",
    code: "Bildfält i Payload, beskuret likadant. Testets foto är Figmas, förminskat till 2880px",
    why: "Samma utsnitt som Figma; 2880px räcker för Desktop L på skärmar med dubbel upplösning",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "hero",
    topic: "Sex kolumner",
    figma:
      "Hero-ramarna och Make-prototypen har fem kolumner; startsidesprototypen sex, som blir text blockets fyra när man scrollar",
    code: "Testet har sex, en per trucktyp: prototypens fem truckar och Plocktruckar, med bilden från Figmas product-grid (512px, beskuren)",
    why: "Användarens val 2026-10-22: sex kolumner går naturligt till fyra, och det finns sex trucktyper",
    status: "Beslut",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Figma och prototypen",
    figma:
      'Hero-ramen har lägena Start och Collumns per bredd; beteendet, truckbilderna och etiketterna finns bara i Figma Make-prototypen "Recreate interactive hero section"',
    code: "Färger, typografi, kolumner och texter följer Figma; rörelsen, tiderna, truckarnas placering och etiketterna följer prototypen",
    why: "Användaren gav prototypen som beskrivning av hur heron ska bete sig",
    status: "Beslut",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Kolumnbredd på Mobile",
    figma: "Kolumnerna är 299px av 375 (79,73 %); den gula kolumnens kant hamnar då precis vid navigationens Login",
    code: "På en telefon hamnar kolumnens kant mitt mellan Login och [Meny] (4,0762rem från högerkanten), så att den gula kolumnen aldrig slutar vid Login. Från 657px slutar Figmas 79,73 % före Login med luft och gäller där; Tablet har Figmas 498 av 800",
    why: "Kanten ska ligga mellan knapparna eller före båda (beslut 2026-10-27)",
    status: "Beslut",
    date: "2026-10-27",
  },
  {
    target: "hero",
    topic: "Introt",
    figma:
      "Prototypen: rubriken visas i 1,2s, ett svep (0,85s) eller en scroll till slutet och tillbaka (0,85 och 0,95s), och 2s senare lyfts raderna ut på 0,5s med `cubic-bezier(0.65, 0, 0.35, 1)`, 0,12s mellan dem. Prototypens rubrik är 130px högt upp; Figmas Start har Display L mitt på höjden",
    code: "Desktop S och L: prototypens förlopp med Figmas Start-layout. Tablet och Mobile i en annan ordning: rubriken i 1,2s och sedan ut (rubriken radbruten som i Figma och lyft i ett stycke, sedan uppmaningen), därefter visas den första kolumnen, gul, från höger med sin truck, sitt namn och sina priser (clip-path, 0,6s med navigationens kurva), och listan knuffas direkt efter en tredjedel av en kolumn och tillbaka (0,7s åt varje håll) som en sista vink om att den går att scrolla. Med reducerad rörelse hoppas introt över",
    why: "Användarens beslut 2026-10-26: på mobil låg rubriken över gul kolumn, truck och priser i nästan fem sekunder, och listan for genom alla sex kolumner på under en sekund så att den gula kolumnen bytte var tionde sekund",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "hero",
    topic: "Truckarna på Desktop",
    figma:
      "Prototypen: varje kolumn klipper sin egen truck i en ruta på 420 × 420 med nederkanten 190px under punkten. Truckarna följer punkten med eftersläpning (9 % per bildruta, 5 % när de glider in eller tillbaka); kolumnen under punkten blir aktiv när punkten är 8px in i den",
    code: "Som prototypen, i rem (26,25 och 11,875rem). Lämnar pekaren heron går truckarna tillbaka till mitten av sina kolumner och ingen kolumn är aktiv; byter pekaren kolumn hoppar truckarna till den",
    why: "Så gör prototypen",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Etiketten vid pekaren",
    figma:
      "Prototypen: truckens namn i en mörk etikett med gul 1px ram och en 12px pil, 14px höger om och 200px under pekaren; den blir bara bredare. Muspekaren döljs",
    code: "Label S med ikonen `arrow-up-right` (16px) från Icons, `rounded-sm`, `spacing/xs` runt; bredden är det längsta namnet från början. Muspekaren döljs över heron",
    why: "Prototypens pil finns inte bland Figmas ikoner; samma bredd hela tiden ger samma resultat utan mätning",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Tablet och Mobile",
    figma:
      'Figma: kolumner i en rad som går utanför bilden, den första gul med "Skrolla". Prototypen: en snappande lista där trucken, namnet, priserna och tipset står still på skärmen medan kolumnerna glider under dem, och kolumnen som syns är gul',
    code: 'Som prototypen, med Figmas kolumnbredder (299 av 375 och 498 av 800). Trucken och namnet har prototypens storlek och höjd i förhållande till skärmen; "Skrolla" visas tills listan har rört sig 12 % av en kolumn',
    why: "Figma visar bara utgångsläget",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Höjd",
    figma: "1440 × 832, 1280 × 832, 800 × 1000 och 375 × 800",
    code: "`100svh` i alla bredder, minst 37,5rem (600px), som prototypen",
    why: "Heron fyller skärmen; på breda skärmar blev den breddstyrda höjden för hög (beslut 2026-10-07)",
    status: "Beslut",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Truckbilder",
    figma:
      "Inga bilder i Figma; prototypen har fem frilagda truckar i samma skala, och Plocktruckar finns bara i product-grid (512px)",
    code: "Kolumnen visar trucktypens huvudbild, nederkanten mot marken; testets trucktyper har prototypens bilder (`scripts/figma-homepage-assets/hero-*.png`). Tidigare hade varje kolumn ett eget bildfält",
    why: "Användarens beslut 2026-10-23: en huvudbild per trucktyp, som ändras på ett ställe",
    status: "Beslut",
    date: "2026-10-23",
  },
  {
    target: "hero",
    topic: "Aktiv kolumn efter introt",
    figma: "Figma visar den tredje kolumnen gul; prototypen stannar på den sista",
    code: '"Kolumnen introt stannar på" i Payload (standard 3, testet 5 som prototypen)',
    why: "Se frågan",
    status: "Antagande",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Rubrik och priser",
    figma:
      'Start: "Bygg din baoli" och "På typ 30 sekunder" i gult, och "Välj trucktyp för att börja"; kolumnerna har exempelpriser',
    code: "Rubriken är sidans h1 och finns kvar för skärmläsare när introt har gått; den gula raden och uppmaningen är egna fält. Pris och leasing från vald trucktyp och konfiguratorns finansieringsinställningar",
    why: "Riktigt CMS-innehåll och priser som följer konfiguratorn",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "hero",
    topic: "Tangentbord och pekskärm",
    figma: "Prototypen följer bara musen",
    code: "Kolumnerna är länkar till konfiguratorn; tangentbordsfokus och pekskärmar på Desktop-bredd aktiverar ingen kolumn",
    why: "Inte ritat",
    status: "Lucka",
    date: "2026-10-22",
  },
  {
    target: "product-grid",
    topic: "Truckdata och plocktruck",
    figma:
      'Sex kort med exempel på namn, specifikationer ("1.5 – 3.5 ton /// 80 V 228 Ah") och bilder',
    code: 'Varje kort är en trucktyp: namn, huvudbild, priser och länk därifrån; lyftkapaciteten som modellernas intervall ("1,5 – 3,5 ton", med decimalkomma) och specifikationerna markerade för produktkortet. Plocktruckar har platshållarvarianter som de andra och går att konfigurera (sedan 2026-10-26; tidigare länkade den till kontakt utan priser)',
    why: "Användarens beslut 2026-10-23: kategorierna ändras på ett ställe. Testets data är Figmas exempel och platshållare",
    status: "Beslut",
    date: "2026-10-23",
  },
  {
    target: "product-grid",
    topic: "Bildproportioner",
    figma: "Anpassade bildutsnitt per truck",
    code: "Trucktypens huvudbild visas alltid hel (object-contain) i kortets bildyta; inget val för passning eller utsnitt",
    why: "Användarens beslut 2026-10-26: huvudbilden är en frilagd truck och ska visas hel. Valen för passning och utsnitt användes inte och togs bort",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "text-grid",
    topic: "Testinnehåll",
    figma: "Tre etiketter med 01 och label, två texter med text",
    code: "01/02/03 och Bygg din truck/Få offert/Leverans; fotografierna från Figma, text-platshållarna kvar. Numret räknas fram ur kortets plats (sedan 2026-10-26), som i kortslidern",
    why: "Samma etiketter som kitchensink, redigerbara i Payload; numret följer ordningen så det inte kan bli fel",
    status: "Antagande",
    date: "2026-10-07",
  },
  {
    target: "text-boxinfo",
    topic: "Knappens mål",
    figma: '"Bygg din truck" med pil, inget mål angivet',
    code: 'Samma text i testet, länkad till konfiguratorn; text och mål går att ändra i Payload. Den lokala startsidan har kvar "Läs mer" till kontakt tills den ändras där',
    why: "Texten säger vart den leder",
    status: "Antagande",
    date: "2026-10-23",
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
    topic: "Card grid per läge",
    figma:
      'Komponenten Grid på "04 — Blocks" (8389:4440): 2 platser i bredd utom på Mobile, 3 i bredd från Desktop S och annars under varandra, 4 i bredd från Desktop S, 2 × 2 på Tablet och under varandra på Mobile',
    code: "`card-grid-2`, `card-grid-3` och `card-grid-4` likadant. Tidigare hade Tablet 2 per rad för alla tre, ett eget beslut innan Grid fanns; Product-Grid behåller sina 2 per rad på Tablet tills det blocket gås igenom",
    why: "Grid visar nu Tablet och Mobile",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
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
    target: "card-slider",
    topic: "Kortens storlek",
    figma:
      "518,67 × 388 på Desktop L och S (samma bredd), 455 × 388 på Tablet och 310 × 312 på Mobile",
    code: "Samma bredder och proportioner per läge (`--card-aspect`); höjden följer bredden",
    why: "Kortet har samma storlek i båda desktop-ramarna",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "card-slider",
    topic: "Rullning",
    figma: "Raden går ut över skärmens högra kant; inget om hur den flyttas",
    code: "Rullar i sidled och stannar vid varje kort, utan synlig rullningslist och utan pilar",
    why: "Inte ritat; se frågan",
    status: "Lucka",
    date: "2026-10-23",
  },
  {
    target: "card-slider",
    topic: "Första kortet",
    figma: "Tablet och Mobile visar det första kortet i bildläget, de andra i sina färger",
    code: "Samma under Desktop S; från Desktop S visar alla korten bildläget vid hover",
    why: "Följer Figma; se frågan",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "card-slider",
    topic: "Bakgrund och plats",
    figma: "Ingen bakgrund; Mobile-ramen är 385px bred",
    code: "Dark `bg-fill` bakom korten, som Product-Grid. På testets startsida ligger slidern efter Text & boxinfo",
    why: "Sidans vita bakgrund skulle synas mellan mörka block; platsen är inte ritad",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "text-block",
    topic: "Pilen på Mobile",
    figma: "`arrow-up&forward` vriden nedåt, 28 × 48, ovanför texten",
    code: "Samma pil (`up-forward`) vriden 90° i en 28 × 48-ruta",
    why: "Figma vrider samma pil; `up-down` är en dubbelpil",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "text-block",
    topic: "Tablet med brödtext",
    figma:
      "En tom ram (`empty`, 104px hög) under pilen gör raden med brödtexten 20px högre än texten; ramen blir 396px",
    code: "Raden är så hög som brödtexten; blocket blir 376px",
    why: "Den tomma ramen ser ut som en platshållare",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "contact",
    topic: "Radernas bredd på Desktop L",
    figma: "Fast 684px, mellan kolumn 5 och 6 (Desktop S: kolumn 1–6)",
    code: "Kolumn 1–6 på båda, 24px bredare på Desktop L",
    why: "En fast bredd följer inte gridet; se frågan",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "contact",
    topic: "Kontaktuppgifterna",
    figma: "E-post, telefon, Facebook och Linkedin som text i blocket",
    code: "Hämtas från sidfotens inställningar (`email`, `phone` och nya `socialLinks`), samma som sidfoten visar; blocket har bara rubriken",
    why: "De ändras på ett ställe",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "contact",
    topic: "Fälten",
    figma: 'Fyra fält och ett meddelandefält, alla "[01] Heading" med "Supporting text"',
    code: "[01] Namn *, [02] Företag, [03] E-post *, [04] Telefon och [05] Meddelande *, utan platshållare, som konfiguratorns formulär",
    why: "Platshållarna ser kopierade ut; det här är vad en kontaktförfrågan behöver",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "contact",
    topic: "Skickat och fel",
    figma: "Inget läge för skickat eller fel",
    code: 'Skickat: "Tack! Vi har fått ditt meddelande …" i Text XL där formuläret var. Fel: meddelandet i `status-error` ovanför knappen och vid fälten',
    why: "Formuläret behöver säga att det gick iväg",
    status: "Lucka",
    date: "2026-10-23",
  },
  {
    target: "contact",
    topic: "Vart meddelandet går",
    figma: "—",
    code: "Sparas i Meddelanden i Payload och mejlas till `CONTACT_REQUEST_EMAIL` (annars `CONFIGURATOR_SALES_EMAIL`) med avsändaren som svarsadress. Ingen bekräftelse går till adressen i formuläret, så formuläret kan inte användas för att skicka mejl till andra",
    why: "Formuläret ska fungera på riktigt",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "login",
    topic: "Navigationen",
    figma:
      "Sidmallen Login (05 — Pages): navigationen i Light över fotot och panelen, och sidfoten under",
    code: 'Samma: blocket har `data-navigation="light"`, som gör en stängd navigation Light på sidan',
    why: "Som i sidmallen",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "login",
    topic: "Inte kopplad",
    figma: "Logga in och Skapa konto",
    code: "En hårdkodad sida, `/login`, med Figmas foto i repot. Fälten kontrolleras i webbläsaren (e-post, lösenord, minst 8 tecken för ett nytt konto); ett giltigt formulär säger att inloggningen inte är kopplad än. `TODO(login)` i `LoginForm`",
    why: "Hur inloggningen ska kopplas är inte bestämt; bild och text kan flyttas till admin senare",
    status: "Platshållare",
    date: "2026-10-23",
  },
  {
    target: "login",
    topic: "Fältens höjd",
    figma: "Fälten är ritade 56px höga, fast rubriken, avståndet och rutan blir 60px",
    code: "60px, som fälten överallt; formuläret blir 8px högre och centreras 4px högre upp",
    why: "Samma fältkomponent som i övriga formulär",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "login",
    topic: "Skapa konto",
    figma: 'Knappen heter "Logga in", och texten "Har du redan ett kontp?"',
    code: 'Knappen heter "Skapa konto" och texten "Har du redan ett konto?"; ingen "glömt lösenord"-länk, som i Figma',
    why: "Ser ut som en kopia och ett stavfel",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "login",
    topic: "Fel och meddelanden",
    figma: "Inga fel- eller meddelandelägen",
    code: 'Fältfelen som i övriga formulär; ett meddelande i `status-error` ovanför knappen. Länkarna mellan lägena och "Jag har glömt mitt lösenord" är knappar på sidan',
    why: "Formuläret behöver säga vad som är fel",
    status: "Lucka",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Skärmens höjd",
    figma: "Skärmen är 800px hög (Tablet 1000, Konfigurator-sidan 832), truckens yta fast",
    code: "En skärm hög i alla bredder, så att steget och knapparna får plats i fönstret; trucken tar platsen som blir över (minst 12rem under Desktop S, för prisrutan) och skärmen växer bara när steget självt är högre",
    why: "I ett lägre fönster hamnade valen och knapparna under kanten. Under Desktop S börjar prisrutan dessutom under navigationsraden, där Figma låter den nudda raden",
    status: "Beslut",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Konfiguratorsidan",
    figma:
      'Sidmallen "Konfigrator" (05 — Pages): skärmen från sidans topp under navigationen, 832px hög på Desktop, och navigationen i Light',
    code: 'Inget utrymme ovanför skärmen; på Desktop S och L minst en skärm hög (minst 800px). Blocket har `data-navigation="light"`, som gör en stängd navigation Light på sidan',
    why: "Som i sidmallen; tidigare låg skärmen 96px ner och knapparna hamnade under skärmkanten",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "price-box",
    topic: "Mellanrum i raderna",
    figma: "Etikett och värde utan mellanrum, värdet på en rad",
    code: "`spacing/2xs` mellan dem och värdet på en rad",
    why: '"Långtidshyra (48 mån)" och värdet trängdes i 229px breda price-boxen',
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
    code: "Samma proportion (`aspect-[389/291]`), om inte blocket sätter en annan i `--card-aspect` (Card Slider gör per läge); ingen fast storlek",
    why: "Fasta höjder undviks",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "color-image-card",
    topic: "Hover på gray",
    figma: "gray har bara Default, men prototypen byter gray till Tejps hover-läge vid hover",
    code: "gray får samma bildläge vid hover; fotot tonar bara in, som i prototypen",
    why: "Så gör prototypen",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "color-image-card",
    topic: "Rörelse vid hover",
    figma:
      "Prototypen (While hovering → Change to): 0,3 s med `cubic-bezier(0.796, 0, 0.3, 1)` (gray `0.8`). Fotot tonar in och krymper från 609 × 456 till 527 × 394 kring mitten, texten under rubriken öppnas och tonar in och rubrikens färg tonar; taggen och kortets färg byts direkt",
    code: "Som prototypen, och samma väg tillbaka. Utan rörelse när användaren valt reducerad rörelse",
    why: "Prototypens interaktioner syns bara i Dev Mode",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "color-image-card",
    topic: "Hover utan pekare",
    figma: "Bildläget visas vid hover; inget läge för pekskärmar eller tangentbord",
    code: "Bara hover; `static` för bildläget hela tiden, och `staticBelowDesktop` för bildläget under Desktop S (Card Sliders första kort)",
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
    code: "Krysset syns på Mobile också, i panelens övre hörn",
    why: "Popupen går annars inte att stänga på en telefon",
    status: "Lucka",
    date: "2026-10-23",
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
    figma:
      "Prototypen (Dev Mode, Hover → Change to): färgerna tonar och pilraden flyttas 20px på 0,18 s med `cubic-bezier(0.76, 0, 0.26, 1)`, i alla varianter",
    code: "Som prototypen, utan rörelse när användaren valt reducerad rörelse",
    why: "Prototypens interaktioner syns bara i Dev Mode",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "links",
    topic: "Animation vid hover",
    figma:
      "Link: hover flyttar pilraden ett steg, men raden har två likadana pilar och prototypen har ingen övergång, så inget syns. footerlink: prototypen rullar texten upp på 0,18 s med `cubic-bezier(0.688, 0, 0.33, 1)` (Dev Mode, Hover → Change to)",
    code: "Link-pilen glider som knappens, 0,18 s med `cubic-bezier(0.76, 0, 0.26, 1)`. footerlink rullar som prototypen. Utan rörelse när användaren valt reducerad rörelse",
    why: "Utan rörelsen syns ingen hover på Link (till exempel Dealer login); pilraden är byggd som knappens",
    status: "Beslut",
    date: "2026-10-22",
  },
  {
    target: "links",
    topic: "footerlinks rullning",
    figma: "Hover-varianten är 48px hög och raderna flyttas 28px, så kopian hamnar längst ner",
    code: "Rutan behåller sina 38px och raderna flyttas en hel rad, så kopian hamnar exakt där texten var",
    why: "Samma slutläge utan att raden växer och flyttar länkarna under den",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
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
    code: "Den valda tiden får svart text och ram (`ui-primary`) och syns i rutans text. Ingen hover",
    why: "Det man klickar på ska synas som valt (beslut 2026-10-27)",
    status: "Beslut",
    date: "2026-10-27",
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
    topic: "Rörelse vid hover",
    figma:
      "Prototypen (Dev Mode, Mouse enter och Mouse leave → Change to): 0,2 s med `cubic-bezier(0.81, 0, 0.28, 0.99)`. Bilden krymper och pilens rad och priserna öppnas; pilen och priserna tonar in men är borta direkt på vägen ut. Färgerna har ingen övergång",
    code: "Som prototypen, på Desktop vid hover och på Mobile när kortet är Active; färgerna byts direkt. Utan rörelse när användaren valt reducerad rörelse",
    why: "Prototypens interaktioner syns bara i Dev Mode",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
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
    topic: "Övergångar",
    figma:
      "Prototypen: choice byter läge direkt (Instant) vid hover och klick. Financiering tonar färgerna och fäller ut panelen, som tonar in, på 0,18 s `ease-out` när den klickas från Default; vägen tillbaka till Default är inte ritad",
    code: "Choice byts direkt. FinancingChoice tonar och fälls ut när den väljs; när ett annat val väljs byts färgerna direkt och panelen fälls ihop på samma 0,18 s `ease-out`, som ett dragspel, så att det som ligger under inte hoppar. Utan rörelse när användaren valt reducerad rörelse. Från Desktop S behåller trucken sin storlek när ett utfällt val gör steget högre än fönstret",
    why: "Prototypen visar bara övergången till valt; ihopfällningen beslutades 2026-10-27",
    status: "Beslut",
    date: "2026-10-27",
  },
  {
    target: "navigation",
    topic: "Modellers bild innan man pekar",
    figma: "`State=Modeller, Truck=0` visar ledstaplaren innan någon truck är pekad",
    code: "På sajten är rutan tom tills en trucktyp pekas på; då visas trucktypens huvudbild. Kitchensink visar Figmas läge med bild",
    why: "Ingen trucktyp ska visas först, och menyns egen bild var en annan bild av ledstaplaren, så trucken hoppade när trucktypens bild tog över",
    status: "Beslut",
    date: "2026-10-23",
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
    figma:
      "`Device=Desktop` och `Device=Mobile`, utan brytpunkt; raden är 38px respektive 25px hög",
    code: "Mobile under Desktop S, Desktop från Desktop S där det finns hover; samma höjder i rem med texten centrerad",
    why: "Hovern behöver en pekare; höjden är fast i Figma",
    status: "Antagande",
    date: "2026-10-22",
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
    code: "Samma höjder i rem (`h-[16.375rem]`, minst `8.75rem`), som skalar med sidan; big-bilden fyller rummet mellan titel och text",
    why: "Figma håller höjden fast när valet blir bredare, så en proportion hade gett fel höjd i de andra bredderna",
    status: "Beslut (teknisk)",
    date: "2026-10-21",
  },
  {
    target: "choice",
    topic: "Den lilla bildens plats",
    figma: "`image=small`: bilden 124 × 93 ligger absolut till höger, över titeln och texten",
    code: "Två kolumner `spacing/sm` isär: titeln över texten till vänster, priset över bilden till höger med `spacing/xs` emellan oavsett valets höjd, så texten aldrig hamnar bakom bilden; valet växer om innehållet behöver det",
    why: "Användarens beslut: texten hamnade bakom bilden, bilden låg tätt under priset och i högre val långt ifrån det",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "choice",
    topic: "Långa titlar och priser",
    figma:
      "Titeln tar platsen bredvid priset och radbryts där; ett ord som inte får plats bryts. Inget avstånd mellan titel och pris",
    code: "Som Figma, men med minst `spacing/sm` mellan titel och pris, och ett långt ord bryts med bindestreck där redaktören satt `|` i truckdatans namn (mjukt bindestreck), annars var som helst (2026-10-26, användarens beslut). Tidigare flyttades priset till en rad under titeln, och långa ord avstavades automatiskt (`hyphens-auto`)",
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
    code: "Komponentens proportion, 430:507, om inte blocket sätter en annan (`--card-aspect`); Product-Grid sätter sina ramars, se där",
    why: "Komponenten gäller för sig, blocket för sina kort; inga fasta höjder",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
    topic: "Kortens höjd",
    figma:
      "507px höga i alla fyra ramar: 469 × 507 på Desktop L, 416 på Desktop S, 388 på Tablet och 339 på Mobile",
    code: "Varje läge har sin rams proportion, så korten är 507px höga vid 1440, 1280, 800 och 375 och följer bredden däremellan. Tidigare product-cards 430:507, som gjorde korten 457–553px höga",
    why: "Blocket följer Figmas ramar; fasta höjder blir fel mellan dem. Bilden blir mindre vid hover än i komponenten, som i Figmas Tablet",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "product-grid",
    topic: "Luft och bakgrund",
    figma:
      "`grid/margin` vid sidorna och inget ovanför eller under korten (1022px höga på desktop); ramen har ingen fyllning",
    code: "Samma luft; tidigare `grid/margin` även upptill och nedtill. Bakgrunden är Dark `bg-fill`, som Text+Grid",
    why: "Mellan korten syns annars sidans vita bakgrund mellan två mörka block; se frågan",
    status: "Antagande",
    date: "2026-10-23",
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
    code: "Samma layout i alla bredder, som konfiguratorns ramar visar; `mobileLayout` kan stapla ett rutnät under Tablet men används inte",
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
    code: "Ikryssad blir kortet Tejp som ett valt `Choice`, och rutan visar ikonen `check`; den dolda texten visas inte",
    why: "Inte ritat; utan ett ikryssat läge syntes det inte att avtalet var valt",
    status: "Lucka",
    date: "2026-10-26",
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
    topic: "Styrd av blocket",
    figma: "Default och Active; inget om vem som bestämmer läget",
    code: '`controlled`: aktiv bara med `data-state="active"`, i alla bredder och utan hover. Heron använder det och lägger sin truck under innehållet',
    why: "Heron väljer aktiv kolumn efter pekaren eller scrollen, som prototypen",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
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
    code: "Header-globalens `navItems` är menyerna: etikett, länkar (med en bild per länk) och en bild; utan länkar är menyn en vanlig länk. `login` är login-länken med en kort etikett. `cta`, `siteName` och `siteTagline` visades inte och togs bort 2026-10-26",
    why: "Fälten följer Figma; `cta` tas bort ur globalen först när innehållet inte behövs",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "navigation",
    topic: "Testinnehållet",
    figma: "Länkar till sidor som modellerna, tjänsterna och login",
    code: "`pnpm seed:globals` fyller i Figmas menyer och truckbilder lokalt. Tjänster går till startsidans sektioner, Om oss till `/om-oss` (Om Baoli), `/om-oss#service` (Service & eftermarknad) och `/om-oss#kontakt` (Kontakt, och Bli återförsäljare), och login till `/login`",
    why: "Figma anger inga mål; sidorna och ankarna är de som finns",
    status: "Platshållare",
    date: "2026-10-22",
  },
  {
    target: "navigation",
    topic: "Läge efter blocket under",
    figma:
      "Navigationen ritas Dark över mörka sektioner och Light på sidmallarna Konfigurator och Login; inget om vad som händer när en ljus yta scrollar in under den",
    code: 'Stängd tar varje del av raden (loggan, varje meny, login-länken och "[Meny]") läget från det innersta elementet med `data-navigation="light"` eller `"dark"` under sin mitt, läst vid scroll (även i sidled) och när attributet ändras. Blocken sätter det i koden: produktgridens kort, herons gula kolumn, textgridens ljusa ruta (fotona Dark), sidfotens Tejp-ruta, konfiguratorn, offerten och Login. Utan något sådant gäller navigationens eget läge. Färgen byts med samma övergång som när menyn öppnas',
    why: "Användarens beslut 2026-10-26: vit text syntes inte över de ljusa korten",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "navigation",
    topic: "Fyllnad och overlay i rörelse",
    figma:
      "Prototypen låter panelen växa i 0,6 s med cubic-bezier(0.9, 0, 0.17, 1.01); hur fyllnaden bakom raden och overlayn rör sig framgår inte",
    code: "Från Desktop S ligger fyllnaden med blur i ett eget lager som visas med clip-path från viewportens topp och ner, i samma tid och kurva som panelen, och tillbaka upp när menyn stängs. Overlayn tonar in och ut med samma kurva",
    why: "Användarens beslut 2026-10-26: raden fick fyllnaden direkt och panelen växte efter, så rörelsen gick i två steg, och overlayn blinkade fram",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "navigation",
    topic: "Stänga menyn",
    figma:
      "Prototypen stänger Desktop-menyn när pekaren lämnar raden (Mouse leave); inget om overlayn, Escape eller hur mobilmenyn stängs",
    code: 'På Desktop stänger pekaren som lämnar raden menyn, och ett nytt klick på den; "[Meny]" stänger med ett klick, och ett klick utanför, på overlayn, stänger menyn. Escape gör inget',
    why: "Inte ritat; klick utanför beslutat 2026-10-27",
    status: "Lucka",
    date: "2026-10-27",
  },
  {
    target: "navigation",
    topic: "Truckbilderna",
    figma:
      "`Truck=1` till `6`: på Desktop S och L blir länken man pekar på `ui-brand`, de andra `ui-tertiary`, och trucken visas i rutan. Bara ritat för Modeller",
    code: "Färgerna gäller länkarna i alla menyer (beslut 2026-10-22); en länk med egen bild visar den. Bara vid hover med pekaren, inte vid tangentbordsfokus, och inte i dragspelet på Tablet och Mobile",
    why: "Inte ritat för fokus, mindre skärmar eller de andra menyerna; användaren ville ha samma hover i Tjänster och Om oss",
    status: "Lucka",
    date: "2026-10-21",
  },
  {
    target: "navigation",
    topic: "Öppna med hover",
    figma:
      'Prototypen: Mouse enter på en meny öppnar den på Desktop S och L; "[Meny]" öppnas med Click',
    code: "Som prototypen, med musen; ett klick öppnar och stänger också, för tangentbord och pekskärm",
    why: "Tangentbord och pekskärm har ingen hover",
    status: "Beslut (teknisk)",
    date: "2026-10-22",
  },
  {
    target: "navigation",
    topic: "Rörelse",
    figma:
      "Prototypen: öppna och stänga tar 0,6 s med `cubic-bezier(0.9, 0, 0.17, 1.01)`. Panelen växer, länkarna och bilden tonar in och de andra menyernas etiketter tonar till `ui-tertiary`; stängd krymper panelen över innehållet. Byte mellan öppna menyer tar 0,18 s",
    code: "Som prototypen; fyllningen och overlayn går när panelen har stängts. Mobilmenyn öppnas och stängs likadant, med fyllningen avslöjad från skärmens topp som på Desktop (beslut 2026-10-27), och truckbilderna byts direkt. I dragspelet fälls en meny ut och ihop med panelens kurva och tid, så att ett byte stänger den ena medan den andra öppnas (beslut 2026-10-27). Utan rörelse när användaren valt reducerad rörelse",
    why: "Stängningen av mobilmenyn, dragspelet och truckbilderna har ingen övergång i prototypen",
    status: "Lucka",
    date: "2026-10-27",
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
    topic: "Avstånd i den andra kolumnen",
    figma:
      "I Modeller har den andra kolumnen 8px mellan länkarna, den första ingen, så raderna inte står i linje",
    code: "Ingen i båda kolumnerna, som i den första och i menyerna med en kolumn",
    why: "Ett misstag i Figma enligt användaren",
    status: "Beslut",
    date: "2026-10-22",
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
    code: 'Footer-globalens nya `linkGroups` (rubrik och länkar), `contactHeading`, `email`, `phone` och `location`, och `copyright` efter "© år"; året sätts automatiskt. `navItems`, som inte visades, togs bort 2026-10-26. `pnpm seed:globals` fyller i Figmas innehåll lokalt',
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
    figma: 'En "product-slider" med alla sex kort; kortet är 339 × 507, ur sliderns fasta bredd',
    code: "Horisontell slider med snap; kortet är bredden minus `spacing/md` i proportionen 339:507 (335 × 501 vid 375)",
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
    figma:
      "64px (Desktop L), 56px (Desktop S), 48px (Tablet), 32px (Mobile); ingen variabel. Mitt på den första raden, `spacing/sm` före texten",
    code: "Samma storlekar och läge. Tidigare 64px på Desktop S och på textens baslinje, 2–11px för högt",
    why: "Inget att ta från tokens",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "text-grid",
    topic: "Höjder",
    figma:
      "Panelen 800px hög på Desktop L och S med korten i nederkant (459 × 405 och 405 × 430), 1000px på Tablet och 1088px på Mobile; inget ovanför eller under panelen",
    code: "Korten har Figmas proportion per läge (327:274,67, 752:242,67, 405,33:430, 459:405). På desktop är panelen minst 800px hög med korten i nederkant och minst `spacing/3xl` under rubriken; under desktop `spacing/lg`. Samma mått som Figma vid 375, 800, 1280 och 1440",
    why: "Desktop-ramarna är lika höga men korten olika, så avståndet under rubriken är det som blir över (107 och 114px). Tidigare `spacing/4xl` och luft ovanför och under panelen, som gav 757–837px",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
      'Rubriken i Display L-storlek men med radavståndet 0,9, utom raden "390kr/mån" som har 1 (och 96px på Tablet och Mobile); brödtexten Text XL',
    code: "Display L med radavståndet 0,9 för hela rubriken, Text XL. Rubriken blir 4–11px lägre än i Figma, och resten av blocket flyttas upp lika mycket; se frågan om 390kr/mån. Tidigare radavståndet 1, 24–30px för högt",
    why: "Rubriken är en text i Payload; en rad med eget radavstånd ser ut som en rest i Figma",
    status: "Antagande",
    date: "2026-10-23",
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
    figma: "Rubrikens andra del `#e0ff3c` utan variabel; brödtexten `ui-primary`",
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
    figma:
      "`9264:6653`: stegtyperna 1–5, offerten och tack-sidan. Den tidigare ram 15 (`8721:16450`) finns inte längre",
    code: "Följer `9264:6653`",
    why: "Den nya ramen ersätter den gamla",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Stegtyperna",
    figma:
      "Fem typer: sex val två per rad med text (1), två under varandra med hjälptext (2), fyra med bild två per rad (3), tre med bild till höger (4), tre med bara titel och pris (5, finansieringens rutor)",
    code: "Varje val i trucktypen visas som sin typ (`display`), annars efter innehållet: bild ger typ 3 (fler än tre) eller 4, fler än två val med text typ 1, utan text typ 5, annars typ 2. Modellerna visas som typ 1 och finansieringen som typ 5",
    why: "Användarens beslut 2026-10-23: innehållet väljer, redaktören kan välja en annan",
    status: "Beslut",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Proportioner",
    figma:
      "Desktop L 1440 × 800: stegen över 4 av 12 kolumner, trucken över 8; Desktop S 5 och 7; Tablet 800 × 1000 och Mobile 375 × 800 med trucken ovanför stegen. Price-boxen och Boka samtal uppe till höger, 263px breda på desktop och 229px under",
    code: "Samma, med minhöjderna 50, 62,5 och 50rem; trucken tar det utrymme stegen lämnar. Uppmätt vid 1440, 1280, 800 och 375: rutan, knapparna och price-boxen på Figmas plats",
    why: "Ramarna är lika höga mellan stegen",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Navigation och totalpris",
    figma: "Ramarna har ingen navigation",
    code: "Konfiguratorn och offertsidan reserverar 6rem i samma grå bakgrund ovanför sig för sajtens överlagrade navigation. Kitchensink visar ramarna utan den",
    why: "Navigationen ligger annars över stegen och price-boxen",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
    figma: "Ett foto som fyller bildytan, med price-boxen och Boka samtal över",
    code: "Trucktypens huvudbild, hela trucken i bildytan (object-contain); price-boxen och knappen ligger över den",
    why: "Trucktypernas bilder är frilagda och olika stora; se frågan",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Val på Mobile",
    figma: "Typ 1 har två val per rad även på Mobile",
    code: 'Samma. Tidigare staplades valen när ett pris var längre än "+3500 kr"; med de nya priserna ("169 000 KR") får titeln plats på en rad, 84px höga rader som i Figma',
    why: 'Följer Figma; den gamla regeln gällde priser som "Från 169 tkr"',
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Knapparna",
    figma:
      '"Föregående" grå med pil vänster och "Nästa" mörk med pil höger, 4px isär, 40px höga; "Boka samtal" mörk med telefon',
    code: "Samma. Knappens standardikon är vinkeln (`keyboard-arrow-right`); blocken och konfiguratorn använder pilen som Figmas instanser",
    why: "Figmas instanser byter ikon",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
    topic: "Stegskärmen i sidans grid",
    figma:
      "`spacing/md` vid sidorna; steget över 4 (Desktop L) eller 5 (Desktop S) av 12 kolumner och trucken intill",
    code: "Sidans grid från Desktop S: `grid/margin` vid sidorna och `grid/gap` mellan kolumnerna, så att steget slutar på en kolumnkant. Trucken ligger i kolumnerna efter steget med `spacing/md` innanför på båda sidor, så den aldrig når valen och har lika mycket luft mot högerkanten",
    why: "Användarens beslut: steget ska följa gridet och trucken inte hamna kant i kant med valen",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "configurator",
    topic: "Popupens rörelse",
    figma:
      '"prototyp - popup" (9321:55718): "Fortsätt beställning" (och "Boka samtal") öppnar popupen med Smart animate, 1200ms, easing 0.72, 0, 0.37, 1. Panelen glider in från höger och sidan 622px åt vänster; prisrutan och "Boka samtal" finns inte i slutramen och tonas bort. Stängningen och lägen under Desktop S är inte ritade, och ramen har ingen navigation',
    code: "Som Figma när den öppnas, och samma rörelse baklänges när den stängs (krysset eller Escape). Sidan under navigationen glider 622/1440 av bredden från Desktop S; navigationen står kvar. Prisrutan och knappen Boka samtal tonas bort, också i konfiguratorn. Under Desktop S glider bara panelen, som täcker bredden. Ingen rörelse med reducerad rörelse",
    why: "Stängningen behöver en rörelse för att inte hoppa tillbaka; navigationen ligger över sidan och följer inte med",
    status: "Lucka",
    date: "2026-10-26",
  },
  {
    target: "configurator",
    topic: "Trucktyp",
    figma: "Inte ritat; ramarna börjar med lyftkapaciteten",
    code: 'Valet av trucktyp är första steget, `[01]`, som typ 4 (trucktypens bild till höger och "Från"-pris) över 7 av 12 kolumner från Desktop S, två per rad när rutan är minst 45rem bred; trucktypens steg följer som `[02]` och framåt',
    why: "Val av trucktyp behövs när /configurator öppnas utan family i URL:en; startsidans länkar går direkt till trucktypens första steg",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Före trucktypen",
    figma: "Inte ritat",
    code: 'Price-boxen visar "Från" och trucktypernas lägsta pris. "Boka samtal" är inaktiv tills en trucktyp är vald',
    why: "Samtalet behöver en trucktyp",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Finansiering",
    figma:
      "Typ 5: tre rutor med titel och pris (Financiering-02); valt Financiering har reglage för avtalslängd (24–84 mån) och restvärde",
    code: 'Det sista steget: finansieringssätten som typ 5 med pris (kr eller kr/mån), serviceavtalet som kryssruta under rutan när det går att välja, "Alla priser visas exkl. moms" som hjälptext och "Visa offert" i stället för "Nästa". Ett sätt med månadskostnad visar valt Financiering: reglaget för avtalslängd mellan kortaste och längsta längd i konfiguratorinställningarna, och restvärdet när det har ett (bara leasing). Titeln är då bara namnet; priset följer längden. Den valda längden följer med i adressen, offerten, förfrågningarna och mejlen. Månadskostnaden är tills vidare (totalpris − restvärde) / antal månader, utan ränta: `TODO(financing)` i `calculateFinancingPrice`',
    why: "Kunden väljer avtalslängd själv (beslut 2026-10-27); hur månadskostnaden ska räknas bestäms senare",
    status: "Platshållare",
    date: "2026-10-27",
  },
  {
    target: "configurator",
    topic: "Val som kräver annat val",
    figma: "Inget läge",
    code: '`Choice` inaktiv och halvt genomskinlig, texten säger "Kräver ett annat tidigare val". Ett obligatoriskt val där inget alternativ finns för det som valts före hoppas över',
    why: "Lucka i Figma",
    status: "Antagande",
  },
  {
    target: "configurator",
    topic: "Boka samtal",
    figma: "Knappen i varje steg, i offerten och på tack-sidan; Popupens call",
    code: 'Öppnar Figmas samtalspopup, också från "Kontakta oss" i stegets hjälptext; konfigurationen följer med som den är, markerad som ofullständig om steg återstår',
    why: "Användarens beslut",
    status: "Beslut",
    date: "2026-10-05",
  },
  {
    target: "configurator",
    topic: "Offerten",
    figma:
      "`type=offert`: rubriken i singular, Konfiguration och Tekniska specifikationer, Skicka kopia till mig och Fortsätt beställning; price-boxen med Boka samtal uppe till höger på desktop, i flödet under rubriken på Tablet och Mobile",
    code: "Som Figma vid 800 och 375. Från Desktop S på sidans grid som stegskärmen och tackskärmen: vänsterdelen över 5 av 12 kolumner (4 på Desktop L, där Figma har 555px) och trucken i resten med `spacing/md` innanför, så den har samma yta och plats i alla tre",
    why: "Användarens beslut 2026-10-26: trucken bytte storlek och läge mellan sista steget och offerten. Tidigare börjar bildytan efter den 555px breda kolumnen så trucken inte låg under texten",
    status: "Beslut",
    date: "2026-10-26",
  },
  {
    target: "configurator",
    topic: "Skicka kopia till mig",
    figma: "Fält och knapp i offerten",
    code: "Skickar offerten som mejl till adressen. Ett dolt fält stoppar robotar, och varje adress får högst 3 och varje IP-adress 10 kopior i timmen. En rad under fältet säger att kopian är skickad, eller felet; Figma ritar inga sådana lägen",
    why: "Vem som helst kan ange vilken adress som helst, så utskicket får inte kunna användas för att fylla någons inkorg",
    status: "Lucka",
    date: "2026-10-26",
  },
  {
    target: "configurator",
    topic: "Tekniska specifikationer",
    figma: "Fem rader i offerten; produktkortets batteri finns inte där",
    code: "Varje specifikation har `Visas i offerten`; batteriet för produktkortet är avstängt",
    why: "Produktkortets och offertens batterivärden skiljer sig i Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Tack-sidan",
    figma:
      '`type=TNX!`: "Tack för din beställning!", price-boxen och "Vad händer nu?" med fem steg numrerade 01, 02, 04, 05, 05',
    code: "Visas när ordern är skickad. Stegen kommer från konfiguratorinställningarna och numreras i ordning",
    why: "Numreringen ser ut som en rest",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Popupen",
    figma: "En vit panel `grid/margin` från kanterna, högra halvan på desktop; inget bakom",
    code: "En `<dialog>` på samma plats, utan nedtoning bakom; Escape och krysset stänger",
    why: "Inte ritat; se frågan",
    status: "Lucka",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Samtalsformuläret",
    figma:
      'Namn, Telefon *, Företag, ett fält med platshållarrubriken "Heading", När ska vi ringa? och Meddelande; alla numrerade 01 och knappen "Skicka avtal för signering"',
    code: 'Det fjärde fältet är E-post, fälten numreras 01–06 och knappen heter "Boka samtal". Bara telefonen krävs',
    why: "Platshållarna och knapptexten ser kopierade ut från order; se frågorna vid contact-form",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Tid i kalendern",
    figma: 'En exempeldag, "Idag 12 oktober" med fyra tider',
    code: "De fem närmaste vardagarna med tiderna 09–16 utom lunch; i dag bara de tider som är kvar",
    why: "Inte ritat vilka dagar och tider som finns",
    status: "Antagande",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "När ska vi ringa?",
    figma: 'Ett alternativ ("Text") bredvid kalendern',
    code: 'Två val bredvid varandra, "Så snart som möjligt" (förvalt) och "Jag önskar en särskild tid"; det andra visar kalendern, öppen, under dem. Utan vald tid stoppas bokningen med "Välj en tid i kalendern."',
    why: "Kalendern behövs bara när man vill ha en särskild tid (beslut 2026-10-27); svarar på frågan vid contact-form",
    status: "Beslut",
    date: "2026-10-27",
  },
  {
    target: "configurator",
    topic: "Bokning bekräftad",
    figma: '"Vi ringer upp namn den 7/10 kl 11:00 på 0712345654." och Stäng',
    code: 'Samma text med den valda tiden eller "så snart som möjligt"; utan namn står bara tiden och numret',
    why: "Namnet är valfritt",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
  },
  {
    target: "configurator",
    topic: "Orderformuläret",
    figma: "Företagsnamn, organisationsnummer, e-post och telefon; inget namn",
    code: "Samma fält numrerade 01–04; kontaktnamnet i förfrågningarna är valfritt (migreringen `20261023_094032_request_name_optional`)",
    why: "Följer Figma",
    status: "Beslut (teknisk)",
    date: "2026-10-23",
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
