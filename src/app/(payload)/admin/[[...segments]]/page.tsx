import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import { DatabaseSetupPage } from "@/components/cms/database-setup";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { importMap } from "../../importMap";

type AdminPageProps = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: Pick<AdminPageProps, "params" | "searchParams">) => {
  if (!(await getPayloadDbReady()).ready) {
    return { title: "Database setup | Payload CMS" };
  }
  return generatePageMetadata({
    config: Promise.resolve(config),
    params,
    searchParams,
  });
};

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const database = await getPayloadDbReady();
  if (!database.ready) {
    return <DatabaseSetupPage problem={database.problem} />;
  }

  return RootPage({
    config: Promise.resolve(config),
    importMap,
    params,
    searchParams,
  });
}
