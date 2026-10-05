"use client";

import { useEffect, useState } from "react";

/**
 * The page grid (Figma "Grid") drawn over the page, to check a layout against Figma. Ctrl+Shift+G
 * toggles it and the choice is remembered in this browser. Only in development. It uses the same
 * `grid-layout` as the blocks, so columns, gap and margin follow each mode: 12 columns from
 * Desktop S, 6 below. Each block (`data-layout-block`) is outlined too, see `site-theme.css`.
 */

const STORAGE_KEY = "milevas:grid-overlay-visible";

export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "true")
        queueMicrotask(() => setVisible(true));
    } catch {}

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.toLowerCase() === "g"
      ) {
        event.preventDefault();
        setVisible((previous) => {
          try {
            window.localStorage.setItem(STORAGE_KEY, String(!previous));
          } catch {}
          return !previous;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const enabled = process.env.appEnv === "development" && visible;

  useEffect(() => {
    document.documentElement.toggleAttribute("data-grid-overlay-visible", enabled);
    return () => document.documentElement.removeAttribute("data-grid-overlay-visible");
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      data-grid-overlay
      className="grid-layout pointer-events-none fixed inset-0 z-[9999]"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className={`border-x border-[#ff2d7a99] bg-[#ff2d7a14] ${index >= 6 ? "max-desktop-s:hidden" : ""}`}
        />
      ))}
    </div>
  );
}
