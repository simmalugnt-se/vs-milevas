import path from "path";

type BuildPublicMediaURLArgs = {
  filename: string;
  prefix?: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const isR2Configured = () =>
  [
    process.env.R2_BUCKET,
    process.env.R2_ENDPOINT,
    process.env.R2_ACCESS_KEY_ID,
    process.env.R2_SECRET_ACCESS_KEY,
    process.env.R2_PUBLIC_URL,
  ].every(Boolean);

export const buildPublicMediaURL = ({ filename, prefix = "" }: BuildPublicMediaURLArgs) => {
  const baseURL = process.env.R2_PUBLIC_URL;

  if (!baseURL) {
    return "";
  }

  return `${trimTrailingSlash(baseURL)}/${path.posix.join(prefix, encodeURIComponent(filename))}`;
};
