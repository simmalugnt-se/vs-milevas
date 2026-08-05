import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig, type PayloadRequest } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { routing } from "./i18n/routing.ts";
import { payloadCollections } from "./payload/collections/registry.ts";
import { Users } from "./payload/collections/Users/config.ts";
import { payloadGlobals } from "./payload/globals/registry.ts";
import { cmsPlugins } from "./payload/plugins/index.ts";
import { seedDefaultSiteIfEmpty } from "./payload/seed/defaultSite.ts";
import { buildPublicMediaURL, isR2Configured } from "./payload/utilities/r2.ts";
import { resolveEnv } from "./utilities/environment.ts";

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
const pooledConnectionString = resolveEnv("DATABASE_URI") || process.env.DATABASE_URL || "";
const directConnectionString = resolveEnv("DATABASE_URI_DIRECT") || pooledConnectionString;

if (useDirectDB && !directConnectionString) {
  throw new Error(
    "PAYLOAD_USE_DIRECT_DB=true requires DATABASE_URI_DIRECT. Set a direct Neon/Postgres URL for migrations and admin DB operations.",
  );
}

const connectionString = useDirectDB
  ? directConnectionString
  : pooledConnectionString || directConnectionString;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set DATABASE_URI (or DATABASE_URI_<APP_ENV>), DATABASE_URL, and DATABASE_URI_DIRECT as needed.",
  );
}

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

export default buildConfig({
  localization: {
    locales: [...routing.locales],
    defaultLocale: routing.defaultLocale,
    fallback: true,
  },
  admin: {
    components: {
      beforeDashboard: ["/payload/components/BeforeDashboard#BeforeDashboard"],
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
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
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
  globals: payloadGlobals,
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) {
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
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    },
    push,
  }),
  editor: lexicalEditor(),
  plugins: [
    ...cmsPlugins,
    s3Storage({
      bucket: process.env.R2_BUCKET || "payload-media",
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => buildPublicMediaURL({ filename, prefix }),
        },
        documents: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => buildPublicMediaURL({ filename, prefix }),
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "placeholder",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "placeholder",
        },
        endpoint: process.env.R2_ENDPOINT || "https://example.invalid",
        forcePathStyle: true,
        region: process.env.R2_REGION || "auto",
      },
      enabled: isR2Configured(),
    }),
  ],
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  onInit: async (payload) => {
    await seedDefaultSiteIfEmpty(payload);
  },
});
