import type { Access } from "payload";
import { isEditorUser } from "./isAuthenticated.ts";

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (isEditorUser(user)) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};
