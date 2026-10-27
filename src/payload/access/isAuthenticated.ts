import type { Access } from "payload";

/**
 * Signed in to Admin: a user in `users`. Dealers sign in on the site with a session of their own
 * (`src/features/dealers/session.ts`) that Payload never reads, so they never reach here; the
 * collection check keeps it that way should one ever carry a Payload token.
 */
export const isEditorUser = (user: { collection?: string } | null | undefined): boolean =>
  user?.collection === "users";

export const isAuthenticated: Access = ({ req }) => isEditorUser(req.user);
