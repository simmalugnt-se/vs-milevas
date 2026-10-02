// Registers ignore-style-imports-loader.mjs for Payload CLI commands (`--import` form of the
// deprecated `--loader` flag), so config files that import CSS can load outside Next.
import { register } from "node:module";

register("./ignore-style-imports-loader.mjs", import.meta.url);
