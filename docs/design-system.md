# Designsystemet: läge och hur du fortsätter

Läget 2026-10-05, branch `develop`. Designsystemet byggs från Figma-filen "Milevas — Website" i
omgångar: "01 — Foundations" och "02 — Components" är klara, och "04 — Blocks" pågår.

## Var allt finns

| Vad | Var |
|---|---|
| Tokens (färger, textstilar, brytpunkter, storlekar, spacing, grid, radier) | `src/styles/site-theme.css` |
| Komponenter (Icon, Arrow, Logo, Button, Choice, ProductCard, Card, ConfiguratorBox, PriceBox, TextBox, TruckColumn) | `src/components/ui/` |
| Block som komponenter (Navigation, Footer) | `src/components/blocks/`; Navigation och Footer matas av Header- och Footer-globalerna i `src/payload/globals/*/Component.tsx` |
| Referenssidor, noindex och 404 i produktion | `/kitchensink` (foundations och komponenter, en sektion per komponent med Figma-id och props), `/kitchensink/blocks` |
| Listorna kitchensink visar, som testet jämför med CSS:en | `src/app/(frontend)/[locale]/kitchensink/*.ts` |
| Test för tokens | `tests/design-tokens.test.mts` |
| Ikoner, pilar och logotyp från Figmas SVG:er | `scripts/figma-svgs/` |
| Backlog för blocken | [`blocks-backlog.md`](./blocks-backlog.md) |
| Avvikelser från Figma och egna beslut | [`figma-deviations.md`](./figma-deviations.md) |

## Kom igång på en annan dator

1. Klona, `git checkout develop`, och sätt upp enligt `README.md` (`pnpm install`, `SERVICES=local`).
   Kitchensink-sidorna läser inget från databasen.
2. `pnpm dev` och öppna `/kitchensink` och `/kitchensink/blocks`.
3. Figma desktop med filen öppen och dess MCP-server påslagen, så att en agent kan läsa markeringen.

För att fortsätta med en agent: be den läsa `AGENTS.md` och det här dokumentet, markera blocket i
Figma, och säg vilket nummer i backloggen det är.

## Arbetssätt för ett block

1. Markera blocket i Figma. Hämta `get_metadata` för strukturen, sedan `get_design_context` och
   `get_variable_defs` för blocket. Variablernas namn och värden gäller, inte skärmdumpen.
2. Bygg komponenten i `src/components/blocks/` med innehåll som props och återanvänd
   `src/components/ui/`. Lägg den på `/kitchensink/blocks` med platshållarinnehåll. En ny
   UI-komponent får en egen sektion på `/kitchensink` (i `contents` överst i sidan), med
   `figma`, `api` och en `Example` med etikett per variant.
3. Jämför i webbläsaren mot Figma vid 1440, 1100, 800 och 375 px (Desktop L, Desktop S, Tablet,
   Mobile). Mät höjder och bredder och kontrollera att sidan inte scrollar i sidled.
4. Skriv in varje avvikelse och varje lucka du fyller i `figma-deviations.md`, och bocka av blocket
   i `blocks-backlog.md`.
5. `pnpm check`, `pnpm typecheck`, `pnpm lint` och `pnpm test` ska gå igenom. Committa när
   användaren ber om det, och aldrig till `main`.

## Bra att veta

- **Klasser följer Figmas variabler**, även när det blir dubbelt: `text-ui-primary`,
  `bg-bg-surface`, `border-border-primary`, `text-text-m`.
- **Spacing och storlekar** ändras per läge och är vanliga CSS-variabler: `p-(--spacing-xs)`,
  `gap-(--grid-gap)`. Spacing ligger inte i Tailwinds tema, eftersom `--spacing-*` där också
  skulle styra `w-*` och `max-w-*` i boilerplaten.
- **Brytpunkter:** `tablet:`, `desktop-s:` och `desktop-l:`. Mobile är utan prefix. Tailwinds
  `sm`–`2xl` är kvar för boilerplate-blocken.
- **En ny token** i `site-theme.css` ska också in i kitchensinks lista, annars fallerar testet.
- **Synlighet på `ButtonLink`/`Button`:** `hidden` förlorar mot komponentens `inline-flex`. Lägg
  synligheten på ett omslutande element.
- **Hover och aktivt läge på kitchensink** visas med `data-state="hover"` eller
  `data-state="active"`.
- **Urblekta frames i Figma** är gamla versioner. Den nyare har högre node-id (till exempel
  `8721:` mot `8389:`).
- **Sidbredd:** `main`, header och footer har full bredd med `px-(--grid-margin)`. Block som går kant i
  kant (Hero) behöver gå ut över marginalen; på kitchensink görs det med `-mx-(--grid-margin)`.
- **Nya ikoner:** lägg till namn och asset-hash i `scripts/figma-svgs/assets.json`, kör
  `node scripts/figma-svgs/to-tsx.mjs icon` med Figma öppet och klistra in resultatet i
  `src/components/ui/icon.tsx`.

## Nästa steg

1. **Block 3, Product-Grid** (`8365:8988`), sedan resten i ordningen i
   [`blocks-backlog.md`](./blocks-backlog.md).
2. **Väntar på designen eller på dig:**
   - woff2-filerna för Clash Grotesk Variable (`TODO(clash-grotesk)`)
   - värdena i Figmas `motion`-samling (`TODO(motion)`)
   - en genomgång av posterna med status Antagande i `figma-deviations.md`
   - frågorna om Configurator i backloggen. Den nyare versionen har ingen price-box.
