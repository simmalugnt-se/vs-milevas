import type { Payload, RequiredDataFromCollectionSlug } from "payload";
import { isUninitializedPayloadDatabaseError } from "@/utilities/payload-schema-error";

const seedContext = { disableRevalidate: true } as const;

type PageLayoutInput = NonNullable<RequiredDataFromCollectionSlug<"pages">["layout"]>;

function heroLayout(headline: string, summary: string) {
  return [
    {
      blockType: "hero" as const,
      headline,
      summary,
    },
  ] satisfies PageLayoutInput;
}

function paragraph(text: string) {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

function homeLayout(testPageId: string): PageLayoutInput {
  return [
    ...heroLayout("Welcome", "A simple starting point for your next website."),
    {
      blockType: "cards",
      heading: "Explore the possibilities",
      items: [
        {
          title: "Flexible pages",
          text: "Combine text, images, cards and questions to build a page that suits your content.",
          link: {
            type: "internal",
            label: "View an example page",
            reference: { relationTo: "pages", value: testPageId },
          },
        },
        {
          title: "Content that grows with you",
          text: "Start with a few useful sections and add more as your website grows.",
          link: {
            type: "external",
            label: "Explore Payload",
            url: "https://payloadcms.com",
            newTab: true,
          },
        },
        {
          title: "Ready for your next idea",
          text: "Replace this example content with your own services, stories or products.",
          link: {
            type: "external",
            label: "Read the documentation",
            url: "https://payloadcms.com/docs",
            newTab: true,
          },
        },
      ],
    },
    {
      blockType: "faq",
      heading: "Common questions",
      items: [
        {
          question: "Can I change the content?",
          answer: "Yes. Every heading, card and answer can be edited to fit your website.",
        },
        {
          question: "Can I add more sections?",
          answer: "Yes. Add or reorder sections to create the page you need.",
        },
        {
          question: "Where should I start?",
          answer:
            "Start by describing what you offer, then add the questions your visitors ask most often.",
        },
      ],
    },
    {
      blockType: "columns",
      columns: [
        {
          content: [
            {
              blockType: "richText",
              content: paragraph("Use columns to place text and images side by side."),
            },
          ],
        },
        {
          content: [
            {
              blockType: "richText",
              content: paragraph("Each column holds its own text and media sections."),
            },
          ],
        },
      ],
    },
    {
      blockType: "callToAction",
      title: "Ready to begin?",
      text: "Replace this section with the one thing you want visitors to do next.",
      button: {
        link: {
          type: "internal",
          label: "See the example page",
          reference: { relationTo: "pages", value: testPageId },
        },
      },
    },
  ];
}

export async function seedDefaultSiteIfEmpty(payload: Payload): Promise<void> {
  let totalDocs: number;

  try {
    const result = await payload.count({
      collection: "pages",
      where: {},
    });
    totalDocs = result.totalDocs;
  } catch (error) {
    if (isUninitializedPayloadDatabaseError(error)) {
      payload.logger.info(
        "Seed skipped: Payload schema does not exist yet (run pnpm setup:local first).",
      );
      return;
    }
    payload.logger.error({ err: error, msg: "seedDefaultSiteIfEmpty: pages count failed." });
    return;
  }

  if (totalDocs > 0) {
    return;
  }

  try {
    const testPage = await payload.create({
      collection: "pages",
      data: {
        title: "Test",
        slug: "test",
        _status: "published",
        layout: heroLayout("Test page", "Use this page to verify routing, blocks, and navigation."),
      },
      draft: false,
      context: seedContext,
    });

    const homePage = await payload.create({
      collection: "pages",
      data: {
        title: "Home",
        slug: "home",
        _status: "published",
        layout: homeLayout(testPage.id),
      },
      draft: false,
      context: seedContext,
    });

    await payload.updateGlobal({
      slug: "header",
      data: {
        navItems: [
          {
            link: {
              type: "internal",
              label: "Test",
              reference: {
                relationTo: "pages",
                value: testPage.id,
              },
            },
          },
        ],
      },
      draft: false,
      context: seedContext,
    });

    payload.logger.info(`Seeded default site: home (${homePage.id}), test (${testPage.id}).`);
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: "seedDefaultSiteIfEmpty failed (empty or partial DB is OK on first migrate).",
    });
  }
}
