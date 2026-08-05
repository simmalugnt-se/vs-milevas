import config from "@payload-config";
import { getPayload } from "payload";
import { importMap } from "@/app/(payload)/importMap";

export const getPayloadClient = () =>
  getPayload({
    config,
    importMap,
  });
