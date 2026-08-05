import { draftMode } from "next/headers";
import { AdminBar } from ".";

export async function AdminBarSlot() {
  const { isEnabled } = await draftMode();

  return (
    <AdminBar
      adminBarProps={{
        preview: isEnabled,
      }}
    />
  );
}
