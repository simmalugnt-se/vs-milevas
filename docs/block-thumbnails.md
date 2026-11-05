# Blockbilder i Payload

Blockväljaren i Payload visar en förhandsbild (600 × 400 WebP) för varje block. Bilderna är
skärmdumpar av blockets riktiga komponent vid 1440 px bredd. De ligger i
`public/block-thumbnails/<slug>.webp` och kopplas in med `withBlockThumbnails` i
`src/payload/blocks/definitions.ts`.

Routen `/preview-block/<slug>` renderar ett enda block utan navigation och sidfot. Blocket hämtas
från den första publicerade sidan med blocket, sorterad på slug, eller från sidan som anges i
`src/block-preview/catalog.ts`. Block som ingen sida använder får exempelinnehåll från
`src/block-preview/samples.ts`. Routen finns bara i utvecklingsläge eller med
`BLOCK_PREVIEW_ENABLED=true`, och den är `noindex`.

## Generera och kontrollera

Starta `pnpm dev` och kör sedan:

```bash
pnpm generate:block-thumbnails
```

Lägg till en slug för att bara ta ett block, till exempel `pnpm generate:block-thumbnails articleText`.
Sätt `BLOCK_PREVIEW_BASE_URL` om servern inte kör på `http://localhost:3000`. Skriptet använder
Playwrights Chromium, eller Chrome om den inte är installerad. En hel körning skriver också alla
bilder på en gång till `tmp/block-thumbnails-contact-sheet.webp`, för granskning.

`pnpm check:block-thumbnails` kontrollerar att varje block har rätt URL och en bild på 600 × 400.

## Nytt block

Ett nytt block i `layoutBlocks` får automatiskt en URL. Lägg in blocket på en publicerad sida, eller
exempelinnehåll i `samples.ts`, och generera bilden. Bilderna är statiska: de följer inte med när
innehållet ändras, utan först när de genereras om.
