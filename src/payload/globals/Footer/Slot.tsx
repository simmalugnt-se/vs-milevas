import { draftMode } from "next/headers";
import type { TypedLocale } from "payload";
import { FooterComponent } from "./Component";

type FooterSlotProps = {
  locale: TypedLocale;
};

export async function FooterSlot({ locale }: FooterSlotProps) {
  const { isEnabled } = await draftMode();

  return <FooterComponent locale={locale} draft={isEnabled} />;
}
