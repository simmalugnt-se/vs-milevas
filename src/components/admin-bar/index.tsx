"use client";

import type { PayloadAdminBarProps, PayloadMeUser } from "@payloadcms/admin-bar";
import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { useSelectedLayoutSegments } from "next/navigation";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/utilities/ui";

import "./index.scss";

import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getClientSideURL } from "@/utilities/getURL";

const localeSet = new Set<string>(routing.locales);

const collectionLabels = {
  pages: {
    plural: "Pages",
    singular: "Page",
  },
};

const Title: React.FC = () => <span>Dashboard</span>;

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps;
}> = (props) => {
  const { adminBarProps } = props || {};
  const segments = useSelectedLayoutSegments();
  const isPreviewMode = Boolean(adminBarProps?.preview);
  const isInIframe = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    },
    () => false,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const collection = ((): keyof typeof collectionLabels => {
    const s = segments ?? [];
    let i = 0;
    if (s[0] && localeSet.has(s[0])) {
      i = 1;
    }
    if (collectionLabels[s[i + 1] as keyof typeof collectionLabels] && s[i + 1] !== undefined) {
      return s[i + 1] as keyof typeof collectionLabels;
    }
    return "pages";
  })();

  const exitDraftMode = React.useCallback(() => {
    const s = segments ?? [];
    const locale = s[0] && localeSet.has(s[0]) ? s[0] : routing.defaultLocale;
    fetch(`/${locale}/next/exit-preview`)
      .catch(() => {
        // Ignore network failures; a refresh will still re-check draft mode.
      })
      .finally(() => {
        setIsMenuOpen(false);
        router.push("/");
        router.refresh();
      });
  }, [router, segments]);

  const onAuthChange = React.useCallback(
    (user: PayloadMeUser) => {
      const authenticated = Boolean(user?.id);
      setIsAuthenticated(authenticated);
      if (!authenticated && !isPreviewMode) setIsMenuOpen(false);
    },
    [isPreviewMode],
  );

  const show = isPreviewMode || isAuthenticated;

  const launcherPositionClasses = isInIframe
    ? "top-4 left-1/2 -translate-x-1/2"
    : "bottom-4 right-4";
  const panelPositionClasses = isInIframe
    ? "top-12 left-1/2 -translate-x-1/2"
    : "bottom-12 right-0";

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={panelRef}
      className={cn("admin-bar", `fixed z-[99990] ${launcherPositionClasses}`, {
        block: show,
        hidden: !show,
      })}
    >
      <div
        className={cn(
          `absolute min-w-[260px] max-w-[min(340px,calc(100vw-2rem))] rounded-lg border border-white/15 bg-black/95 p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-200 ${panelPositionClasses}`,
          isMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <PayloadAdminBar
          {...adminBarProps}
          className="flex w-full flex-col items-start gap-2 text-sm text-white"
          classNames={{
            controls: "flex w-full flex-col items-start gap-1.5 pt-1",
            create:
              "w-full rounded-sm border border-white/15 px-2 py-1.5 text-left text-white/95 transition hover:bg-white/10",
            edit: "w-full rounded-sm border border-white/15 px-2 py-1.5 text-left text-white/95 transition hover:bg-white/10",
            logo: "text-white font-semibold",
            logout:
              "w-full rounded-sm border border-white/15 px-2 py-1.5 text-left text-white/95 transition hover:bg-white/10",
            preview:
              "w-full rounded-sm border border-white/15 px-2 py-1.5 text-left text-white/95 transition hover:bg-white/10",
            user: "max-w-full text-xs text-white/80",
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || "Pages",
            singular: collectionLabels[collection]?.singular || "Page",
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            exitDraftMode();
          }}
          logoutProps={{
            href: `/routes/logout`,
            target: "_self",
          }}
          style={{
            backgroundColor: "transparent",
            padding: 0,
            position: "relative",
            zIndex: "unset",
          }}
          unstyled
        />
        {isPreviewMode && !isAuthenticated ? (
          <button
            className="w-full rounded-sm border border-white/15 px-2 py-1.5 text-left text-sm text-white/95 transition hover:bg-white/10"
            onClick={exitDraftMode}
            type="button"
          >
            Exit draft mode
          </button>
        ) : null}
      </div>

      <button
        aria-expanded={isMenuOpen}
        aria-label="Toggle admin bar"
        className="flex h-11 items-center gap-2 rounded-full border border-white/20 bg-black/95 px-3 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:bg-black"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        type="button"
      >
        <span>{isMenuOpen ? "Close" : "Admin"}</span>
        {isPreviewMode ? (
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">
            Draft
          </span>
        ) : null}
      </button>
    </div>
  );
};
