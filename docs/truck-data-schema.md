# Truckdata i Payload: kartläggning och förslag

> **2026-10-26:** trucktypen beskrivs som en produkt på en sida, och konfiguratorn bygger sina
> steg av den datan. Avsnitt 10 och 11 beskriver schemat som det är nu; 5 och 9 visar tidigare steg.

Skrivet 2026-10-23 inför Figmas nya konfigurator (`04 — Blocks` → Configurator, `9264:6653`), och
byggt samma dag (se avsnitt 8).

**Kort:** i dag beskriver en trucktyp hur konfiguratorn klickas igenom (steg → grupper → val),
inte vad trucken är. Förslaget vänder på det: schemat utgår från vad varje steg och vy i Figma
behöver (avsnitt 3). En trucktyp består av **modeller** med specifikationer och **val** som ändrar pris
och specifikationer, och konfiguratorns steg följer av det. Allt som visar en trucktyp, som heron,
navigationen och produktkorten, hämtar namn, bild och priser från trucktypen.

## Beslut

| Datum | Beslut |
|---|---|
| 2026-10-23 | Truckdatan i produktion och lokalt är platshållare. Den ersätts av en ny seed; ingen data flyttas över. |
| 2026-10-23 | Schemat bestäms av vad alla stegen och vyerna i Figma behöver, inte av ett datablad. |
| 2026-10-23 | Heron, navigationens Modeller, produktkorten och konfiguratorn kopplas till trucktyperna och hämtar namn och huvudbild därifrån, så att de ändras på ett ställe. |
| 2026-10-23 | Varje trucktyp har sin egen följd av val. |
| 2026-10-23 | Stegets typ väljs av innehållet; redaktören kan välja en annan (`display`). |
| 2026-10-23 | En huvudbild per trucktyp; heron, menyn och korten beskär den var för sig. |
| 2026-10-23 | Navigationens Modeller listar alla publicerade trucktyper i sorteringsordning. |
| 2026-10-26 | Produktdata först: trucktypen beskrivs som en produkt (varianter, batterier, lyfthöjder, tillval) på en sida utan flikar; konfiguratorns steg byggs av listorna. Ett alternativ ensamt är en specifikation, inget steg. Varianternas namn räknas fram ur kapaciteten. |
| 2026-10-27 | Stegens ordning och namn ställs in en gång för alla trucktyper i Konfiguratorinställningar. Valet av trucktyp och Lyftkapacitet ligger fast först, eftersom grundpriset sitter på varianten och allt annat läggs till det. Ett grundpris på trucktypen med tillägg per variant valdes bort: varje variant är en egen modell med eget listpris, och Figma visar varianten som offertens bas. Trucktyperna sorteras genom att dras i listan. |
| 2026-10-27 | Kunden väljer avtalslängd för leasing och långtidshyra med Figmas reglage, inom längderna i Konfiguratorinställningar. Restvärde finns bara för leasing. Månadskostnaden räknas tills vidare som (totalpris − restvärde) / antal månader; den riktiga uträkningen bestäms senare (`TODO(financing)`). |
| 2026-10-26 | Fasta fält i stället för kopplingar: specifikationerna och stegen (batteri, lyfthöjd, tillval) är fält på trucktypen, ett tomt fält eller steg visas inte. `truck-specs`, nycklarna och villkoren (`models`, `requires`, `excludes`) tas bort. |

## 1. Dagens schema

`TruckFamilies` ([config.ts](../src/payload/collections/TruckFamilies/config.ts)):

- Trucktypen: namn, nyckel, sortering, beskrivning, baspris, artikelnummer, bild, broschyr,
  leveranstid och garanti.
- `steps[]` → `groups[]` → `options[]`, tre nivåer. Ett val har pris med `priceMode` (ingår,
  pristillägg eller ersätt baspris), förval, artikelnummer, villkor och `specifications[]`.
- Villkoren (`allOf`, `anyOf`, `noneOf`) pekar på andra val med fri text, `grupp.alternativ`.
- `ConfiguratorSettings` (global): finansieringsformer (med månadskostnad: avtalslängder och, för leasing, restvärde), serviceavtal och offertens
  giltighetstid.
- `ConfiguratorRequests`: kontaktuppgifter och en ögonblicksbild (`snapshot`, JSON) av offerten.

Blocken har egna kopior av det som borde komma från trucktypen:

- **Heron:** en kolumn kan kopplas till en trucktyp, men har också egen truckbild, rubrik, Från-pris och
  leasing.
- **Produktgridens kort:** egen bild, eget namn, lyftkapacitet och batteri som text.
- **Navigationens Modeller:** vanliga länkar med egen bild; ingen koppling till trucktyperna.

## 2. Vem läser truckdata

| Ställe | Visar | Kommer i dag från |
|---|---|---|
| Produktkort (Product-Grid) | Namn, bild, "1.5 – 3.5 ton /// 80 V 228 Ah", Från-pris, leasing/mån | Namn, bild och priser från trucktypen eller kortets egna fält; specifikationerna skrivs för hand |
| Hero | Namn, bild, Från-pris, leasing/mån, länk till konfiguratorn | Trucktypen eller kolumnens egna fält |
| Navigationens Modeller | Namn och bild per truck | Header-globalens egna fält |
| Konfiguratorn, steg 0 | Trucktyperna med bild | Trucktypen |
| Konfiguratorn, stegen | `[01] Label`, val med titel, pris och text; hjälptext | `steps` och `groups`; val har ingen bild |
| Konfiguratorn, sista steget | Köp, leasing, långtidshyra, serviceavtal | `ConfiguratorSettings` |
| Price-box | Totalt och månadspriser | Motorn (`estimateTotal`, `calculateFinancingPrice`) |
| Offertsidan (`/configurator/quote`) | Raderna, specifikationer, broschyr, finansiering, leverans, garanti | `buildQuote`; specifikationerna är de som valen bär |
| Mejlen och förfrågningarna | Offerten | `snapshot` (JSON), oberoende av schemat |
| URL:en | Valen | `selection=grupp.alternativ` |

## 3. Kraven från Figma, steg för steg

Varje rad är något Figma visar och det fält i förslaget (avsnitt 5) som bär det.

| Vy i Figma | Visar | Fält |
|---|---|---|
| Alla steg | `[01] LABEL` överst, "Föregående" och "Nästa" | `choices[].label`; numret är stegets plats |
| Alla steg | Truckbilden bakom stegen | `image` (trucktypens huvudbild) |
| Typ 1 (sex val, två per rad) | Titel, pris och text per val; i Figma kapaciteten | `models[]`: `label`, `price`, `description` |
| Typ 2 (två val under varandra) | Titel, pris, text och "Behöver du hjälp …? Kontakta oss" | `options[]`: `label`, `price`, `description`; `choices[].help` |
| Typ 3 (fyra val med bild, två per rad) | Titel, pris, bild och text | `options[].image` |
| Typ 4 (tre val, bild till höger) | Titel, pris, bild och text | `options[].image` |
| Typ 5 (tre val, bara titel och pris) | Titel och pris, stort | `options[]` utan `description` |
| Price-boxen under stegen | Totalpris, Leasing (48 mån), Långtidshyra, "Boka samtal" | Modellens och valens priser; finansieringsformerna i inställningarna |
| Offerten, rubrik | "Elektrisk motviktstruck", i singular | `singularName` |
| Offerten, Konfiguration | "Elektriska motviktstruckar – bas (1,8 ton)" med pris, sedan ett val per rad, även de som kostar 0 kr | `name`, `models[].label` och `price`, `options[].label` och `price` |
| Offerten, Tekniska specifikationer | Vändradie, Körhastighet (lastad/olastad), Batterikapacitet, Vikt, Truckens bygghöjd | `specs[]` på trucktyp, modell och val; namn, enhet och ordning från `truck-specs` |
| Offerten, price-boxen | Totalpris, Leasing (48 mån), Uppskattad leverans, Garanti med förklaring | `deliveryTime`, `warranty`; förklaringen i inställningarna |
| Offerten, knappar | "Skicka kopia till mig", "Fortsätt beställning" | Inga truckdata |
| Tack-sidan | "Tack för din beställning!", "Vad händer nu?" med fem steg | `nextSteps[]` i inställningarna |
| Popup (order, call, call-booked) | Formulären | Inga truckdata; förfrågan sparar offerten |
| Produktkortet | Namn, bild, lyftkapacitet som intervall, batteri, Från-pris, leasing | `name`, `image`, `models[].capacityKg`, en specifikation med `onCard`, lägsta modellpriset |
| Heron | Namn, bild, Från-pris, Leasing från | `name`, `image`, lägsta modellpriset |
| Navigationens Modeller | Namn och bild per truck | `name`, `image` |

Plocktruckar fanns först i heron, menyn och produktgriden men inte i konfiguratorn, som en
trucktyp utan modeller och val vars kort länkade till kontakt. Sedan 2026-10-26 har den
platshållarvarianter i seeden som de andra och går att konfigurera; en trucktyp utan varianter
länkar fortfarande till sin kontaktlänk.

## 4. Det som inte räcker

1. **Specifikationerna finns inte som data.** Offertens tabell och produktkortens rad har inget att
   hämta från; produktkortens text skrivs för hand och kan säga emot konfiguratorn.
2. **Modellerna är val.** 1,5–3,5 ton är var sin modell med eget artikelnummer, pris och
   specifikationer, men byggda som ett val som "ersätter baspriset". Trucktypens `basePrice` och `sku`
   blir då dubbletter av det förvalda valet.
3. **Stegen styr datan.** Ett val kan bara finnas i ett steg, och stegens ordning och texter ligger
   blandade med priser. Figma visar en grupp per steg, så stegnivån tillför bara en nivå till.
4. **Villkoren är fri text.** Ett felstavat `grupp.alternativ` märks inte förrän valet försvinner i
   konfiguratorn.
5. **Visningen saknas.** Val har ingen bild (Figmas typ 3 och 4), och det finns inget som säger hur
   ett steg ska se ut.
6. **Samma sak på flera ställen.** Namn, bild och priser för en trucktyp finns i trucktypen, i heron, i
   produktgriden och i navigationen, och måste ändras på varje ställe.
7. **Texter som är lika för alla** (tack-sidans steg, garantins förklaring) har ingen plats.

## 5. Förslag

### 5.1 Specifikationer (ny samling, `truck-specs`)

En gemensam lista över specifikationstyper, så att offerten, produktkorten och mejlen skriver dem
likadant och i samma ordning.

| Fält | Exempel |
|---|---|
| `key` | `turning-radius` |
| `label` (lokaliserad) | Vändradie |
| `unit` | mm |
| `sortOrder` | 30 |
| `onCard` | Visas på produktkortet efter lyftkapaciteten (batteri) |

Värdena är text (`1870 / 1850`, `76,8 V · 150 / 228 Ah`), eftersom Figma blandar tal, intervall och
par. Lyftkapaciteten är ett tal på modellen (`capacityKg`), så att produktkortets intervall kan räknas
fram.

### 5.2 Trucktyp (`truck-families`)

Det enda stället för en trucktyps namn, bild och priser.

| Fält | Ändring |
|---|---|
| `name`, `key`, `sortOrder`, `description`, `brochure`, `deliveryTime` | Som i dag |
| `image` | Huvudbilden: en frilagd truck, som heron, menyn, produktkorten och konfiguratorn beskär var för sig |
| `singularName` (ny) | "Elektrisk motviktstruck", för offertens rubrik |
| `configurable` (ny) | Av för en trucktyp utan varianter: inga modeller eller val, och korten länkar till kontakt (räknas sedan 2026-10-26 fram ur varianterna) |
| `contactLink` (ny) | Länken när trucktypen inte går att konfigurera |
| `warranty` | Kort ("4 år"); förklaringen ligger i inställningarna |
| `basePrice`, `sku` | Tas bort; finns på modellerna |
| `specs[]` (ny) | Det som är lika för alla modeller i trucktypen: `{ spec, value }` |
| `models[]` (ny) | Se 5.3 |
| `choices[]` (ersätter `steps`) | Se 5.4 |

### 5.3 Modeller (`models[]` i trucktypen)

| Fält | Exempel |
|---|---|
| `key` | `kbet-18` |
| `label` (lokaliserad) | 1,8 ton |
| `description` (lokaliserad) | Texten under titeln i Figmas typ 1 |
| `sku` | KBET 18 Li G1 |
| `price` | 184 000 |
| `capacityKg` | 1800 |
| `default` | Förvald |
| `specs[]` | `{ spec, value }`, det som skiljer från trucktypen |

Modellen är konfiguratorns första steg. Produktkortets intervall och Från-priset räknas fram ur
modellerna.

### 5.4 Val (`choices[]` i trucktypen, ersätter `steps` och `groups`)

Ett val är ett steg i konfiguratorn, i den ordning de ligger.

| Fält | Exempel |
|---|---|
| `key`, `label`, `heading` (lokaliserade) | `battery`, Batteri, Välj batteri |
| `help` (lokaliserad) | "Behöver du hjälp med andra mastalternativ?" |
| `selectionMode`, `required` | Enkelval, krävs |
| `display` (valfri) | Figmas typ; annars väljs den av innehållet (bild → typ 3 eller 4, utan text → typ 5) |
| `options[]` | Se nedan |

Alternativen:

| Fält | Exempel |
|---|---|
| `key`, `label`, `description` (lokaliserade) | `large-li-ion`, Stort batteri (Li-Ion) |
| `image` (ny) | För Figmas typ 3 och 4 |
| `price` | 18 000; 0 betyder "Ingår" |
| `default` | Förval |
| `sku` | Om valet byter artikelnummer |
| `models[]` | De modeller valet finns för; tomt betyder alla |
| `requires[]`, `excludes[]` | Andra alternativ, som `lift-height.6000-mm` |
| `specs[]` | Specifikationer valet sätter, som bygghöjd för en mast eller batterikapacitet |

Nycklarna i `models`, `requires` och `excludes` kontrolleras när trucktypen sparas, så att ett
felstavat val stoppas i admin i stället för att försvinna i konfiguratorn. "Ersätt baspris" behövs
inte längre: modellen bär baspriset och alla val lägger till.

### 5.5 Inställningar (`configurator-settings`, utökad)

Som i dag, plus garantins förklaring och tack-sidans steg ("Vad händer nu?"), lokaliserade.

### 5.6 Blocken och navigationen

| Ställe | Behåller | Tas bort |
|---|---|---|
| Heron, kolumn | Kopplingen till trucktypen, rubriken ("Bygg din truck:") | Truckbild, Från-pris, leasing; namnet och länken kommer från trucktypen |
| Produktgridens kort | Kopplingen till trucktypen | Bild, namn, lyftkapacitet, batteri, länk; bildens utsnitt och passning (2026-10-26) |
| Navigationens Modeller | Menyn och dess ordning | Länkarna och bilderna; menyn listar trucktyperna (alla, eller de som väljs) |

Ingen av dem beskär huvudbilden: den är en frilagd truck och visas hel överallt. Produktkortens
bildpassning och utsnitt togs bort 2026-10-26; inget kort använde något annat än hela bilden.

### 5.7 Specifikationerna i offerten

Modellens specifikationer gäller över trucktypens, och valens över modellens. Ordningen och enheten
kommer från `truck-specs`. Ögonblicksbilden i förfrågningarna sparar etikett och värde som i dag,
så gamla förfrågningar visas som förut.

## 6. Flytt

- Trucktyperna ligger i egna databastabeller (inte JSON som blocken), så schemat kräver en
  migrering. Den testas mot en kopia med produktionens läge, aldrig mot produktion.
- Datan är platshållare, så migreringen tar bort de gamla tabellerna och skapar de nya; en ny seed
  fyller dem med Figmas exempel (kapaciteter, batterier, master, specifikationerna i offerten).
- Header-globalen, heron och produktgriden får nya fält och tappar gamla. Heron och produktgriden är
  block (JSON), Header-globalen har egna tabeller och får en migrering.
- URL:en byter `selection=grupp.alternativ` mot `model=…` och `choice.option`; gamla länkar faller
  tillbaka på förvalen.

## 7. Öppna frågor

Inga; frågorna är besvarade (se Beslut).

## 8. Ordning för bygget

Alla fyra stegen är byggda 2026-10-23 (migreringarna `20261023_091729_truck_catalog` och
`20261023_094139_spec_in_quote`).

1. `truck-specs`, trucktypen med modeller och val, inställningarna, migreringen och en ny seed.
2. Motorn (`engine.ts`), URL:en och testerna på den nya modellen; offerten och förfrågningarna.
3. Heron, produktgriden och navigationen kopplade till trucktyperna.
4. Figmas konfigurator: stegtyperna, price-boxen, offerten och tack-sidan.

## 9. Fasta fält (2026-10-26)

Kopplingarna i 5.1–5.4 gjorde att man kunde lägga till nya steg och specifikationer utan att ändra
koden, men Figma visar ett och samma flöde för alla truckar. Trucktypen har därför fasta fält
(migreringen `20261026_084255_truck_fixed_fields`):

| Fält | Innehåll |
|---|---|
| `specs` | Batteri (bara produktkortet), Vändradie, Körhastighet, Batterikapacitet, Vikt och Truckens bygghöjd, som text. Namn, enhet och ordning står i `TruckFamilies/specs.ts`. |
| `modelChoice`, `models[]` | Modellstegets etikett och rubrik; modellerna med namn, artikelnummer (under namnet, som i Figma), pris, kapacitet, förval och egna `specs` som ersätter trucktypens. |
| `battery.options[]` | Namn, text, pris och förval. Ett val. |
| `liftHeight.help`, `liftHeight.options[]` | Hjälptexten; namn, mastens bygghöjd, pris och förval. Bygghöjden visas som "Truckens höjd med denna mast" och ersätter trucktypens i offerten. Ett val. |
| `extras.options[]` | Namn, text, bild och pris. Flera val, inget krävs. |

- Ett steg utan alternativ hoppas över. Stegens etiketter, rubriker och typer står i
  `features/configurator/data.ts`.
- Modellerna och alternativen pekas ut med radens id, i URL:en och i förfrågningarna. Inga nycklar
  skrivs för hand; trucktypens `key` finns kvar som adressens namn på trucktypen.
- Motorn (`engine.ts`) är densamma, utan villkoren: `data.ts` gör om fälten till dess modell och val.

## 10. Produktsidan (2026-10-26)

Fälten i avsnitt 9 följde fortfarande konfiguratorns steg (flikar som "Steg", stegets etikett och
rubrik, specifikationer både på trucktyp och modell). Trucktypen beskriver nu trucken som produkt, på en
sida (migreringen `20261026_135318_truck_product_page`):

| Fält | Innehåll |
|---|---|
| `name`, `singularName` | Plural (menyer, kort) och singular (offertens rubrik); ett lodstreck markerar var ett ord får avstavas |
| `description`, `image`, `brochure`, `travelSpeed`, `deliveryTime`, `warranty` | Om trucktypen |
| `contactLink` | Dit kort och menyer länkar när trucktypen saknar varianter; utan varianter går den inte att konfigurera (det finns inget eget fält för det) |
| `models[]` (Lyftkapacitet) | `capacityKg`, `sku`, `price` (grundpris), `weight`, `turningRadius`, förval. Namnet ("1,6 ton") räknas fram |
| `batteries[]` | Benämning, `capacity` ("80 V 228 Ah"), text, pristillägg, förval |
| `liftHeights[]`, `liftHeightHelp` | `liftHeight` och `buildHeight` i mm, pristillägg, förval; hjälptexten när det finns flera |
| `extras[]` | Namn, text, bild, pris |
| `key` (sidopanelen) | Nyckeln skapas ur namnet om den är tom (ordningen: se avsnitt 11) |

Konfiguratorn (`features/configurator/data.ts`) bygger stegen av listorna: Lyftkapacitet, Batteri
och Lyfthöjd när det finns fler än ett, Tillval när det finns något, sedan Finansiering. Ett batteri
eller en mast ensam är en del av trucken: dess specifikation står i offerten och dess pris ingår i
grundpriset. Produktkortet visar det förvalda batteriets kapacitet. Offertens specifikationer kommer
från trucktypen (körhastighet), varianten (vikt, vändradie), batteriet (batterikapacitet) och masten
(bygghöjd), i ordningen i `TruckFamilies/specs.ts`. Listraderna i admin visar sitt innehåll
(`TruckFamilies/RowLabels.tsx`).

## 11. För redaktören (2026-10-27)

Migreringen `20261027_091217_editor_steps_and_order`:

- **Stegens ordning och namn** står i Konfiguratorinställningar, fliken Steg. Steg 1 är valet av
  trucktyp och steg 2 alltid varianterna (Lyftkapacitet), eftersom grundpriset sitter på varianten;
  `modelStepLabel` är deras namn. `steps[]` är de övriga stegen (`battery`, `lift-height`, `extras`),
  en rad var med namnet i konfiguratorn, sorterade genom att dras. Listan visar alltid alla tre: en
  rad som saknas läggs tillbaka på sin vanliga plats (`orderedSteps` i
  `features/configurator/steps.ts`), och sajten gör likadant. Vilka steg en trucktyp får avgör
  `stepRole` i samma fil.
- **Trucktypens flikar:** Om trucktypen och Konfigurator. Överst i Konfigurator visar
  `ConfiguratorOverview.tsx` vad konfiguratorn blir medan man skriver: stegen i ordning, vad som ingår
  för att det är ensamt, vad som inte visas, priset med förvalen och listor som saknar ett förval.
- **Förval:** med fler än en variant, ett batteri eller en mast måste exakt en vara förvald för att
  trucktypen ska gå att publicera, och kryssrutan syns bara då. En ensam variant är förvald.
- **Ordningen** mellan trucktyperna är Payloads `orderable` (`_order`, dras i listvyn) i stället för
  `sortOrder`. Migreringen behåller den ordning siffrorna gav.
- **Förhandsvisning:** trucktypen förhandsvisas i konfiguratorn på sitt första steg, med utkastet.
- **Nyckeln** går inte att ändra när trucktypen har publicerats (`publishedAt`), eftersom delade
  länkar och sparade konfigurationer pekar på den.
- **Finansiering** (migreringen `20261027_092134_financing_terms`): ett sätt med månadskostnad har
  kortaste och längsta avtalslängd, steg och förvald längd (`minMonths`, `maxMonths`, `monthsStep`,
  `months`) och, för leasing, `residualPercent`. Konfiguratorn visar reglaget i valt
  Financiering; den valda längden står i adressen (`months`) och följer med i offerten,
  förfrågningarna och mejlen. `withTerm` och `calculateFinancingPrice` i `engine.ts` räknar.
