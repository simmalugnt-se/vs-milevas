"use client";

import { Button } from "@payloadcms/ui";
import { useState } from "react";
import { revalidateAllAction } from "./revalidate-all-action";

export function BeforeDashboard() {
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
    <div style={{ marginBottom: "var(--base)" }}>
      <Button disabled={status === "loading"} onClick={handleRevalidate} size="large">
        {label}
      </Button>
    </div>
  );
}
