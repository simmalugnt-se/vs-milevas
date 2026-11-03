import {
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
  ValidationError,
} from "payload";
import { joinPagePath, pageAddress } from "@/payload/utilities/page-path";
import type { Page } from "@/payload-types";

/** Deeper than this, a chain of parents is taken as a loop. */
const MAX_DEPTH = 20;

const idOf = (value: Page["parent"] | undefined) =>
  typeof value === "object" && value ? value.id : (value ?? undefined);

/** A page as last published, or as created if it never was: its address and its parent. */
function findPage(req: PayloadRequest, id: string) {
  return req.payload.findByID({
    collection: "pages",
    id,
    depth: 0,
    draft: false,
    disableErrors: true,
    overrideAccess: true,
    req,
    select: { parent: true, path: true, slug: true },
  });
}

/**
 * `path`: the parent's address and the page's slug. The parent's published address counts, so a
 * parent's unpublished rename leaves the children where they are. A page cannot be under itself or
 * one of its own children.
 */
export const setPagePath: CollectionBeforeChangeHook<Page> = async ({ data, originalDoc, req }) => {
  const slug = data.slug ?? originalDoc?.slug;
  if (!slug) return data;
  const parent = idOf(data.parent !== undefined ? data.parent : originalDoc?.parent);
  let parentPath: string | undefined;
  const seen = new Set(originalDoc?.id ? [originalDoc.id] : []);
  for (let current = parent, depth = 0; current; depth++) {
    if (seen.has(current) || depth > MAX_DEPTH) {
      throw new ValidationError({
        collection: "pages",
        errors: [
          {
            path: "parent",
            message: "En sida kan inte ligga under sig själv eller sina undersidor.",
          },
        ],
      });
    }
    seen.add(current);
    const doc = await findPage(req, current);
    if (!doc) break;
    parentPath ??= pageAddress(doc);
    current = idOf(doc.parent);
  }
  return { ...data, path: joinPagePath(parentPath, slug) };
};

/**
 * Saves the children again when their address no longer starts with the parent's, as the nested
 * docs plugin does: the published version first, then a newer draft, so the draft stays the latest.
 * Each save updates its own children in turn.
 */
async function updateChildren(
  req: PayloadRequest,
  ids: string[],
  parentPath: string | undefined,
  { orphaned = false } = {},
) {
  const save = (doc: Page) => (orphaned ? { ...doc, parent: null } : doc);
  for (const id of ids) {
    const [published, latest] = await Promise.all([
      req.payload.findByID({
        collection: "pages",
        id,
        depth: 0,
        draft: false,
        overrideAccess: true,
        req,
      }),
      req.payload.findByID({
        collection: "pages",
        id,
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      }),
    ]);
    const outdated = (doc: Page) =>
      doc.path !== joinPagePath(parentPath, doc.slug) || (orphaned && Boolean(doc.parent));
    const republish = published._status === "published" && outdated(published);
    if (republish) {
      await req.payload.update({
        collection: "pages",
        id,
        data: save(published),
        depth: 0,
        draft: false,
        overrideAccess: true,
        req,
      });
    }
    if (latest._status === "draft" && (republish || outdated(latest))) {
      await req.payload.update({
        collection: "pages",
        id,
        data: save(latest),
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      });
    }
  }
}

/** The pages with this parent, as published or in their latest draft. */
async function childIds(req: PayloadRequest, parent: string) {
  const find = (draft: boolean) =>
    req.payload.find({
      collection: "pages",
      depth: 0,
      draft,
      limit: 0,
      overrideAccess: true,
      pagination: false,
      req,
      select: { slug: true },
      where: { parent: { equals: parent } },
    });
  const [published, drafts] = await Promise.all([find(false), find(true)]);
  return [...new Set([...published.docs, ...drafts.docs].map((doc) => doc.id))];
}

/** Publishing a page under a new address moves its children's addresses with it. */
export const updateChildPaths: CollectionAfterChangeHook<Page> = async ({ doc, req }) => {
  if (doc._status !== "published") return doc;
  await updateChildren(req, await childIds(req, doc.id), pageAddress(doc));
  return doc;
};

/** Per delete: the children of the page being deleted, read before it goes. */
const deletedChildren = new WeakMap<PayloadRequest, Map<string, string[]>>();

/** The children of a page about to be deleted, which lose their parent with it. */
export const rememberChildren: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const children = deletedChildren.get(req) ?? new Map<string, string[]>();
  children.set(String(id), await childIds(req, String(id)));
  deletedChildren.set(req, children);
};

/** A deleted page's children move to the top level: their address is their slug. */
export const updateOrphanPaths: CollectionAfterDeleteHook<Page> = async ({ doc, req }) => {
  const ids = deletedChildren.get(req)?.get(doc.id);
  if (ids?.length) await updateChildren(req, ids, undefined, { orphaned: true });
  return doc;
};
