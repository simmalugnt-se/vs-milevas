import type { CollectionConfig } from "payload";
import { ConfiguratorRequests } from "./ConfiguratorRequests/config.ts";
import { ContactRequests } from "./ContactRequests/config.ts";
import { Dealers } from "./Dealers/config.ts";
import { Documents } from "./Documents/config.ts";
import { Images } from "./Images/config.ts";
import { Pages } from "./Pages/config.ts";
import { TruckFamilies } from "./TruckFamilies/config.ts";
import { TruckModels } from "./TruckModels/config.ts";
import { Users } from "./Users/config.ts";

// sl-cli:imports (do not remove)

export const payloadCollections: CollectionConfig[] = [
  Pages,
  Images,
  Documents,
  ConfiguratorRequests,
  ContactRequests,
  Dealers,
  TruckFamilies,
  TruckModels,
  Users,
  // sl-cli:array (do not remove)
];
