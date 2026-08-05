import type { CollectionConfig } from "payload";
import { canCreateFirstUser } from "../../access/canCreateFirstUser.ts";
import { isAuthenticated } from "../../access/isAuthenticated.ts";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    create: canCreateFirstUser,
    delete: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
  },
  admin: {
    group: "Admin",
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
