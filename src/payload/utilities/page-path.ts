/**
 * A page's address after the language, as stored in `path`: its parent's address and its own slug,
 * "motviktstruckar/trehjuliga". Without a parent it is the slug; the start page's is "home".
 */
export const joinPagePath = (parentPath: string | null | undefined, slug: string) =>
  parentPath ? `${parentPath}/${slug}` : slug;

/** The stored address, or the slug of a page saved before `path` existed or read without it. */
export const pageAddress = (
  page: { path?: string | null; slug?: string | null } | null | undefined,
) => page?.path?.trim() || page?.slug?.trim() || "";
