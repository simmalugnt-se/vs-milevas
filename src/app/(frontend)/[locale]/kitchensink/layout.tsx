import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getAppEnv } from "@/utilities/environment";
import { KitchensinkTabs } from "./tabs";

/**
 * The kitchensink's frame: noindex, 404 in production, a white page below the site's overlaid
 * navigation with the pages as tabs. `--ks-gutter` is the side margin; full-width blocks cancel it.
 */
export const metadata: Metadata = {
  title: "Kitchensink",
  robots: { index: false, follow: false },
};

export default function KitchensinkLayout({ children }: { children: ReactNode }) {
  if (getAppEnv() === "prod") notFound();

  return (
    <div className="bg-bg-active pt-28 pb-(--spacing-4xl) [--ks-gutter:var(--spacing-sm)] tablet:[--ks-gutter:var(--spacing-xl)] desktop-s:[--ks-gutter:var(--spacing-2xl)]">
      <header className="space-y-(--spacing-xs) border-b border-border-primary px-(--ks-gutter)">
        <p className="text-label-s text-ui-secondary">Milevas designsystem · Kitchensink</p>
        <KitchensinkTabs />
      </header>
      {children}
    </div>
  );
}
