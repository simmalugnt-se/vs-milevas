import { PayloadAdminDatabaseSetupShell } from "@/components/payload/payload-admin-database-setup-shell";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import "@payloadcms/next/css";
import "./custom.scss";
import { metadata } from "@payloadcms/next/layouts";
import { serverFunction } from "./serverFunction";

export { metadata };

export default async function PayloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ready } = await getPayloadDbReady();

  if (!ready) {
    return <PayloadAdminDatabaseSetupShell>{children}</PayloadAdminDatabaseSetupShell>;
  }

  const { RootLayout } = await import("@payloadcms/next/layouts");
  const config = await import("@payload-config");
  const { importMap } = await import("./importMap.js");

  return (
    <RootLayout
      config={config.default}
      htmlProps={{
        suppressHydrationWarning: true,
      }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
