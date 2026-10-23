import path from "node:path";
import type { Payload } from "payload";
import type { Page } from "@/payload-types";

/** The truck families (`pnpm seed:configurator`) the hero and the product grid show, in order. */
const familyKeys = [
  "electric-counterbalance",
  "reach-truck",
  "low-lift-pallet-truck",
  "pedestrian-stacker",
  "electric-pallet-truck",
  "order-picker",
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
  await payload.updateGlobal({
    slug: "header",
    locale: "sv",
    draft: !publish,
    context: { disableRevalidate: true },
    data: {
      navItems: [
        {
          link: { label: "Modeller" },
          source: "truckFamilies" as const,
          image: await uploadImage(payload, "stacker", "Ledstaplare"),
        },
        {
          link: { label: "Tjänster" },
          links: links([
            ["Hur det fungerar", "/#hur-det-fungerar"],
            ["Finansiering", "/#finansiering"],
            ["Bli återförsäljare", "/om-oss#kontakt"],
          ]),
        },
        {
          link: { label: "Om oss" },
          links: links([
            ["Om Baoli", "/om-oss"],
            ["Service & eftermarknad", "/om-oss#service"],
            ["Kontakt", "/om-oss#kontakt"],
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
          source: "truckFamilies" as const,
        },
        {
          heading: "Tjänster",
          links: links([
            ["Konfigurator", "/configurator"],
            ["Finansiering", "/#finansiering"],
            ["Bli återförsäljare", "/om-oss#kontakt"],
          ]),
        },
      ],
      contactHeading: "Kontakt",
      email: "info@milevas.se",
      phone: "08-123 45 67",
      location: "Stockholm, Sverige",
      // Figma names the networks but not the pages; these are placeholders.
      socialLinks: [
        { label: "Facebook", url: "https://www.facebook.com/" },
        { label: "Linkedin", url: "https://www.linkedin.com/" },
      ],
      copyright: "Milevas AB. Alla rättigheter förbehållna.",
      _status: publish ? "published" : "draft",
    },
  });
}

/**
 * The hero as Figma's Hero and its Figma Make prototype: the intro text and six truck families,
 * two more than the text block after it, so their lines can move from six columns to four. Each
 * column's name, image and prices come from its family.
 */
function milevasHeroBlock(familyIDs: Map<string, string>) {
  return {
    blockType: "milevasHero" as const,
    heading: "Bygg din baoli",
    highlight: "På typ 30 sekunder",
    prompt: "Välj trucktyp för att börja",
    activeColumn: 5,
    columns: familyKeys.flatMap((key) => {
      const family = familyIDs.get(key);
      return family ? [{ heading: "Bygg din truck:", family }] : [];
    }),
  };
}

/** Product-Grid: a card per family, its name, image, specs and prices from the family. */
function milevasProductGridBlock(familyIDs: Map<string, string>) {
  return {
    blockType: "productGrid" as const,
    anchor: "modeller",
    label: "Modeller",
    brand: "Baoli",
    category: "Modeller",
    products: familyKeys.flatMap((key) => {
      const family = familyIDs.get(key);
      return family ? [{ family, imageFit: "contain" as const }] : [];
    }),
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
    anchor: "service",
    heading: "Service du kan räkna med",
    text: "Baoli EMEA har ett av branschens största reservdelslager i Europa. Tillsammans med ett centralt produktlager i Italien med över 1 000 truckar redo för leverans ger det korta ledtider.",
    showButton: true,
    cta: externalLink("Bygg din truck", "/configurator"),
  };
}

/** Card Slider as Figma: six cards with Figma's headings and its two photos. */
async function milevasCardSliderBlock(payload: Payload) {
  const factory = await uploadImage(
    payload,
    "card-slider-factory",
    "Produktlagret i Italien",
    "jpg",
  );
  const parts = await uploadImage(payload, "card-slider-parts", "Reservdelslagret", "jpg");
  const cards = [
    ["white", "Över 1 000 truckar på lager", factory],
    ["tejp", "Reservdels lager i Tjeckien", parts],
    ["gray", "50+ länder, 350 återförsäljare", factory],
    ["white", "CE-märkt och välkonstruerat", parts],
    ["tejp", "Brukstruckar utan krussiduller", factory],
    ["gray", "Snabb eftermarknad", parts],
  ] as const;
  return {
    blockType: "cardSlider" as const,
    label: "Lager, leverans och service",
    cards: cards.map(([color, heading, image]) => ({
      color,
      label: "Lager, leverans och service",
      heading,
      text: "Baoli EMEA driver ett centralt produktlager i Italien med över 1 000 truckar redo för leverans.",
      image,
    })),
  };
}

/** Text-block as Figma, with its paragraph: what KION Group means for Baoli. */
function milevasTextBlock() {
  return {
    blockType: "textBlock" as const,
    text: "Det betyder att du får en trucktillverkare med industriell tyngd, europeisk ingenjörskonst och över 100 års samlad erfarenhet av materialhantering i ryggen.",
    paragraph:
      "Baoli erbjuder smarta och prisvärda brukstruckar utan krussiduller. Pålitlig och lättanvänd utrustning, enkel att underhålla, till ett rimligt pris. Milevas är generalagent för Baoli i Sverige, Finland, Estland, Lettland och Litauen och står för försäljning, leverans och service med samma enkla principer: tydliga priser, rätt utrustning och truckar som gör jobbet.",
  };
}

/** Contact at the end of Om oss, where "Bli återförsäljare" and "Kontakt" (`/om-oss#kontakt`) lead. */
function milevasContactBlock() {
  return { blockType: "contact" as const, anchor: "kontakt", heading: "Kontakt" };
}

/**
 * Om oss as Figma's page template (05 — Pages): Text block Collumns, Text-block, Card Slider,
 * Image & Text and Contact. Created once; an existing Om oss is left as it is.
 */
export async function seedMilevasAboutPage(payload: Payload, publish = false) {
  const existing = await payload.find({
    collection: "pages",
    locale: "sv",
    draft: true,
    where: { slug: { equals: "om-oss" } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) return { page: existing.docs[0], seeded: false };
  const page = await payload.create({
    collection: "pages",
    locale: "sv",
    draft: !publish,
    context: { disableRevalidate: true },
    data: {
      title: "Om oss",
      slug: "om-oss",
      layout: [
        await milevasTextColumnsBlock(payload),
        milevasTextBlock(),
        await milevasCardSliderBlock(payload),
        await milevasImageTextBlock(payload),
        milevasContactBlock(),
      ],
      _status: publish ? "published" : "draft",
    },
  });
  return { page, seeded: true };
}

/** What to change on a start page that already has Milevas content. */
type SeedUpdate = {
  /** Replace the hero and the text block after it. */
  hero?: boolean;
  /** Replace the product grid. */
  products?: boolean;
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
    if (!update.hero && !update.products) {
      return { page: seededPage, seeded: false };
    }
    let layout: NonNullable<Page["layout"]> = seededPage.layout;
    if (update.hero) {
      const hero = milevasHeroBlock(familyIDs);
      const textColumns = await milevasTextColumnsBlock(payload);
      layout = layout.flatMap((block, index, all): NonNullable<Page["layout"]> => {
        if (block.blockType === "textColumns") return [{ ...textColumns, id: block.id }];
        if (block.blockType !== "milevasHero") return [block];
        const replaced = { ...hero, id: block.id };
        return all[index + 1]?.blockType === "textColumns" ? [replaced] : [replaced, textColumns];
      });
    }
    if (update.products) {
      const products = milevasProductGridBlock(familyIDs);
      layout = layout.map((block) =>
        block.blockType === "productGrid" ? { ...products, id: block.id } : block,
      );
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

  const photos = [
    await image("warehouse", "Truckar i en lagerlokal"),
    await image("loading", "En truck lastar i en lagerbyggnad"),
    await image("night", "En truck arbetar vid containrar på kvällen"),
  ];
  const layout: NonNullable<Page["layout"]> = [
    milevasHeroBlock(familyIDs),
    await milevasTextColumnsBlock(payload),
    milevasProductGridBlock(familyIDs),
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
  await seedMilevasAboutPage(payload, publish);
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
