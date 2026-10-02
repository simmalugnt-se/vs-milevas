#!/usr/bin/env node
/**
 * Sets the CORS rule uploads from the browser need on the bucket in `.env.remote.<env>`: GET, HEAD
 * and PUT from the addresses Admin runs on. Replaces the bucket's current rules.
 *
 *   node scripts/set-bucket-cors.mjs --env <staging|prod> --origin <url> [--origin <url> ...] [--force]
 *
 * An origin may hold one `*`, such as `https://*.vercel.app`. Changing prod needs --force.
 */
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { REMOTE_ENVS, remoteStorage } from "./lib/remote-env.mjs";

const args = process.argv.slice(2);
const env = (args[args.indexOf("--env") + 1] || "").toLowerCase();
const origins = args.flatMap((arg, index) => (arg === "--origin" ? [args[index + 1]] : []));

const main = async () => {
  if (!REMOTE_ENVS.includes(env) || origins.length === 0 || origins.some((origin) => !origin)) {
    throw new Error(
      "Usage: node scripts/set-bucket-cors.mjs --env <staging|prod> --origin <url> [--origin <url> ...] [--force]",
    );
  }
  if (env === "prod" && !args.includes("--force")) {
    throw new Error("Refusing to change prod. Re-run with --force.");
  }

  const storage = remoteStorage(env);
  const client = new S3Client({
    credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
    endpoint: storage.endpoint,
    forcePathStyle: true,
    region: storage.region,
  });
  await client.send(
    new PutBucketCorsCommand({
      Bucket: storage.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD", "PUT"],
            AllowedOrigins: origins,
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
  const { CORSRules } = await client.send(new GetBucketCorsCommand({ Bucket: storage.bucket }));
  console.log(`[cors] ${env} (${storage.bucket}): ${CORSRules?.[0]?.AllowedOrigins?.join(", ")}`);
};

main().catch((error) => {
  console.error(`[cors] ${error.message}`);
  process.exit(1);
});
