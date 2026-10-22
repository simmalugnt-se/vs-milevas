import { config as loadEnv } from "dotenv";
import { databaseUrls } from "../src/utilities/services.mjs";

loadEnv({ path: ".env.local" });
loadEnv();
const url = databaseUrls().runtime;
if (
  process.env.SERVICES !== "local" ||
  !url ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
) {
  throw new Error("Globalerna får bara fyllas i med SERVICES=local på den lokala databasen.");
}
process.argv.push("migrate");
/** The Header and Footer globals as Figma's navigation and footer, without touching the start page. */
async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../src/payload.config");
  const { seedMilevasFooter, seedMilevasHeader } = await import(
    "../src/payload/seed/milevasHomepage"
  );
  const payload = await getPayload({ config, disableOnInit: true });
  try {
    const publish = process.argv.includes("--publish-local");
    await seedMilevasHeader(payload, publish);
    await seedMilevasFooter(payload, publish);
    console.log(
      `Header och footer ifyllda: ${publish ? "publicerad lokalt" : "som utkast"} /admin/globals`,
    );
  } finally {
    await payload.destroy();
  }
}
main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
