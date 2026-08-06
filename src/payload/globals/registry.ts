import type { GlobalConfig } from "payload";
import { ConfiguratorSettings } from "./ConfiguratorSettings/config.ts";
import { Footer } from "./Footer/config.ts";
import { Header } from "./Header/config.ts";

// sl-cli:imports (do not remove)

export const payloadGlobals: GlobalConfig[] = [
  Header,
  Footer,
  ConfiguratorSettings,
  // sl-cli:array (do not remove)
];
