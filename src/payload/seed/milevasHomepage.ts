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

/** Explicit local seed, never run by onInit. Existing Milevas content survives repeated runs. */
export async function seedMilevasHomepage(payload: Payload, publish = false) {
  const context = { disableRevalidate: true };
  const existing = await payload.find({
    collection: "pages",
    locale: "sv",
    draft: true,
    where: { slug: { equals: "home" } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]?.layout?.some((block) => block.blockType === "milevasHero")) {
    return { page: existing.docs[0], seeded: false };
  }
  const families = await payload.find({
    collection: "truck-families",
    locale: "sv",
    pagination: false,
    depth: 0,
    overrideAccess: false,
  });
  const familyIDs = new Map(families.docs.map((family) => [family.key, family.id]));

  async function image(name: string, alt: string) {
    const filename = `milevas-home-${name}.png`;
    const found = await payload.find({
      collection: "images",
      locale: "sv",
      limit: 1,
      where: { filename: { equals: filename } },
    });
    if (found.docs[0]) return found.docs[0].id;
    const { readFile } = await import("node:fs/promises");
    const data = await readFile(path.resolve("scripts/figma-homepage-assets", `${name}.png`));
    const uploaded = await payload.create({
      collection: "images",
      locale: "sv",
      data: { alt },
      file: { data, name: filename, size: data.length, mimetype: "image/png" },
      context,
    });
    return uploaded.id;
  }

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
    {
      blockType: "milevasHero",
      heading: "Bygg din truck med Milevas",
      activeColumn: 3,
      columns: [
        "reach-truck",
        "pedestrian-stacker",
        "electric-counterbalance",
        "low-lift-pallet-truck",
        "electric-pallet-truck",
      ].map((key) => ({
        heading: "Bygg din truck:",
        family: familyIDs.get(key),
        ...(!familyIDs.has(key) ? { link: externalLink("Bygg din truck", "/configurator") } : {}),
      })),
    },
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
      cta: externalLink("Läs mer", "/#kontakt"),
    },
  ];
  const data = {
    title: "Milevas",
    slug: "home",
    layout,
    _status: publish ? ("published" as const) : ("draft" as const),
  };
  await payload.updateGlobal({
    slug: "header",
    locale: "sv",
    draft: !publish,
    context,
    data: {
      navItems: [
        { link: externalLink("Modeller", "/#modeller") },
        { link: externalLink("Hur det fungerar", "/#hur-det-fungerar") },
        { link: externalLink("Finansiering", "/#finansiering") },
        { link: externalLink("Om Baoli", "/#kontakt") },
      ],
      cta: externalLink("Bygg din truck", "/configurator"),
      _status: publish ? "published" : "draft",
    },
  });
  await payload.updateGlobal({
    slug: "footer",
    locale: "sv",
    draft: !publish,
    context,
    data: {
      navItems: [
        { link: externalLink("Modeller", "/#modeller") },
        { link: externalLink("Finansiering", "/#finansiering") },
        { link: externalLink("Kontakt", "/#kontakt") },
      ],
      _status: publish ? "published" : "draft",
    },
  });
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
