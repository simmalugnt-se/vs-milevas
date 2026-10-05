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
| product-card, storlek | 430 × 507 i komponenten; 507px hög i varje instans i product-grid, oavsett bredd | Proportionen från product-grids instanser per läge: 339:507, 388:507, 416:507 och 469:507 | Inga fasta höjder; samma mått som Figma vid varje lägens designbredd, och samma form när skärmen är bredare | Beslut (2026-10-05) |
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
| Text+Grid, rubrik | Två textrader ("Så enkelt" / "fungerar det") och pilen bredvid den första | En `h2` där en radbrytning i texten behålls; pilen står inline före texten | En rubrik för skärmläsare, och redaktören väljer radbrytningen | Antagande |
| Text+Grid, pilens storlek | 64px (Desktop), 48px (Tablet), 32px (Mobile); ingen variabel | Samma storlekar per läge | Inget att ta från tokens | Beslut (teknisk) |
| Text+Grid, höjder | Panelen 800px hög (Desktop), blocket 1000px (Tablet), korten 405px (Desktop) och 840px tillsammans (Mobile) | Inga fasta höjder: panelen är så hög som innehållet, korten har Figmas proportion per läge (327:275, 752:242, 1:1, 459:405), och avståndet under rubriken är `spacing/4xl` på Desktop, `spacing/lg` under | Samma mått som Figma vid 375, 800 och 1440; vid 1280 blir panelen 757px i stället för 800 | Beslut (2026-10-05) |
| Text+Grid, korten | Tre instanser med olika toning: komponentens gradient, svart 20 % och ingen | Alla med `card`s gradient | Ser ut som rester; komponenten gäller | Antagande |
| Text & boxinfo, höjd | Desktop-ramarna är 800px höga, med texten upptill och boxen nedtill | Ingen fast höjd: boxen ligger minst `spacing/4xl` lägre än texten och slutar i jämnhöjd med den eller längre ned | Inga fasta höjder; Figmas luft mellan text och box blir mindre (blocket 631px vid 1440) | Antagande |
| Text & boxinfo, färger | Rubrikens andra del `#e0ff3c` och brödtexten `#f5f5f5`, utan variabler | `ui-brand` och `ui-inv-primary` | Närmaste token, som för card | Antagande |
| Text & boxinfo, text-box | Använder text-box från ramen "blabla", som inte är klar | `TextBox` som den är | Blocket är färdigritat; ändras text-box ändras blocket med den | Antagande |
| Configurator, version | Ram 15 (`8721:16450`) och den urblekta ram 12 (`8389:6544`) | Ram 15; price-box används inte längre i konfiguratorn | Ram 12 är den gamla designen | Beslut (2026-10-05) |
| Configurator, nedre raden | Ram 15:s Device5–8 visar ett steg med två staplade val och en hjälptext | Samma skärm i ett annat steg, inte ett eget läge | Innehållet skiljer sig, inte layouten | Beslut (2026-10-05) |
| Configurator, Föregående | Inte i ram 15; ett exempel ("bababa") har en grå "Föregående" bredvid "Nästa", lika breda | `Button color="gray"` med pil vänster, från andra steget; första steget har bara "Nästa" | Följer exemplet | Beslut (2026-10-05) |
| Configurator, stegindikator | Bara `[02]` i rutan | Ingen annan indikator | Användarens beslut | Beslut (2026-10-05) |
| Configurator, proportioner | Ramarna 800px (Desktop), 1000px (Tablet), 800px (Mobile) | Truckytan har Figmas proportion (893:704, 787:704) på Desktop och ungefär 704:480 och 359:340 under, uppmätta i skärmdumparna; skärmen är så hög som den och steget | Inga fasta höjder | Antagande |
| Configurator, bilden | Trucken beskuren och förstorad, olika per läge; i mobilskisserna ligger rutan över bildens nederkant | Trucken får alltid plats med `spacing/md` marginal i sin yta; bara kontaktrutan ligger över den, totalpriset ovanför och steget under | Oklart i Figma vad som ska gälla; **kolla igen med designen** | Antagande |
| Configurator, val | Rutnät med textstorlek M (6 val), staplade med S (2 val); på Mobile två per rad även med "FRÅN 169TKR" | Rutnät när en grupp har fler än två val, annars staplade; under Tablet staplade när något pris är längre än "+3500 kr" (`choiceLayout`) | Långa priser tryckte ihop titlarna ("1.5 / ton") i halva bredden | Beslut (2026-10-05) |
| Configurator, telefonikon | `Phone` (12px) i "Boka samtal", saknas på "Icons" | Ikonen `phone` från samma SVG | Lucka i ikonerna | Beslut (teknisk) |
| Configurator, bakgrund | `Color/BG/fill-secondary` (`#d9d9d9`), inte på färgframen | Ny token `bg-fill-secondary` | Variabeln gäller | Beslut (2026-10-05) |
| Configurator, trucktyp | Inte ritat; ram 15 börjar med lyftkapaciteten som `[01]` | Valet av truckfamilj är första steget, `[01]`, med familjerna som `Choice` med bild och "Från"-pris; familjens steg följer som `[02]` och framåt | Konfiguratorn behöver familjen; ingen ingång väljer den åt besökaren än | Antagande |
| Configurator, före familjen | Inte ritat | Totalpriset visar "Från" och familjernas lägsta pris; ingen truckbild, så ytan krymper till kontaktrutan; "Boka samtal" inaktiv tills en familj är vald | Samtalet behöver en familj | Antagande |
| Configurator, rubriker | Rutan heter som steget ("Välj lyfthöjd") | Stegets rubrik när steget har en grupp, annars gruppens namn i varje ruta | Steg med flera grupper (gaffellängd och sidoförskjutning) | Antagande |
| Configurator, finansiering | Inte ritat | Ett eget steg: finansieringssätten som val med pris (kr eller kr/mån), serviceavtalet som en egen ruta när det går att välja, "Alla priser visas exkl. moms" som hjälptext och "Visa offert" i stället för "Nästa" | Samma delar som stegen | Antagande |
| Configurator, val som kräver annat val | Inget läge | `Choice` inaktiv och halvt genomskinlig, texten säger "Kräver ett annat tidigare val" | Lucka i Figma | Antagande |
| Configurator, Boka samtal | Knappen syns i varje steg; inget formulär ritat | Öppnar samtalsformuläret i en dialog (`<dialog>`), också från "Kontakta oss" i stegets hjälptext; konfigurationen följer med som den är, markerad som ofullständig om steg återstår | Användarens beslut | Beslut (2026-10-05) |
| Configurator, sammanfattning | Ingen | Den gamla sidopanelen (valda tillval, artikelnummer, broschyr) är borttagen; valen syns i offerten | Figma har bara totalpriset | Antagande |

## Frågor till designen

Ingen avvikelse i koden, men värt att rätta eller förklara i Figma:

- `choice` (`8268:3371`) har bara `Default` och `active`, inget hover-läge. Koden ger bara
  pekhanden. Förslag att ta upp: vit bakgrund (`bg-active`) vid hover, som inte förväxlas med det
  gula valda läget.
- Text & boxinfo på Tablet och Mobile: "390kr/mån" i rubriken har storleken 96px, resten 64 och
  48px. Det syns inte i skärmdumpen; koden använder rubrikens storlek för hela raden.
- `arrow-up&forward` är en rak högerpil, och den svängda pilen heter `arrow-halfup`. Koden följer
  Figmas namn.
- Link (`8309:3919`) har hover-texten `black`, inte en färgvariabel. Koden följer Figma.
- Ikonen `help` har egenskapen `Property 1=Default`, de andra `Variant=Default`.
- `public/milevas-logo.svg` (SEO och landningssidan) har en annan form än Figmas logotyp.
