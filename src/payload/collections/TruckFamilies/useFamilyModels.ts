"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useEffect, useState } from "react";

export type FamilyModel = { id: string; name: string };

/** One request for every matrix that asks at once, kept a moment. */
const requests = new Map<string, Promise<FamilyModel[]>>();

function fetchModels(id: string): Promise<FamilyModel[]> {
  const pending = requests.get(id);
  if (pending) return pending;
  const query = new URLSearchParams({
    "where[family][equals]": id,
    depth: "0",
    draft: "true",
    limit: "200",
    sort: "capacityKg",
    "select[name]": "true",
  });
  const request = fetch(`/api/truck-models?${query}`, { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .then((result: { docs?: FamilyModel[] } | null) => result?.docs ?? [])
    .catch(() => [])
    .finally(() => setTimeout(() => requests.delete(id), 2000));
  requests.set(id, request);
  return request;
}

/** The truck type's models, smallest first; empty until read, and for a truck type not saved yet. */
export function useFamilyModels() {
  const { id } = useDocumentInfo();
  const [models, setModels] = useState<FamilyModel[]>([]);
  useEffect(() => {
    if (!id) return;
    let current = true;
    void fetchModels(String(id)).then((docs) => {
      if (current) setModels(docs);
    });
    return () => {
      current = false;
    };
  }, [id]);
  return models;
}
