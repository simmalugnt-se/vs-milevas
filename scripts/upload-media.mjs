#!/usr/bin/env node

import { spawnSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const { AWS_ENDPOINT_URL_S3, AWS_REGION, S3_BUCKET } = process.env;

if (!AWS_ENDPOINT_URL_S3 || !AWS_REGION || !S3_BUCKET) {
  console.error("Set AWS_ENDPOINT_URL_S3, AWS_REGION and S3_BUCKET (the cloud storage values).");
  process.exit(1);
}

// Payload puts the files in the bucket's root. Neon rejects the checksum newer AWS tools add.
const result = spawnSync(
  "aws",
  [
    "s3",
    "sync",
    "./media",
    `s3://${S3_BUCKET}/`,
    "--endpoint-url",
    AWS_ENDPOINT_URL_S3,
    "--region",
    AWS_REGION,
  ],
  { stdio: "inherit", env: { ...process.env, AWS_REQUEST_CHECKSUM_CALCULATION: "when_required" } },
);

if (result.error) {
  console.error(`Could not run the AWS CLI: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
