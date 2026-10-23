import path from "node:path";
import type { Payload } from "payload";
import type { Page } from "@/payload-types";

const productDefinitions = [
  ["electric-counterbalance", "Elektriska motviktstruckar", "1.5 – 3.5 ton", "counterbalance"],
  ["reach-truck", "Skjutstativtruckar", "1.4 – 2.0 ton", "reach-truck"],
  ["low-lift-pallet-truck", "Låglyftare", "1.5 – 2.5 ton", "low-lift"],
  ["pedestrian-stacker", "Ledstaplare", "1.2 – 2.0 ton", "stacker"],
  ["electric-pallet-truck", "Elektriska pallyftare", "1.4 – 2.0 ton", "pallet-truck"],
  [null, "Plocktruckar", "1.4 – 2.0 ton", "order-picker"],
] as const;

const externalLink = (label: string, url: string) => ({ type: "external" as const, label, url });

/** A Figma image from `scripts/figma-homepage-assets`, uploaded once. */
async function uploadImage(payload: Payload, name: string, alt: string, extension = "png") {
  const filename = `milevas-home-${name}.${extension}`;
  const found = await payload.find({
    collection: "images",
    locale: "sv",
    limit: 1,
    where: { filename: { equals: filename } },
  });
  if (found.docs[0]) return found.docs[0].id;
  const { readFile } = await import("node:fs/promises");
  const data = await readFile(
    path.resolve("scripts/figma-homepage-assets", `${name}.${extension}`),
  );
  const uploaded = await payload.create({
    collection: "images",
    locale: "sv",
    data: { alt },
    file: {
      data,
      name: filename,
      size: data.length,
      mimetype: extension === "jpg" ? "image/jpeg" : "image/png",
    },
    context: { disableRevalidate: true },
  });
  return uploaded.id;
}

/**
 * The Header global as Figma's navigation: the menus Modeller (the trucks, each with its image),
 * Tjänster and Om oss, and the login link. The links point at the start page's sections until the
 * pages exist; the login link at `/login`, where Figma's Login block will go.
 */
export async function seedMilevasHeader(payload: Payload, publish = false) {
  const links = (rows: (readonly [string, string])[]) =>
    rows.map(([label, url]) => ({ link: externalLink(label, url) }));
  const trucks = [];
  for (const [, name, , asset] of productDefinitions) {
    trucks.push({
      link: externalLink(name, "/#modeller"),
      image: await uploadImage(payload, asset, name),
    });
  }
  await payload.updateGlobal({
    slug: "header",
    locale: "sv",
    draft: !publish,
    context: { disableRevalidate: true },
    data: {
      navItems: [
        {
          link: { label: "Modeller" },
          links: trucks,
          image: await uploadImage(payload, "stacker", "Ledstaplare"),
        },
        {
          link: { label: "Tjänster" },
          links: links([
            ["Hur det fungerar", "/#hur-det-fungerar"],
            ["Finansiering", "/#finansiering"],
            ["Bli återförsäljare", "/#kontakt"],
          ]),
        },
        {
          link: { label: "Om oss" },
          links: links([
            ["Om Baoli", "/#kontakt"],
            ["Service & eftermarknad", "/#kontakt"],
            ["Kontakt", "/#kontakt"],
          ]),
        },
      ],
      login: { link: externalLink("Dealer login", "/login"), shortLabel: "Login" },
      _status: publish ? "published" : "draft",
    },
  });
}

/** The Footer global as Figma's footer: Produkter, Tjänster and Kontakt, and the copyright line. */
export async function seedMilevasFooter(payload: Payload, publish = false) {
  const links = (rows: (readonly [string, string])[]) =>
    rows.map(([label, url]) => ({ link: externalLink(label, url) }));
  await payload.updateGlobal({
    slug: "footer",
    locale: "sv",
    draft: !publish,
    context: { disableRevalidate: true },
    data: {
      linkGroups: [
        {
          heading: "Produkter",
          links: links(productDefinitions.map(([, name]) => [name, "/#modeller"] as const)),
        },
        {
          heading: "Tjänster",
          links: links([
            ["Konfigurator", "/configurator"],
            ["Finansiering", "/#finansiering"],
            ["Bli återförsäljare", "/#kontakt"],
          ]),
        },
      ],
      contactHeading: "Kontakt",
      email: "info@milevas.se",
      phone: "08-123 45 67",
      location: "Stockholm, Sverige",
      copyright: "Milevas AB. Alla rättigheter förbehållna.",
      _status: publish ? "published" : "draft",
    },
  });
}

/**
 * The hero as Figma's Hero and its Figma Make prototype: the intro text and six truck types, two
 * more than the text block after it, so their lines can move from six columns to four.
 */
async function milevasHeroBlock(payload: Payload, familyIDs: Map<string, string>) {
  const columns = [
    ["electric-counterbalance", "counterbalance", "Elektriska motviktstruckar"],
    ["reach-truck", "reach-truck", "Skjutstativtruckar"],
    ["low-lift-pallet-truck", "low-lift", "Låglyftare"],
    ["pedestrian-stacker", "stacker", "Ledstaplare"],
    ["electric-pallet-truck", "pallet-truck", "Elektriska pallyftare"],
    [null, "order-picker", "Plocktruckar"],
  ] as const;
  const items = [];
  for (const [key, asset, name] of columns) {
    const family = key ? familyIDs.get(key) : undefined;
    items.push({
      heading: "Bygg din truck:",
      family,
      image: await uploadImage(payload, `hero-${asset}`, name),
      ...(!family ? { link: externalLink(name, key ? "/configurator" : "/#kontakt") } : {}),
    });
  }
  return {
    blockType: "milevasHero" as const,
    heading: "Bygg din baoli",
    highlight: "På typ 30 sekunder",
    prompt: "Välj trucktyp för att börja",
    activeColumn: 5,
    columns: items,
  };
}

/** Text block Collumns as Figma: the KION Group text and the four logos. */
async function milevasTextColumnsBlock(payload: Payload) {
  const logos = [
    ["kion", "KION", 116],
    ["still", "STILL", 131],
    ["linde", "Linde", 147],
    ["baoli", "Baoli", 108],
  ] as const;
  const items = [];
  for (const [asset, name, width] of logos) {
    items.push({ image: await uploadImage(payload, `logo-${asset}`, name), name, width });
  }
  return {
    blockType: "textColumns" as const,
    heading: "Ett varumärke inom",
    highlight: "KION Group",
    text: "Baoli är en del av KION Group – samma koncern som står bakom Linde och STILL. Det gör Baoli till det praktiska instegsvalet inom en global industrikoncern med över 100 års erfarenhet av materialhantering.",
    logos: items,
  };
}

/** Image & Text as Figma: the service photo, its heading and text, and "Bygg din truck". */
async function milevasImageTextBlock(payload: Payload) {
  return {
    blockType: "imageText" as const,
    image: await uploadImage(
      payload,
      "image-text-service",
      "Mekaniker som servar en truck i en verkstad",
      "jpg",
    ),
    heading: "Service du kan räkna med",
    text: "Baoli EMEA har ett av branschens största reservdelslager i Europa. Tillsammans med ett centralt produktlager i Italien med över 1 000 truckar redo för leverans ger det korta ledtider.",
    showButton: true,
    cta: externalLink("Bygg din truck", "/configurator"),
  };
}

/** What to change on a start page that already has Milevas content. */
type SeedUpdate = {
  /** Replace the hero and the text block after it. */
  hero?: boolean;
  /** Add Image & Text after the text block, or after the hero, if the page has none. */
  imageText?: boolean;
};

/**
 * Explicit local seed, never run by onInit. Existing Milevas content survives repeated runs unless
 * `update` names the blocks to replace or add.
 */
export async function seedMilevasHomepage(
  payload: Payload,
  publish = false,
  update: SeedUpdate = {},
) {
  const context = { disableRevalidate: true };
  const existing = await payload.find({
    collection: "pages",
    locale: "sv",
    draft: true,
    where: { slug: { equals: "home" } },
    limit: 1,
    overrideAccess: true,
  });
  const families = await payload.find({
    collection: "truck-families",
    locale: "sv",
    pagination: false,
    depth: 0,
    overrideAccess: false,
  });
  const familyIDs = new Map(families.docs.map((family) => [family.key, family.id]));
  const seededPage = existing.docs[0];
  if (seededPage?.layout?.some((block) => block.blockType === "milevasHero")) {
    if (!update.hero && !update.imageText) return { page: seededPage, seeded: false };
    let layout: NonNullable<Page["layout"]> = seededPage.layout;
    if (update.hero) {
      const hero = await milevasHeroBlock(payload, familyIDs);
      const textColumns = await milevasTextColumnsBlock(payload);
      layout = layout.flatMap((block, index, all): NonNullable<Page["layout"]> => {
        if (block.blockType === "textColumns") return [{ ...textColumns, id: block.id }];
        if (block.blockType !== "milevasHero") return [block];
        const replaced = { ...hero, id: block.id };
        return all[index + 1]?.blockType === "textColumns" ? [replaced] : [replaced, textColumns];
      });
    }
    if (update.imageText && !layout.some((block) => block.blockType === "imageText")) {
      const after = layout.findIndex((block) => block.blockType === "textColumns");
      const at = (after >= 0 ? after : layout.findIndex((b) => b.blockType === "milevasHero")) + 1;
      layout = [...layout.slice(0, at), await milevasImageTextBlock(payload), ...layout.slice(at)];
    }
    const page = await payload.update({
      collection: "pages",
      id: seededPage.id,
      locale: "sv",
      draft: !publish,
      data: {
        layout,
        _status: publish ? "published" : "draft",
      },
      context,
    });
    return { page, seeded: true };
  }

  const image = (name: string, alt: string) => uploadImage(payload, name, alt);

  const products = [];
  for (const [key, name, capacity, asset] of productDefinitions) {
    const family = key ? familyIDs.get(key) : undefined;
    const cropByAsset: Record<
      string,
      { width: number; height: number; left: number; top: number }
    > = {
      counterbalance: { width: 107.77, height: 144.38, left: -7.77, top: -26.3 },
      "low-lift": { width: 134, height: 100, left: -34, top: 0 },
      "pallet-truck": { width: 93.21, height: 126.73, left: 3.21, top: -11.01 },
      "order-picker": { width: 72.97, height: 97.75, left: 13.5, top: 2.25 },
    };
    products.push({
      imageFit: cropByAsset[asset]
        ? ("crop" as const)
        : asset === "reach-truck"
          ? ("cover" as const)
          : ("contain" as const),
      imageCrop: cropByAsset[asset],
      family,
      name,
      capacity,
      battery: "80 V 228 Ah",
      image: await image(asset, name),
      ...(!family ? { link: externalLink(name, key ? "/configurator" : "/#kontakt") } : {}),
    });
  }
  const photos = [
    await image("warehouse", "Truckar i en lagerlokal"),
    await image("loading", "En truck lastar i en lagerbyggnad"),
    await image("night", "En truck arbetar vid containrar på kvällen"),
  ];
  const layout: NonNullable<Page["layout"]> = [
    await milevasHeroBlock(payload, familyIDs),
    await milevasTextColumnsBlock(payload),
    await milevasImageTextBlock(payload),
    {
      blockType: "productGrid",
      anchor: "modeller",
      label: "Modeller",
      brand: "Baoli",
      category: "Modeller",
      products,
    },
    {
      blockType: "textGrid",
      anchor: "hur-det-fungerar",
      heading: "Så enkelt\nfungerar det",
      cards: [
        { number: "01", label: "Bygg din truck", text: "", image: photos[0] },
        { number: "02", label: "Få offert", text: "text", image: photos[1] },
        { number: "03", label: "Leverans", text: "text", image: photos[2] },
      ],
    },
    {
      blockType: "textBoxinfo",
      anchor: "finansiering",
      heading: "Truck från\n390kr/mån",
      highlight: "Easy peasy\nlemon squeezy.",
      text: "Vi erbjuder enkel finansiering så du kan fokusera på verksamheten.",
      items: [
        {
          heading: "Leasing",
          label: "Fast kostnad",
          text: "Förmånliga leasingavtal med fasta månadskostnader.",
        },
        { heading: "Insats", label: "0 kr", text: "Kom igång utan stora initiala investeringar." },
        { heading: "Besked", label: "-24h", text: "Enkel ansökningsprocess med svar inom 24h." },
      ],
      showButton: true,
      cta: externalLink("Bygg din truck", "/configurator"),
    },
  ];
  const data = {
    title: "Milevas",
    slug: "home",
    layout,
    _status: publish ? ("published" as const) : ("draft" as const),
  };
  await seedMilevasHeader(payload, publish);
  await seedMilevasFooter(payload, publish);
  const page = existing.docs[0]
    ? await payload.update({
        collection: "pages",
        id: existing.docs[0].id,
        locale: "sv",
        draft: !publish,
        data,
        context,
      })
    : await payload.create({ collection: "pages", locale: "sv", draft: !publish, data, context });
  return { page, seeded: true };
}
