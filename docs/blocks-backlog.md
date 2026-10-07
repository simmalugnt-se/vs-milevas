# Backlog: block från Figma

Från Figma "Milevas — Website", sidan "04 — Blocks" (yttre frame `6075:2761`), genomgången 2026-10-02
från struktur och skärmdumpar. Varje block har varianter för Desktop L, Desktop S, Tablet och Mobile,
så beteendet på mindre skärmar är ritat. Hämta designkontexten per variant när blocket byggs.
Avvikelser från Figma och frågor till designen står i `src/app/(frontend)/[locale]/kitchensink/figma-notes.ts` och visas på kitchensink.

Storlek: **S** (ett par timmar), **M** (en dag), **L** (flera dagar).

## 0. Förutsättningar

Beslutat 2026-10-02: full bredd med `grid/margin` för allt innehåll, även header och footer
(gjort). Blocken byggs först som komponenter i `src/components/blocks` med platshållarinnehåll på
`/kitchensink/blocks`; Hero, Product-Grid, Text+Grid och Text & boxinfo har Payload-fält sedan 2026-10-07.

- **Sidans layout.** Beslutat 2026-10-02: vit sidbakgrund tills vidare, och Hero går ut över
  marginalen (kant i kant). Kvar: nya namn för `surface`/`canvas` i `site-theme.css`.
- **Navigation och Footer** är egna komponenter som Header- och Footer-globalerna matar sedan
  2026-10-05 (`src/payload/globals/*/Component.tsx`). Header fick länkfältet `cta` för knappen och
  Footer fältet `email`; språkbytet sitter på footerns globe-ikon.
- **Nya block eller boilerplatens** (när komponenterna blir Payload-block). Boilerplaten har Hero,
  Cards, CallToAction, FAQ, Columns, Gallery, Media och RichText. Att byta deras utseende ger
  konflikter vid nästa boilerplate-uppdatering; egna Milevas-block gör inte det men dubblerar.

## Block, i föreslagen ordning

Genomgånget i Figma 2026-10-05: bara blocken i den första tabellen har innehåll i alla fyra lägen.

| # | Block | Figma | Innehåll | Bygger på | Payload | Storlek |
|---|---|---|---|---|---|---|
| 1 | Navigation ✓ komponent, ✓ Header-global | `8309:4506` | Rundad "pill" med logosymbol, länkar och knappen "Bygg din truck"; Mobile har en öppen meny (`State=Open`) | Logo, Button | Header-global (finns) | M |
| 2 | Footer ✓ komponent, ✓ Footer-global | `6076:622` | Länkar, ordmärket i full bredd, ikoner (mail, globe) | Logo, Icon, TextLink | Footer-global (finns) | S |
| 3 | Product-Grid ✓ komponent, ✓ Payload | `8365:8988` | Product-cards, 3 per rad på desktop, 2 på Tablet, en slider på Mobile | ProductCard | Nytt block, data från `TruckFamilies` | M |
| 4 | Text+Grid ✓ komponent, ✓ Payload | `8389:4705` | Rubrik med pil ("Så enkelt fungerar det") och cards i en ljus panel | Arrow, Card, card grid | Nytt block, eller Cards med nytt utseende | M |
| 5 | Text & boxinfo ✓ komponent, ✓ Payload | `8389:8524` | Mörk sektion: Display-rubrik i två färger, brödtext, en box med tre rader (rubrik, text, etikett) och en tejp-knapp | Choice-liknande rader, Button | Nytt block | M |
| 6 | Configurator ✓ skärm, ✓ kopplad (fas 2) | `8721:16450` | Totalpris, configurator-box med "Nästa", truckbild, "Boka samtal" | ConfiguratorBox, Button | Configurator-blocket (finns) | L |

### Väntar på designen

Grid och Image & Text byggs inte förrän Figma är klar. Hero har en första testversion från Page Template, med antaganden för mindre skärmar noterade på kitchensink.

| # | Block | Figma | Läget i Figma | Bygger på |
|---|---|---|---|---|
| 7 | Hero ✓ testkomponent, ✓ Payload | `8539:7103` | Desktop L och S: mörka kolumner (fem, inte fyra) med en gul aktiv kolumn, ingen bild; Tablet och Mobile är svarta ytor | TruckColumn, som också är ett utkast |
| 8 | Grid | `8389:4440` | Bara grå platser för 2, 3 och 4 (`count`) i varje läge; kanske en layouthjälp snarare än ett block | Card grid |
| 9 | Image & Text | `8721:19164` | Grå ytor i alla fyra lägen | Okänt |

Komponenterna text-box och truck-column (ramen "blabla" på "02 — Components") är också utkast:
de finns på kitchensink men ändras när ramen är klar.

## Frågor att lösa med designen

Står vid respektive block på `/kitchensink/blocks`, och de allmänna överst på `/kitchensink`
(`figma-notes.ts`).
