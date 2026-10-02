import path from "path";
import { objectStorage } from "@/utilities/services.mjs";

type BuildPublicMediaURLArgs = {
  filename: string;
  /** Null on rows stored before the storage fields existed. */
  prefix?: string | null;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** The public address of an uploaded file in the bucket (see services.mjs), or "" without one. */
export const buildPublicMediaURL = ({ filename, prefix }: BuildPublicMediaURLArgs) => {
  const baseURL = objectStorage()?.publicUrl;

  if (!baseURL) {
    return "";
  }

  return `${trimTrailingSlash(baseURL)}/${path.posix.join(prefix ?? "", encodeURIComponent(filename))}`;
};
