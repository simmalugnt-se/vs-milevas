import type { CollectionConfig } from "payload";
import { Documents } from "./Documents/config.ts";
import { Media } from "./Media/config.ts";
import { Pages } from "./Pages/config.ts";
import { Users } from "./Users/config.ts";

// sl-cli:imports (do not remove)

export const payloadCollections: CollectionConfig[] = [
  Users,
  Media,
  Documents,
  Pages,
  // sl-cli:array (do not remove)
];
