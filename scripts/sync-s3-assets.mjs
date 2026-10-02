#!/usr/bin/env node
/**
 * Copies uploaded files between environments: the project folders (local, as SERVICES=local keeps
 * them) and the buckets in `.env.remote.staging` and `.env.remote.prod`.
 *
 *   node scripts/sync-s3-assets.mjs --from <local|staging|prod> --to <local|staging|prod> [--force]
 *
 * Files are added or replaced, never deleted. A file already at the target with the same size is
 * skipped. Between buckets the keys stay as they are; into the project folders, files land by name
 * (see localPath). Writing to prod needs --force.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { REMOTE_ENVS, remoteStorage } from "./lib/remote-env.mjs";

/** Each upload collection: its folder with local uploads, and its prefix in the bucket. Keep the
 * prefixes in step with the storage plugin in src/payload.config.ts. */
const uploads = [
  { folder: "images", prefix: "media" },
  { folder: "documents", prefix: "documents" },
];

const contentTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const valueOf = (flag) => {
    const index = args.indexOf(flag);
    return index === -1 ? "" : (args[index + 1] || "").toLowerCase();
  };
  return { from: valueOf("--from"), to: valueOf("--to"), force: args.includes("--force") };
};

/** A side of the copy: list, read and write files by bucket key (`prefix/filename`). */
const localSide = () => ({
  label: "the project folders",
  async list() {
    const files = [];
    for (const { folder, prefix } of uploads) {
      if (!existsSync(folder)) continue;
      for (const entry of await readdir(folder, { withFileTypes: true })) {
        if (!entry.isFile() || entry.name.startsWith(".")) continue;
        const { size } = await stat(path.join(folder, entry.name));
        files.push({ key: `${prefix}/${entry.name}`, size });
      }
    }
    return files;
  },
  async size(key) {
    const file = localPath(key);
    if (!existsSync(file)) return null;
    return (await stat(file)).size;
  },
  async read(key) {
    const body = await readFile(localPath(key));
    return { body, contentType: contentTypeOf(key) };
  },
  async write(key, { body }) {
    const file = localPath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  },
});

const bucketSide = (name) => {
  const storage = remoteStorage(name);
  const client = new S3Client({
    credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
    endpoint: storage.endpoint,
    forcePathStyle: true,
    region: storage.region,
    // Neon rejects the checksum newer AWS SDKs add by default.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const Bucket = storage.bucket;
  return {
    label: `${name} (${Bucket})`,
    async list() {
      const files = [];
      for (const { prefix } of uploads) {
        let ContinuationToken;
        do {
          const page = await client.send(
            new ListObjectsV2Command({ Bucket, Prefix: `${prefix}/`, ContinuationToken }),
          );
          for (const item of page.Contents ?? []) {
            files.push({ key: item.Key, size: item.Size });
          }
          ContinuationToken = page.NextContinuationToken;
        } while (ContinuationToken);
      }
      return files;
    },
    async size(key) {
      try {
        return (await client.send(new HeadObjectCommand({ Bucket, Key: key }))).ContentLength;
      } catch (error) {
        if (error?.$metadata?.httpStatusCode === 404) return null;
        throw error;
      }
    },
    async read(key) {
      const object = await client.send(new GetObjectCommand({ Bucket, Key: key }));
      return {
        body: Buffer.from(await object.Body.transformToByteArray()),
        contentType: object.ContentType || contentTypeOf(key),
      };
    },
    async write(key, { body, contentType }) {
      await client.send(
        new PutObjectCommand({ Body: body, Bucket, ContentType: contentType, Key: key }),
      );
    },
  };
};

/** Where a bucket file goes in the project folders. Uploads from the browser sit one level deeper
 * in the bucket (`prefix/<object key>/filename`); local uploads sit in the folder itself. */
const localPath = (key) => {
  const upload = uploads.find(({ prefix }) => key.startsWith(`${prefix}/`));
  return path.join(upload.folder, path.posix.basename(key));
};

const contentTypeOf = (key) =>
  contentTypes[path.extname(key).toLowerCase()] ?? "application/octet-stream";

const side = (name) => (name === "local" ? localSide() : bucketSide(name));

const main = async () => {
  const { from, to, force } = parseArgs();
  const valid = ["local", ...REMOTE_ENVS];

  if (!valid.includes(from) || !valid.includes(to) || from === to) {
    throw new Error(
      "Usage: node scripts/sync-s3-assets.mjs --from <local|staging|prod> --to <local|staging|prod> [--force]",
    );
  }
  if (to === "prod" && !force) {
    throw new Error("Refusing to write to prod. Re-run with --force.");
  }

  const source = side(from);
  const target = side(to);
  const files = await source.list();
  let copied = 0;

  console.log(`[sync] ${files.length} files in ${source.label}, copying to ${target.label}...`);
  for (const file of files) {
    if ((await target.size(file.key)) === file.size) continue;
    await target.write(file.key, await source.read(file.key));
    copied++;
    console.log(`[sync] ${file.key}`);
  }
  console.log(`[sync] Done: ${copied} copied, ${files.length - copied} already there.`);
};

main().catch((error) => {
  console.error(`[sync] ${error.message}`);
  process.exit(1);
});
