# Designsystemet: läge och hur du fortsätter

Läget 2026-10-07, branch `develop`. Designsystemet byggs från Figma-filen "Milevas — Website" i
omgångar: "01 — Foundations" och "02 — Components" är klara, och "04 — Blocks" pågår.

## Var allt finns

| Vad | Var |
|---|---|
| Tokens (färger, primitiver, textstilar, brytpunkter, storlekar, spacing, stroke, grid, radier, motion) | `src/styles/site-theme.css` |
| Figmas variabler som JSON (en fil per samling och läge) | `docs/figma-variables/`; `tests/design-tokens.test.mts` jämför CSS:en med dem |
| Clash Grotesk Variable (WOFF2, vikter 200–700) och licens | `src/app/(frontend)/fonts/clash-grotesk/`; laddas via `next/font/local` i `[locale]/layout.tsx` |
| Komponenter (Icon, Arrow, Logo, Button, TextLink, NavLink, FooterLink, TextField, TextAreaField, Alternative, TimePicker, ContactForm, ProductCard, TruckInfo, Card, ColorImageCard, ConfiguratorTopbar, Choice, FinancingChoice, CheckboxChoice, ConfiguratorBox, PriceBox, TextBox, TruckColumn) | `src/components/ui/` |
| Block som komponenter (Navigation, Footer, Milevas Hero, Product-Grid, Text+Grid, Text & boxinfo) | `src/components/blocks/`; Navigation och Footer matas av Header- och Footer-globalerna i `src/payload/globals/*/Component.tsx` |
| Referenssidor, noindex och 404 i produktion | `/kitchensink` (Grunder: tokens, ikoner, knappar, länkar, formfält), `/kitchensink/components` (sammansatta komponenter), `/kitchensink/blocks` (hela block), `/kitchensink/notes` (alla frågor och avvikelser) |
| Kitchensinks sidor och sektioner, layout och delade delar | `kitchensink/sections.ts` (flikar, sektionsindex och länkar), `layout.tsx`, `ui.tsx` (`KitchensinkPage`, `Group`, `Section`, `Example`) |
| Listorna kitchensink visar, som testet jämför med CSS:en | `src/app/(frontend)/[locale]/kitchensink/*.ts` |
| Test för tokens | `tests/design-tokens.test.mts` |
| Ikoner, pilar och logotyp från Figmas SVG:er | `scripts/figma-svgs/` |
| Backlog för blocken | [`blocks-backlog.md`](./blocks-backlog.md) |
| Avvikelser från Figma, egna beslut och frågor till designen | `src/app/(frontend)/[locale]/kitchensink/figma-notes.ts`; visas vid sin sektion, och alla samlat på `/kitchensink/notes` med det som gäller hela sajten |

## Kom igång på en annan dator

1. Klona, `git checkout develop`, och sätt upp enligt `README.md` (`pnpm install`, `SERVICES=local`).
   Kitchensink-sidorna läser inget från databasen.
2. `pnpm dev` och öppna `/kitchensink`; flikarna leder till komponenter, block och frågor.
3. Figma desktop med filen öppen och dess MCP-server påslagen, så att en agent kan läsa markeringen.

För att fortsätta med en agent: be den läsa `AGENTS.md` och det här dokumentet, markera blocket i
Figma, och säg vilket nummer i backloggen det är.

## Arbetssätt för ett block

1. Markera blocket i Figma. Hämta `get_metadata` för strukturen, sedan `get_design_context` och
   `get_variable_defs` för blocket. Variablernas namn och värden gäller, inte skärmdumpen.
2. Bygg komponenten i `src/components/blocks/` med innehåll som props och återanvänd
   `src/components/ui/`. Lägg den på `/kitchensink/blocks` med platshållarinnehåll. En ny
   UI-komponent får en egen sektion på `/kitchensink` (byggstenar) eller `/kitchensink/components`
   (sammansatta), med id och titel i `sections.ts` och `figma`, `api` och en `Example` med
   etikett per variant.
3. Jämför i webbläsaren mot Figma vid 1440, 1100, 800 och 375 px (Desktop L, Desktop S, Tablet,
   Mobile). Mät höjder och bredder och kontrollera att sidan inte scrollar i sidled.
4. Bygg bara det som är ritat: inga egna hover-, fokus-, valda eller tomma lägen, animationer eller
   varianter. Det designern inte har ritat blir en anteckning med status `Lucka` (vad som saknas och
   vad som skulle behövas), och en fråga till designern där det behövs. Skriv in varje avvikelse,
   lucka och fråga i `figma-notes.ts` med komponenten eller blocket som `target` (`general` för hela
   sajten), gå igenom de äldre `Antagande`-posterna för samma komponent eller block, och bocka av
   blocket i `blocks-backlog.md`.
5. Rörelser (hover, klick, öppna och stänga) finns i prototypen, inte i `get_design_context`. Läs
   dem i Dev Mode: markera ramen, öppna Motion → Transitions, fäll ut en rad och kopiera dess CSS.
   Tider och kurvor följer prototypen; "Transitions (no code)" är Instant, alltså ingen rörelse.
   Lägg till `motion-reduce:transition-none`.
6. `pnpm check`, `pnpm typecheck`, `pnpm lint` och `pnpm test` ska gå igenom. Committa när
   användaren ber om det, och aldrig till `main`.

## Bra att veta

- **Klasser följer Figmas variabler**, även när det blir dubbelt: `text-ui-primary`,
  `bg-bg-fill`, `border-border-primary`, `text-text-m`.
- **Färglägen:** Figmas färger har lägena Light, Dark och Tejp. Sidan är Light; `mode-dark` eller
  `mode-tejp` på ett element byter färgerna för det och allt i det, som en Figma-frames läge
  (`mode-dark bg-bg-fill` är en mörk sektion, `mode-light` en ljus panel i den). Lägena tar
  varianter: `hover:mode-tejp`. Knappen har `variant="primary|secondary"` och tar färgerna från
  läget runt den, eller från `mode`.
- **Inga fasta höjder i px**, även när Figma har dem. Figma ritar bara varje läge vid en bredd
  (375, 800, 1280, 1440); en fast höjd ger andra proportioner så fort skärmen är bredare. Ta i
  stället proportionen från Figmas instans vid lägets designbredd (`aspect-[469/507]` per läge),
  och låt behållare vara så höga som sitt innehåll, med spacing-tokens mellan delarna.
- **Spacing och storlekar** ändras per läge och är vanliga CSS-variabler: `p-(--spacing-xs)`,
  `gap-(--grid-gap)`. Spacing ligger inte i Tailwinds tema, eftersom `--spacing-*` där också
  skulle styra `w-*` och `max-w-*` i boilerplaten.
- **Brytpunkter:** `tablet:`, `desktop-s:` och `desktop-l:`. Mobile är utan prefix. Tailwinds
  `sm`–`2xl` är kvar för boilerplate-blocken.
- **Enheter och skalning:** publika sajten använder `rem` för text, spacing, radier, ikonstorlekar
  och fasta layoutmått. Under Desktop L behålls webbläsarens grundstorlek. Från 1440px skalar
  `html.milevas-site` proportionellt (`1rem = viewportbredd / 90`, minst webbläsarens grundstorlek).
  1440px ger 16px/rem, 1920px ger cirka 21,33px/rem. Procent, `fr`, `vw` och aspektförhållanden
  används där måttet ska följa en behållare. Hårfina borders/rings från Tailwind behåller sina
  pixelmått; bilders pixelstorlekar, SVG-koordinater och `sizes` är metadata och ska inte konverteras.
  Payload-admin och e-post har egna stilar. Brytpunkter i rem utgår från webbläsarens grundstorlek,
  inte från sidans dynamiska root-storlek.
- **En ny token** i `site-theme.css` ska också in i kitchensinks lista, annars fallerar testet.
- **När Figmas variabler ändras:** exportera samlingarna (Variables → samling → Export) och ersätt
  filerna i `docs/figma-variables/<samling>/`. `pnpm test` visar då vad i `site-theme.css` som inte
  längre stämmer.
- **Gridet över sidan:** Ctrl+Shift+G visar sidans grid (`GridOverlay`, bara i utveckling), med
  samma `grid-layout` som blocken: 12 kolumner från Desktop S och 6 under, och en streckad kontur runt
  varje block (`data-layout-block`, satt i `RenderBlocks`, på header, footer och kitchensinks block).
  Valet sparas i webbläsaren.
- **Synlighet på `ButtonLink`/`Button`:** `hidden` förlorar mot komponentens `inline-flex`. Lägg
  synligheten på ett omslutande element.
- **Hover och aktivt läge på kitchensink** visas med `data-state="hover"` eller
  `data-state="active"`.
- **Urblekta frames i Figma** är gamla versioner. Den nyare har högre node-id (till exempel
  `8721:` mot `8389:`).
- **Sidbredd:** `main` har full bredd utan padding; blocken har sin egen marginal. Kitchensinks
  sidmarginal är `--ks-gutter`, och blocken där går kant i kant med `-mx-(--ks-gutter)`.
- **Nya ikoner:** markera Icons-framen, hämta asset-hasharna med `get_design_context`, lägg in
  namn (Figmas namn i kebab-case) och hash i `scripts/figma-svgs/assets.json`, kör
  `node scripts/figma-svgs/to-tsx.mjs icon` med Figma öppet och klistra in resultatet i
  `src/components/ui/icon.tsx`. Behåll `globe`, som inte längre finns i Figma; `arrow-right-s` hämtas
  bara när Form-framen är inläst.

## Startsidan som Payload-block (2026-10-07)

Fem egna block finns i `src/payload/blocks`: `MilevasHero`, `TextColumns`, `ProductGrid`,
`TextGrid` och `TextBoxinfo`. De återanvänder kitchensinks komponenter, har lokaliserade innehållsfält,
bildfält, länkar och markörer för visual editing. Boilerplatens block är kvar.

- Den publika sidlayouten är global: fullbredd utan yttre padding, sammanhängande CMS-block
  och navigation ovanpå innehållet som följer med vid scroll. Blocken ansvarar för sin egen spacing;
  layouten beror inte på vilket block som ligger först.
- Hero är `100svh` hög i alla bredder. Introt, trucksen som följer pekaren och snap-listan under
  Desktop S följer Figma Make-prototypen; varje kolumn kan ha en egen truckbild, annars används
  truckfamiljens. `pnpm seed:homepage -- --hero --publish-local` byter bara heron på en befintlig
  lokal startsida mot Figmas texter och prototypens truckbilder (`hero-*.png`).
- `textColumns` (Text block Collumns) direkt efter `milevasHero` renderas i `LinkedColumns`
  (`RenderBlocks.tsx`) när heron har två kolumner fler (sex och fyra): ett lager streck som står
  still på skärmen medan man scrollar, och heronas kolumner som byter bredd med det. Den första och
  sista krymper till inget och de andra blir text blockets, som i Figmas startsidesprototyp.
  Blocken döljer då sina egna streck från Desktop S. `--hero` till `seed:homepage` lägger in text
  blocket efter heron.
- Hero och produktkort kan kopplas till truckfamiljer: namn, bild och priser kan hämtas från
  konfiguratorn. Produktkortens bildutsnitt kan styras i Payload; testet använder Figmas utsnitt.
- `pnpm seed:homepage` skapar startsidan (`home`) samt navigation/footer som lokala utkast.
  `pnpm seed:homepage -- --publish-local` publicerar testet enbart lokalt. Kommandot kräver
  `SERVICES=local`, körs aldrig automatiskt och ersätter inte en startsida som redan har Milevas Hero.
  Figma-bilderna finns i `scripts/figma-homepage-assets` och laddas upp till Payload av scriptet.
- `pnpm seed:globals -- --publish-local` fyller bara i Header- och Footer-globalerna efter Figma
  (menyerna med truckbilderna och login; footerns kolumner, kontakt och copyright), utan att röra
  startsidan. Samma krav som ovan.
- Ingen ny SQL-migrering behövs för blocken: `blocksAsJSON` lagrar block och relationer i sidans
  JSON. Header- och Footer-globalernas nya fält har egna migreringar (`20261022_123131_header_menus_login`,
  `20261022_125150_footer_columns_contact`).
- `pnpm test:milevas-blocks` provar sparande, relationer, lokaliserad text och upprepad seed i
  en egen tillfällig databas. Befintliga migrationsfiler bygger hela schemat.

Heron, plocktruckens kontaktlänk, specifikationerna och kvarvarande
text-platshållare är dokumenterade vid blocken i `figma-notes.ts`. Clash Grotesk Variable används
för Display, Text och sajtens standardtext; Label använder Geist Mono.

## Nästa steg

1. **Offertsidan** (`/configurator/quote`, orderformuläret) i designsystemets stil; Figma har ingen
   skiss. Image & Text väntar på designen, och text-box och truck-column är utkast
   tills ramen "blabla" är klar.
2. **Väntar på designen eller på dig:**
   - en genomgång av posterna med status Antagande och frågorna till designen, på `/kitchensink/notes`
