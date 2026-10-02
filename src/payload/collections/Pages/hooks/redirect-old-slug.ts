import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from "payload";
import { routing } from "@/i18n/routing";
import {
  findRedirect,
  pagePathname,
  type RedirectDoc,
  referenceId,
} from "@/payload/data/redirects-core";
import type { Page } from "@/payload-types";

const contextKey = (id: string | number) => `publishedSlug:${id}`;

/**
 * The slug the page was published with before this publish, if it was published. Read in
 * `beforeChange`: Payload's `originalDoc` and `previousDoc` are the latest draft, which already has
 * the new slug once the editor has typed it.
 */
export function publishedSlugBefore(req: PayloadRequest, id: string | number) {
  const value = req.context[contextKey(id)];
  return typeof value === "string" ? value : undefined;
}

export const rememberPublishedSlug: CollectionBeforeChangeHook<Page> = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== "update" || data._status !== "published" || !originalDoc?.id) {
    return data;
  }

  const published = await req.payload.findByID({
    collection: collection.slug as "pages",
    id: originalDoc.id,
    depth: 0,
    draft: false,
    overrideAccess: true,
    req,
    select: { slug: true, _status: true },
  });

  if (published?._status === "published" && published.slug) {
    req.context[contextKey(originalDoc.id)] = published.slug;
  }

  return data;
};

/**
 * Publishing a page under a new slug adds a redirect from the old address to the page. It points
 * at the page, not at a path, so it follows later renames. Runs in the publish's transaction: if
 * the redirect cannot be written, the publish fails with it.
 */
export const redirectOldSlug: CollectionAfterChangeHook<Page> = async ({ doc, req }) => {
  const previousSlug = publishedSlugBefore(req, doc.id);
  if (doc._status !== "published" || !previousSlug || previousSlug === doc.slug) {
    return doc;
  }

  const from = pagePathname(previousSlug);
  const to = pagePathname(doc.slug);
  const { docs: redirects } = await req.payload.find({
    collection: "redirects",
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
  });

  // Back to an earlier slug: its redirect would point at itself once the page is unpublished.
  const loop = findRedirect(redirects as RedirectDoc[], to, routing.locales);
  if (
    loop?.id !== undefined &&
    loop.to?.reference?.relationTo === "pages" &&
    String(referenceId(loop.to.reference)) === String(doc.id)
  ) {
    await req.payload.delete({ collection: "redirects", id: loop.id, overrideAccess: true, req });
  }

  // Never from the start page, and never over a redirect someone already made.
  if (from === "/" || findRedirect(redirects as RedirectDoc[], from, routing.locales)) {
    return doc;
  }

  await req.payload.create({
    collection: "redirects",
    data: {
      from,
      to: { type: "reference", reference: { relationTo: "pages", value: doc.id } },
    },
    overrideAccess: true,
    req,
  });

  return doc;
};
