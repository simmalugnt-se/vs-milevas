"use server";

import type { ServerFunctionClient } from "payload";

export const serverFunction: ServerFunctionClient = async (args) => {
  const { handleServerFunctions } = await import("@payloadcms/next/layouts");
  const config = await import("@payload-config");
  const { importMap } = await import("./importMap.js");

  return handleServerFunctions({
    ...args,
    config: config.default,
    importMap,
  });
};
