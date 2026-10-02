"use client";

import { Button } from "@payloadcms/ui";
import { useState } from "react";
import { revalidateAllAction } from "./revalidate-all-action";

/** Dashboard footer: site-wide cache actions, under their own heading. */
export function CacheTools() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleRevalidate = async () => {
    setStatus("loading");
    try {
      await revalidateAllAction();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label = {
    error: "Revalidate failed",
    idle: "Revalidate all cache",
    loading: "Revalidating...",
    success: "Revalidated!",
  }[status];

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--base)",
        // The dashboard above ends with its widgets' 6px padding.
        marginTop: "calc(var(--base) - 6px)",
        paddingBottom: "calc(var(--base) * 2)",
        // Dashboard widgets sit 6px in; line up with their headings.
        paddingInline: 6,
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>Cache</h2>
        <p style={{ margin: "calc(var(--base) * 0.25) 0 0", color: "var(--theme-elevation-600)" }}>
          Pages are cached and refreshed when content changes. Revalidate everything if the site
          shows outdated content.
        </p>
      </div>
      <div>
        <Button
          buttonStyle="secondary"
          disabled={status === "loading"}
          margin={false}
          onClick={handleRevalidate}
        >
          {label}
        </Button>
      </div>
    </section>
  );
}
