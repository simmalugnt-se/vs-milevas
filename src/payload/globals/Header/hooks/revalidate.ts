import { createRevalidateGlobalHook } from "@/payload/hooks/revalidateGlobal";

export const revalidateHeader = createRevalidateGlobalHook("global:header");
