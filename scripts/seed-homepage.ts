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
  throw new Error("Startsides-testet får bara skapas med SERVICES=local på den lokala databasen.");
}
process.argv.push("migrate");
async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../src/payload.config");
  const { seedMilevasHomepage } = await import("../src/payload/seed/milevasHomepage");
  const payload = await getPayload({ config, disableOnInit: true });
  try {
    const publish = process.argv.includes("--publish-local");
    const { page, seeded } = await seedMilevasHomepage(payload, publish);
    console.log(
      `${seeded ? "Skapad" : "Finns redan"}: ${publish ? "lokal startsida" : "startsida som utkast"} /admin/collections/pages/${page.id}`,
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
