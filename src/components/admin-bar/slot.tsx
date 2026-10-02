import { draftMode } from "next/headers";
import { getPayloadDbReady } from "@/payload/data/db-ready";
import { AdminBar } from ".";

export async function AdminBarSlot() {
  // The bar asks /api/users/me from the browser, which would start Payload against a database
  // that is not there yet; the page shows setup steps instead.
  if (!(await getPayloadDbReady()).ready) {
    return null;
  }
  const { isEnabled } = await draftMode();

  return (
    <AdminBar
      adminBarProps={{
        preview: isEnabled,
      }}
    />
  );
}
