# Backlog: block från Figma

Från Figma "Milevas — Website", sidan "04 — Blocks" (yttre frame `6075:2761`), genomgången 2026-10-02
från struktur och skärmdumpar. Varje block har varianter för Desktop L, Desktop S, Tablet och Mobile,
så beteendet på mindre skärmar är ritat. Hämta designkontexten per variant när blocket byggs.
Avvikelser från Figma antecknas i [`figma-deviations.md`](./figma-deviations.md).

Storlek: **S** (ett par timmar), **M** (en dag), **L** (flera dagar).

## 0. Förutsättningar

Beslutat 2026-10-02: full bredd med `grid/margin` för allt innehåll, även header och footer
(gjort). Blocken byggs först som komponenter i `src/components/blocks` med platshållarinnehåll på
`/kitchensink/blocks`; Payload-block med riktiga fält kommer sedan.

- **Sidans layout.** Beslutat 2026-10-02: vit sidbakgrund tills vidare, och Hero går ut över
  marginalen (kant i kant). Kvar: nya namn för `surface`/`canvas` i `site-theme.css`.
- **Navigation och Footer** är egna komponenter, fristående från Header- och Footer-globalerna
  (beslutat 2026-10-02). Kopplingen till globalerna görs senare.
- **Nya block eller boilerplatens** (när komponenterna blir Payload-block). Boilerplaten har Hero,
  Cards, CallToAction, FAQ, Columns, Gallery, Media och RichText. Att byta deras utseende ger
  konflikter vid nästa boilerplate-uppdatering; egna Milevas-block gör inte det men dubblerar.

## Block, i föreslagen ordning

| # | Block | Figma | Innehåll | Bygger på | Payload | Storlek |
|---|---|---|---|---|---|---|
| 1 | Navigation ✓ komponent | `8309:4506` | Rundad "pill" med logosymbol, länkar och knappen "Bygg din truck"; Mobile har en öppen meny (`State=Open`) | Logo, Button | Header-global (finns) | M |
| 2 | Footer | `6076:622` | Länkar, ordmärket i full bredd, ikoner (mail, globe) | Logo, Icon, TextLink | Footer-global (finns) | S |
| 3 | Product-Grid | `8365:8988` | Product-cards, 3 per rad på desktop | ProductCard | Nytt block, data från `TruckFamilies` | M |
| 4 | Text+Grid | `8389:4705` | Rubrik med pil ("Så enkelt fungerar det") och cards i en ljus panel | Arrow, Card, card grid | Nytt block, eller Cards med nytt utseende | M |
| 5 | Grid | `8389:4440` | Grid med 2, 3 eller 4 platser (`count`); platserna är tomma i Figma | Card grid | Avgörs med 4: samma block utan rubrik? | S |
| 6 | Text & boxinfo | `8389:8524` | Mörk sektion: Display-rubrik i två färger, brödtext, en box med tre rader (rubrik, text, etikett) och en tejp-knapp | Choice-liknande rader, Button | Nytt block | M |
| 7 | Hero | `8539:7103` | Truck-columns över en bild i full bredd; en kolumn aktiv | TruckColumn | Nytt block, eller Hero med nytt utseende; priser från `TruckFamilies` | M |
| 8 | Image & Text | `8721:19164` | Grå platshållare i skärmdumpen; behöver designkontexten | Okänt | Okänt | ? |
| 9 | Configurator | `8721:16450` | Totalpris, configurator-box med "Nästa", truckbild, "Boka samtal" | ConfiguratorBox, Button | Configurator-blocket (finns) | L |

## Frågor att lösa med designen

- **Configurator, två versioner.** Frame 15 (`8721:16448`, nyare) och frame 12 (`8389:6542`,
  urblekt), samma mönster som på "02 — Components". Frame 15 visar "Totalt: $$$ kr" i stället för
  price-box. Om 15 gäller används inte price-box (byggd från frame 6) längre.
- **Två varianter per Configurator.** Båda frames har åtta varianter (`Device`, `Device5`–`Device8`):
  troligen två steg eller lägen per enhet. Kontrollera innan bygget.
- **Ikon som saknas.** "Boka samtal" har en telefonikon som inte finns bland ikonerna på
  "02 — Components".
- **Image & Text.** Skärmdumpen av Desktop L är en grå yta: platshållare eller en bild som inte
  exporteras?
- **Variantnamn.** Flera varianter heter `Device4`–`Device8` och `Variant2` i stället för Mobile och
  Desktop S. Det påverkar inte bygget, men namnen i Figma är otydliga.
