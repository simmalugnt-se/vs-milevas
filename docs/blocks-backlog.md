# Backlog: block från Figma

Från Figma "Milevas — Website", sidan "04 — Blocks" (yttre frame `6075:2761`). Kontrollerad mot Figma
2026-10-23: strukturen (`get_metadata`) och skärmdumpar av varje block. Varje block har varianter för
Desktop L, Desktop S, Tablet och Mobile. Hämta designkontexten och rörelserna per variant när blocket
byggs, och kontrollera Figma igen innan du litar på en rad här: noderna byts när designern ritar om.
Avvikelser från Figma och frågor till designen står i `src/app/(frontend)/[locale]/kitchensink/figma-notes.ts` och visas på kitchensink.

Storlek: **S** (ett par timmar), **M** (en dag), **L** (flera dagar).

## Förutsättningar

Beslutat 2026-10-02: full bredd med `grid/margin` för allt innehåll, även header och footer
(gjort). Blocken byggs först som komponenter i `src/components/blocks` med platshållarinnehåll på
`/kitchensink/blocks`, och blir sedan egna Milevas-block i Payload (`src/payload/blocks`).

- **Sidans layout.** Beslutat 2026-10-02: vit sidbakgrund tills vidare, och Hero går ut över
  marginalen (kant i kant). Kvar: nya namn för `surface`/`canvas` i `site-theme.css`.
- **Navigation och Footer** är egna komponenter som Header- och Footer-globalerna matar sedan
  2026-10-05 (`src/payload/globals/*/Component.tsx`).
- **Boilerplatens block** (Hero, Cards, CallToAction, FAQ, Columns, Gallery, Media och RichText) är
  kvar. Att byta deras utseende ger konflikter vid nästa boilerplate-uppdatering, så Milevas block är
  egna.

## Blocken, i Figmas ordning

Byggt betyder att komponenten finns på `/kitchensink/blocks`; Payload att den också är ett block
eller en global. Text & boxinfo byggdes 2026-10-07 och har inte jämförts med Figma sedan dess.

| # | Block | Figma | Innehåll i Figma | I koden | Bygger på | Storlek |
|---|---|---|---|---|---|---|
| 1 | Navigation | `9051:12518` | Genomskinlig rad med logotypen, menyerna Modeller, Tjänster och Om oss, och "Dealer login"; Dark och Light. Menyerna öppnar paneler, Modeller med en bild per truck; Mobile och Tablet har "[Meny]" | ✓ Byggt (2026-10-21), ✓ Header-global med menyer och login (2026-10-22) | Logo, NavLink, TextLink | L |
| 2 | Footer | `9264:22371` | Gult kort med kolumnerna Produkter, Tjänster och Kontakt, copyright och ordmärket | ✓ Byggt, ✓ Footer-global (2026-10-22) | Logo, FooterLink | S |
| 3 | Grid | `8389:4440` | Inget eget block: platserna (2, 3 och 4) som blocken lägger innehåll i | ✓ `card-grid-2/3/4` (2026-10-22) | | S |
| 4 | Hero | `8539:7103` | Start (rubrik och uppmaning) och Collumns (fem kolumner, en gul); rörelsen och truckbilderna finns i Figma Make-prototypen (länken står i Figma) | ✓ Byggt, ✓ Payload `milevasHero` (2026-10-22). Sex kolumner i stället för fem, så att strecken går till text blockets fyra (beslut 2026-10-22) | TruckColumn, Icon | L |
| 5 | Text block Collumns | `8982:9898` | Mörk sektion med en kolumn per logotyp (KION, STILL, Linde, Baoli) och en centrerad rubrik med text. Direkt efter heron delar blocken streck som flyttas med scrollen ("05 — Pages": "prototyp (ish) startsida") | ✓ Byggt, ✓ Payload `textColumns` och `LinkedColumns` (2026-10-22) | LinkedColumns | M |
| 6 | Image & Text | `9098:16638` | Foto över hela blocket med en centrerad Display-rubrik ("Service du kan räkna med"), brödtext och en Tejp-knapp ("Bygg din truck"); 800 hög i alla fyra lägen. Desktop L är 1424 och Desktop S 1264 bred, inte 1440 och 1280 | ✓ Byggt, ✓ Payload `imageText` (2026-10-23) | Button | M |
| 7 | Product-Grid | `8365:8988` | Product-cards, 3 per rad på desktop, 2 på Tablet, en slider på Mobile | ✓ Byggt, ✓ Payload `productGrid` (2026-10-07), data från `TruckFamilies`; jämförd med Figma 2026-10-23 | ProductCard | M |
| 8 | Text+Grid | `8389:4705` | Rubrik med pil ("Så enkelt fungerar det") och cards i en ljus panel | ✓ Byggt, ✓ Payload `textGrid` (2026-10-07); jämförd med Figma 2026-10-23 | Arrow, Card, card grid | M |
| 9 | Text & boxinfo | `8389:8524` | Mörk sektion: Display-rubrik i två färger, brödtext, en box med tre rader (rubrik, text, etikett) och en Tejp-knapp | ✓ Byggt, ✓ Payload `textBoxinfo` (2026-10-07) | TextBox, Button | M |
| 10 | Configurator | `9264:6653` | Fem stegtyper i en configurator-box med "Föregående" och "Nästa": (1) sex val, två per rad, med titel, pris och text; (2) två val under varandra och "Behöver du hjälp …"; (3) fyra val med bild, två per rad; (4) tre val med bild till höger; (5) tre val med titel och pris. Price-box med Totalpris, Leasing och Långtidshyra, och "Boka samtal". Därtill **offert** (konfigurationen, tekniska specifikationer, "Skicka kopia till mig" och "Fortsätt beställning") och **TNX!** ("Tack för din beställning!" med fem steg) | Stegskärmen är byggd och kopplad till konfiguratorn (2026-10-05) efter ram 15 (`8721:16450`), som inte längre finns i Figma; den skiljer sig åtminstone i price-boxen och i valen med bild. Offert och TNX! finns inte: offertsidan `/configurator/quote` har inte designsystemets stil | ConfiguratorBox, Choice, PriceBox, Button | L |
| 11 | Popup | `8882:14589` | Vit dialog med kryss i tre typer: order ("Fortsätt beställning", fyra fält), call ("Boka samtal", fält två per rad, dag och tid) och call-booked ("Bokning bekräftad" med en knapp) | ContactForm (`type` order och call) finns som komponent (`9309:27343`), men inte som dialog; konfiguratorn har en egen dialog. call-booked finns inte | ContactForm, TextField, TimePicker | M |
| 12 | Card Slider | `8946:8317` | En rad kort som går ut över kanten: etikett ("[01] /// Lager, leverans och service") överst och Text XL nederst; grått, gult och grått kort, med ett foto i det första på Tablet och Mobile | Inte byggt | ColorImageCard | M |
| 13 | Text-block | `8946:10622` | Mörk rad med en pil till vänster och Text XL; med `paragraph=true` även en brödtext under. Pilen pekar nedåt på Mobile | Inte byggt | Arrow | S |
| 14 | Contact | `9098:22568` | Mörk sektion: "Kontakt" i Display, en numrerad lista (e-post, telefon, Facebook och LinkedIn) och ett formulär med fyra fält, ett textfält och en Tejp-knapp "Skicka" | ContactForm (`type="contact"`) finns som komponent; blocket finns inte | ContactForm, TextField | M |
| 15 | Login | `9170:26321` | Logga in och Skapa konto: foto till vänster och formuläret till höger på desktop, bara formuläret på Tablet och Mobile | Inte byggt; Header-globalen har bara länken "Dealer login". Vad inloggningen ska ge åtkomst till är inte bestämt | TextField, Button | M |

Komponenterna text-box och truck-column ligger i ramen "blabla" på "02 — Components", som var ett
utkast 2026-10-22. Det kontrollerades inte 2026-10-23.

## Frågor att lösa med designen

Står vid respektive block på `/kitchensink/blocks`, och alla samlat med de allmänna på
`/kitchensink/notes` (`figma-notes.ts`).
