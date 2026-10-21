"use client";

import { type ReactNode, useState } from "react";
import { Icon } from "./icon";

/**
 * truckinfo from Figma "02 — Components" → "blabla" (8268:2927): the 16px `info` icon as a button.
 * `clicked` shows the text above it, right-aligned, in a 135px Dark box (`bg-fill`, `radius-sm`,
 * `spacing/2xs`) in Text S; another click hides it.
 */
export function TruckInfo({
  text,
  label = "Visa information",
  defaultOpen = false,
}: {
  /** Figma: "Lyftkapacitet, power och höjd". */
  text: ReactNode;
  /** The button's accessible name. */
  label?: string;
  /** Start clicked (the kitchensink uses it). */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <span className="relative z-10 flex">
      {open ? (
        <span className="mode-dark absolute right-0 bottom-[calc(100%+var(--spacing-2xs))] w-[8.4375rem] rounded-sm bg-bg-fill p-(--spacing-2xs) text-left text-text-s text-ui-primary">
          {text}
        </span>
      ) : null}
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="text-ui-secondary"
      >
        <Icon name="info" />
      </button>
    </span>
  );
}
