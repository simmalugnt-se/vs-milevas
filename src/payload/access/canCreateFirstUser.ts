import type { Access } from "payload";

export const canCreateFirstUser: Access = async ({ req }) => {
  if (req.user) {
    return true;
  }

  const existingUsers = await req.payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
  });

  return existingUsers.docs.length === 0;
};
