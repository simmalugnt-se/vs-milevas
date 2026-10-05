# Avvikelser från Figma

Designsystemet byggs från Figma-filen "Milevas — Website" (sidorna "01 — Foundations" och
"02 — Components"). Grundregeln är att variablernas namn och värden gäller. Här står allt där koden
avviker från Figma eller fyller i något som Figma inte säger, så att designen kan bekräfta eller rätta
det.

Varje post har en status:

- **Beslut**: bestämt tillsammans, gäller tills Figma ändras.
- **Antagande**: vår tolkning, gäller tills designen säger något annat.
- **Platshållare**: tillfälligt, ska bytas (sök på `TODO(...)` i koden).

Lägg till en post när du avviker från Figma eller fyller i en lucka, med datum, Figma-nod, vad Figma
säger, vad koden gör och varför. Stryk posten när Figma och koden är överens igen. Det som är markerat
på kitchensink-sidan (`/kitchensink`) ska också stå här.

## Foundations

| Område | Figma | Koden | Varför | Status |
|---|---|---|---|---|
| Färgnamn | Både `Color/BG/*` och `Color/BACKGROUND/*`, och `Color/status/iinfo` | `bg-*` och `status-info` | Stavfel i Figma, rättas där | Beslut (2026-10-02) |
| `Color/BACKGROUND/border` | Variabel (`#999999`) | Ingen token | Används bara som ram runt färgrutorna i Figma | Beslut (2026-10-02) |
| Typsnitt | Clash Grotesk Variable för Display och Text | Geist | woff2-filerna saknas, se `TODO(clash-grotesk)` | Platshållare |
| Versaler | Display- och Label-raderna i "Text styles" har `uppercase` på instanserna; stilarna säger inget | `text-display-*` och `text-label-*` sätter versaler | Alla exempel i Figma är versaler | Antagande |
| Text M spärrning | `letterSpacing: -1` | `-0.01em` | Designkontexten ger -0.16px vid 16px, alltså -1 % | Antagande |
| Läget "Desktop M" | Kolumnrubrik i "Text styles"; variabelläget heter "Desktop S" | Desktop S | Variabelns namn gäller | Beslut (2026-10-02) |
| Desktop L max | Framen "Breakpoints" säger "Inf"; `breakpoints/width-max` är 1920 | 1920 (bara på kitchensink) | Variabeln gäller; om 1920 är innehållets maxbredd hör den hemma i grid | Antagande |
| Tailwinds brytpunkter | Bara Tablet, Desktop S och Desktop L | `tablet:`, `desktop-s:`, `desktop-l:` plus Tailwinds `sm`–`2xl` | Boilerplate-blocken använder `sm:`/`md:`/`lg:`; ny kod använder Figmas namn | Beslut (2026-10-02) |
| Card grid under Desktop S | Framen "Grids" visar bara Desktop L | Tablet 2 kort per rad, Mobile 1, för alla tre varianterna | Inget ritat; markerat på kitchensink | Beslut (2026-10-02) |
| `grid/margin` | 8px runt om i framen "Grids" | Bara på sidorna (`padding-inline`) | Framen är hela viewporten; marginalen upptill och nedtill ser tillfällig ut | Antagande |
| `shape/radius-*` | `radius-sm` 8, `radius-lg` 16 | Ersätter Tailwinds `rounded-sm`/`rounded-lg` (4/8) | Klassen motsvarar Figmas variabel; adminbaren blir något rundare | Beslut (2026-10-02) |
| `layout/spacing/*` | Variabler som `spacing/xs` | `p-(--spacing-xs)`, inte `p-xs` | I Tailwinds tema skulle `--spacing-*` även styra `w-*`/`max-w-*` och ändra `max-w-2xl` i boilerplate | Beslut (teknisk) |

## Components

| Komponent | Figma | Koden | Varför | Status |
|---|---|---|---|---|
| Ikoner | `icon-sound-off` finns två gånger med samma SVG | En `sound-off` | Dubblett | Beslut (2026-10-02) |
| Button, animation | Hover byter läge (pilraden från start till slut); `motion`-samlingen går inte att läsa | Pilen glider 20px på 200 ms ease-out | Värdena i `motion` saknas, se `TODO(motion)` | Platshållare |
| Button, ikoner | Vissa varianter saknar vänsterikonen (bland annat disabled gray) | Alla varianter tar samma ikoner | Ser ut som rester i komponenten | Antagande |
| Choice med bild | Fast höjd 262px | Bilden tar två tredjedelar av bredden | Fungerar i alla bredder; ungefär samma proportion | Antagande |
| Choice, fokus | Inget hover- eller fokusläge | Webbläsarens fokusram | Inget ritat | Antagande |
| product-card "tablet" | Läget visar pil och priser utan hover | Under Desktop S syns pil och priser alltid; från Desktop S vid hover | "tablet" läses som "ingen hover"; markerat på kitchensink | Beslut (2026-10-02) |
| product-card, höjd | 430 × 507 i komponenten; 507px hög i varje instans i product-grid, oavsett bredd | Fast höjd 507px, bredden från behållaren (tidigare proportionen 430:507) | Figma håller höjden, inte proportionen | Beslut (2026-10-05) |
| card, färger | Text `#f5f5f5`, gradient `rgba(0,0,0,.4)` → `.2`; inga variabler | Text `ui-inv-primary` (`#f0f0f0`), gradient svart 40 % → 20 % | Närmaste token | Antagande |
| configurator-box, version | Frame 9 (nyare, `Text size=S/M`) och frame 6 (urblekt) | Frame 9; price-box från frame 6, där den enda finns | Frame 6 är den gamla versionen | Beslut (2026-10-02) |
| configurator-box, variant | `choises=2, image=true, Variant=Grid` finns bara i frame 6 | Utelämnad | Saknas i frame 9; borttagen eller bortglömd | Beslut (2026-10-02) |
| configurator-box, linjer | Staplade val har linje upp- och nedtill, dubbla mellan valen | En linje mellan valen | Dubbla linjer ser oavsiktliga ut | Antagande |
| configurator-box, mobil | Inget ritat | Två kolumner även på mobil | Inget ritat | Antagande |
| truck-column, linje | Variabeln `Color/BG/surface` (gul); ser grå ut i framen | Gul linje (`border-bg-surface`) | Variabeln gäller | Antagande |
| truck-column under Desktop S | Inget beteende utan hover | Alltid aktiv, med gul bakgrund och innehåll | Som product-card, men med bakgrund eftersom mörk text på foto är oläslig; markerat på kitchensink | Beslut (2026-10-02) |
| truck-column i en rad | Inget ritat | En kolumn per rad på Mobile, två på Tablet, fyra från Desktop S (kitchensink-exemplet) | Fyra gula kolumner täcker bilden och priserna bryts på mobil | Beslut (2026-10-02) |
| Pil i truck-column | Egen smal SVG, 24 × 32, kallad `arrow-halfup` | `<Arrow name="halfup-s">` | Ingen egen komponent i "Arrows" | Beslut (teknisk) |

## Blocks

| Block | Figma | Koden | Varför | Status |
|---|---|---|---|---|
| Sidbredd | Blocken är ritade i full bredd med `grid/margin` | `main`, header och footer har full bredd och `px-(--grid-margin)`; boilerplatens `max-w-7xl` är borttagen | Samma marginal för allt innehåll | Beslut (2026-10-02) |
| Navigation, hover | Inget hover-läge för länkarna | Länken blir `ui-primary` vid hover, som den aktiva | Inget ritat | Antagande |
| Navigation, mobilmenyn | Knappen heter "MENY" stängd och "Close" öppen | "Meny" och "Stäng" (props) | Svenska i båda lägena | Antagande |
| Navigation, position | Okänt om den ska följa med vid scroll | Ligger kvar överst (inte sticky) | Inget ritat | Antagande |
| Navigation, färg | `Color/BG/active` (`#ffffff`), inte på färgframen | Token `bg-bg-active` | Variabeln gäller | Beslut (2026-10-02) |
| Footer, avstånd | Primitiva `scale/xs` (8) och `scale/md-root` (16), inte `spacing/*` | `spacing/2xs` och `spacing/sm`, samma värden | Endast `layout`-variablerna finns som tokens | Antagande |
| Footer, marginal | Indrag 16px från länkarnas och logotypens padding, inte `grid/margin` (8) | Som Figma: 16px | Figma ritar så i alla fyra lägen; avviker från beslutet om `grid/margin` för allt innehåll, men får göra det | Beslut (2026-10-05) |
| Footer, hover | Inget hover-läge för länkarna | Inget | Inget ritat | Antagande |
| Navigation, språkväljare | Ingen i navigationen | Boilerplatens språkväljare är borttagen ur headern; språket byts med globe-ikonen i footern | Navigationen följer Figma | Beslut (2026-10-05) |
| Navigation, data | Länkar och knappen "Bygg din truck" | Header-globalens `navItems` och det nya länkfältet `cta`; `siteName` och `siteTagline` finns kvar i globalen men visas inte | Figmas navigation har bara logosymbolen | Beslut (2026-10-05) |
| Navigation, aktiv länk | Den aktiva länken är mörk | Aktiv när sidans sökväg är länkens (eller under den) | Figma visar läget men inte regeln | Antagande |
| Announcement bar | Finns inte i Figma | Boilerplatens fält är kvar och visas, när det är påslaget, ovanför navigationen i `bg-inv-fill` | Valfritt för redaktörerna; utseendet är vårt eget | Antagande |
| Footer, globe | Ikonen utan förklaring | Byter till samma sida på det andra språket (sv ↔ en); tillgängligt namn "In English" eller "På svenska" | Plats för språkbytet utan att ändra navigationen | Beslut (2026-10-05) |
| Footer, data | Länkar och mail-ikonen | Footer-globalens `navItems` och det nya fältet `email` (`mailto:`); `copyright` finns kvar men visas inte | Figmas footer har ingen copyright-rad | Beslut (2026-10-05) |
| Product-Grid, mobil | En "product-slider" med alla sex kort; kortet är 339px, ur sliderns fasta bredd | Horisontell slider med snap; kortet är bredden minus `spacing/md` (335px vid 375) | Närmaste token; nästa kort syns vid kanten som i Figma | Antagande |
| Product-Grid, mobilkortet | Det första kortet är gult med pil och priser (hover), de andra i Default utan priser | Alla kort i product-cards "tablet"-läge: grå, med pil och priser | Samma regel som under Desktop S i övrigt; frågan står i blocks-backlog.md | Antagande |
| Product-Grid, namn | "Elektriska Palllyftare" (tre l) | "Elektriska pallyftare" på kitchensink | Stavfel i Figma | Beslut (teknisk) |

## Frågor till designen

Ingen avvikelse i koden, men värt att rätta eller förklara i Figma:

- `arrow-up&forward` är en rak högerpil, och den svängda pilen heter `arrow-halfup`. Koden följer
  Figmas namn.
- Link (`8309:3919`) har hover-texten `black`, inte en färgvariabel. Koden följer Figma.
- Ikonen `help` har egenskapen `Property 1=Default`, de andra `Variant=Default`.
- `public/milevas-logo.svg` (SEO och landningssidan) har en annan form än Figmas logotyp.
