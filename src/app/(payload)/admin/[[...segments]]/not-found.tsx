import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "../../importMap";

type AdminNotFoundProps = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminNotFound({ params, searchParams }: AdminNotFoundProps) {
  return NotFoundPage({
    config: Promise.resolve(config),
    importMap,
    params,
    searchParams,
  });
}
