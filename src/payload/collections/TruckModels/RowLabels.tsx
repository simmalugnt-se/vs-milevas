"use client";

import { useRowLabel } from "@payloadcms/ui";
import { useFamily } from "./useFamily";

/** "Hytt: Med hytt": a row of Bilder med tillval, by its option. */
export function OptionImageRowLabel() {
  const { data, rowNumber } = useRowLabel<{ option?: string }>();
  const family = useFamily();
  for (const group of family?.groups ?? []) {
    const option = group.options.find((candidate) => candidate.id === data?.option);
    if (option) return <span>{`${group.label}: ${option.label}`}</span>;
  }
  return <span>{`Bild ${(rowNumber ?? 0) + 1}`}</span>;
}
