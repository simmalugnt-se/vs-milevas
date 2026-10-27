import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { sv } from "@payloadcms/translations/languages/sv";
import path from "path";
import { buildConfig, type PayloadRequest } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { routing } from "./i18n/routing.ts";
import { isEditorUser } from "./payload/access/isAuthenticated.ts";
import { payloadCollections } from "./payload/collections/registry.ts";
import { Users } from "./payload/collections/Users/config.ts";
import { payloadGlobals } from "./payload/globals/registry.ts";
import { cmsPlugins } from "./payload/plugins/index.ts";
import { seedDefaultSiteIfEmpty } from "./payload/seed/defaultSite.ts";
import { getPayloadEmailAdapter } from "./payload/utilities/email.ts";
import { buildPublicMediaURL } from "./payload/utilities/public-file-url.ts";
import { databaseUrls, describeServices, objectStorage } from "./utilities/services.mjs";
import { trustedOrigins } from "./utilities/trusted-origins.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const cliCommandsWithoutAdminImportMap = new Set([
  "generate:types",
  "migrate",
  "migrate:create",
  "migrate:status",
]);
const shouldSkipAdminImportMap = process.argv.some((arg) =>
  cliCommandsWithoutAdminImportMap.has(arg),
);

const useDirectDB = process.env.PAYLOAD_USE_DIRECT_DB === "true";
// SERVICES=local or cloud in .env.local picks the database and file storage; see services.mjs.
const database = databaseUrls();
const connectionString = useDirectDB ? database.direct : database.runtime;

if (!connectionString) {
  throw new Error(
    "No database is configured. Run pnpm setup, or set SERVICES=local (Docker) or SERVICES=cloud with DATABASE_URL in .env.local.",
  );
}
const storage = objectStorage();

const localHosts = new Set(["localhost", "127.0.0.1", "postgres", "db", "host.docker.internal"]);
const isLocalDatabase = (() => {
  try {
    return localHosts.has(new URL(connectionString).hostname);
  } catch {
    return false;
  }
})();

const push = process.env.PAYLOAD_LOCAL_PUSH === "true";

if (push && !isLocalDatabase) {
  throw new Error(
    "PAYLOAD_LOCAL_PUSH=true is only allowed for local database hosts (localhost, 127.0.0.1, postgres, db, host.docker.internal).",
  );
}

if (!process.env.PAYLOAD_SECRET) {
  throw new Error("PAYLOAD_SECRET is required. Set it in your .env.local file.");
}

const payloadSecret = process.env.PAYLOAD_SECRET;

/** The content locales as the admin's locale switcher names them. */
const localeLabels: Record<string, string> = {
  en: "Engelska",
  sv: "Svenska",
};

export default buildConfig({
  // The admin is in Swedish only; the site's content has both locales.
  i18n: {
    fallbackLanguage: "sv",
    supportedLanguages: { sv },
    // Payload's own group for globals, which it lists first; ADMIN_GROUPS.globals joins it.
    translations: { sv: { general: { globals: "Allmänt" } } },
  },
  localization: {
    locales: routing.locales.map((code) => ({ code, label: localeLabels[code] ?? code })),
    defaultLocale: routing.defaultLocale,
    fallback: true,
  },
  admin: {
    components: {
      afterDashboard: ["/payload/components/CacheTools#CacheTools"],
    },
    ...(shouldSkipAdminImportMap
      ? {}
      : {
          importMap: {
            baseDir: path.resolve(dirname, "."),
            importMapFile: path.resolve(dirname, "app/(payload)/importMap.js"),
          },
        }),
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: "Mobil",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Surfplatta",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  collections: payloadCollections,
  // Without it, any site may send requests with an editor's login cookie, and password reset
  // emails get no address. Not `serverURL`: Admin would call that one address from every deployment.
  csrf: trustedOrigins(),
  globals: payloadGlobals,
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (isEditorUser(req.user)) {
          return true;
        }

        const secret = process.env.CRON_SECRET;

        if (!secret) {
          return false;
        }

        return req.headers.get("authorization") === `Bearer ${secret}`;
      },
    },
    tasks: [],
  },
  db: postgresAdapter({
    blocksAsJSON: true,
    idType: "uuid",
    migrationDir: path.resolve(dirname, "payload/migrations"),
    pool: {
      connectionString,
      ssl: database.ssl ? { rejectUnauthorized: false } : undefined,
    },
    push,
  }),
  editor: lexicalEditor(),
  email: getPayloadEmailAdapter(),
  plugins: [
    ...cmsPlugins,
    s3Storage({
      // Keep prefix/object-key columns even with local uploads, so storage choices share a schema.
      alwaysInsertFields: true,
      bucket: storage?.bucket ?? "payload-media",
      // Uploads go straight from the browser to the bucket, past Vercel's ~4.5 MB request limit. The
      // bucket needs a CORS rule for the site's addresses; Neon and R2 both take one.
      clientUploads: true,
      collections: {
        images: {
          prefix: "media",
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => buildPublicMediaURL({ filename, prefix }),
        },
        documents: {
          prefix: "documents",
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => buildPublicMediaURL({ filename, prefix }),
        },
      },
      config: {
        credentials: {
          accessKeyId: storage?.accessKeyId ?? "placeholder",
          secretAccessKey: storage?.secretAccessKey ?? "placeholder",
        },
        endpoint: storage?.endpoint ?? "https://example.invalid",
        forcePathStyle: true,
        // Neon rejects the checksum newer AWS SDKs add to uploads by default.
        ...(storage?.kind === "neon"
          ? { requestChecksumCalculation: "WHEN_REQUIRED" as const }
          : {}),
        region: storage?.region ?? "auto",
      },
      // Off: uploads stay in the project folder. The plugin is still added so the schema is stable.
      enabled: Boolean(storage),
    }),
  ],
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  onInit: async (payload) => {
    payload.logger.info(`Using ${describeServices()}`);
    await seedDefaultSiteIfEmpty(payload);
  },
});
