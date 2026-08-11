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
  ] as unknown as PageLayoutInput;
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
    const homePage = await payload.create({
      collection: "pages",
      data: {
        title: "Home",
        slug: "home",
        _status: "published",
        layout: heroLayout("Welcome", "Milevas is ready. Open the admin to add users and content."),
      },
      draft: false,
      context: seedContext,
    });

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
