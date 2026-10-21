/**
 * The kitchensink's pages and their sections, in order. The tabs, each page's section index and
 * the links on the questions page read this list; `figma-notes.ts` targets its section ids.
 */
export const kitchensinkPages = [
  {
    href: "/kitchensink",
    title: "Grunder",
    intro:
      "Tokens från Figma och de minsta byggstenarna: färger, text, brytpunkter, grid, spacing, motion, ikoner, knappar, val och formfält.",
    groups: [
      {
        title: "Tokens",
        figma: "01 — Foundations",
        sections: [
          { id: "colors", title: "Färger" },
          { id: "typography", title: "Textstilar" },
          { id: "breakpoints", title: "Brytpunkter" },
          { id: "grids", title: "Grid" },
          { id: "spacing", title: "Spacing och stroke" },
          { id: "motion", title: "Motion" },
        ],
      },
      {
        title: "Byggstenar",
        figma: "02 — Components",
        sections: [
          { id: "logos", title: "Logotyp" },
          { id: "icons", title: "Ikoner" },
          { id: "arrows", title: "Pilar" },
          { id: "buttons", title: "Knappar" },
          { id: "links", title: "Länkar" },
          { id: "choice", title: "Choice" },
          { id: "text-field", title: "Formfält" },
          { id: "alternative", title: "Alternativ och tid" },
        ],
      },
    ],
  },
  {
    href: "/kitchensink/components",
    title: "Komponenter",
    intro: "Sammansatta komponenter från Figma, med platshållarinnehåll.",
    groups: [
      {
        title: "Komponenter",
        figma: "02 — Components",
        sections: [
          { id: "product-card", title: "Product card" },
          { id: "card", title: "Card" },
          { id: "color-image-card", title: "Color image card" },
          { id: "configurator-box", title: "Configurator box" },
          { id: "price-box", title: "Price box" },
          { id: "text-box", title: "Text box" },
          { id: "truck-column", title: "Truck column" },
          { id: "contact-form", title: "Kontaktformulär" },
        ],
      },
    ],
  },
  {
    href: "/kitchensink/blocks",
    title: "Block",
    intro:
      "Hela block som de ligger i sidlayouten, med platshållarinnehåll. Hero, Product-Grid, Text+Grid och Text & boxinfo finns också som redigerbara Payload-block.",
    groups: [
      {
        title: "Block",
        figma: "04 — Blocks",
        sections: [
          { id: "navigation", title: "Navigation" },
          { id: "hero", title: "Milevas Hero" },
          { id: "product-grid", title: "Product-Grid" },
          { id: "text-grid", title: "Text+Grid" },
          { id: "text-boxinfo", title: "Text & boxinfo" },
          { id: "configurator", title: "Configurator" },
          { id: "footer", title: "Footer" },
        ],
      },
    ],
  },
  {
    href: "/kitchensink/notes",
    title: "Frågor",
    intro:
      "Frågor till designern och var koden avviker från Figma, samlade. Samma poster står också vid sin komponent eller sitt block.",
    groups: [],
  },
] as const;

export type KitchensinkPage = (typeof kitchensinkPages)[number];
export type SectionId = KitchensinkPage["groups"][number]["sections"][number]["id"];

const allSections = kitchensinkPages.flatMap((page) =>
  page.groups.flatMap((group) =>
    group.sections.map((section) => ({ ...section, href: `${page.href}#${section.id}` })),
  ),
);

export const sectionTitle = (id: SectionId) =>
  allSections.find((section) => section.id === id)?.title ?? id;

export const sectionHref = (id: SectionId) =>
  allSections.find((section) => section.id === id)?.href ?? "/kitchensink";
