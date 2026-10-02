import type { CollectionConfig } from "payload";
import { ADMIN_GROUPS } from "@/payload/admin-groups.ts";
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
    group: ADMIN_GROUPS.settings,
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
