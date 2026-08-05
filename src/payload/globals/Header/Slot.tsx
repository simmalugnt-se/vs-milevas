import { draftMode } from "next/headers";
import type { TypedLocale } from "payload";
import { HeaderComponent } from "./Component";

type HeaderSlotProps = {
  locale: TypedLocale;
};

export async function HeaderSlot({ locale }: HeaderSlotProps) {
  const { isEnabled } = await draftMode();

  return <HeaderComponent locale={locale} draft={isEnabled} />;
}
