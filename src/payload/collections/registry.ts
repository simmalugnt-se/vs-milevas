import type { CollectionConfig } from "payload";
import { ConfiguratorRequests } from "./ConfiguratorRequests/config.ts";
import { Documents } from "./Documents/config.ts";
import { Media } from "./Media/config.ts";
import { Pages } from "./Pages/config.ts";
import { TruckFamilies } from "./TruckFamilies/config.ts";
import { Users } from "./Users/config.ts";

// sl-cli:imports (do not remove)

export const payloadCollections: CollectionConfig[] = [
  Users,
  Media,
  Documents,
  Pages,
  TruckFamilies,
  ConfiguratorRequests,
  // sl-cli:array (do not remove)
];
