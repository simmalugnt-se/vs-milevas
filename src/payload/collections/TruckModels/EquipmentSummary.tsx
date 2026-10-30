"use client";

import { FieldLabel, useDocumentInfo } from "@payloadcms/ui";
import type { UIFieldClientComponent } from "payload";
import { hasOption, useFamily } from "./useFamily";

/**
 * "Val" on a model: what it has of the groups that differ between the models, read from its
 * truck type, where it is changed.
 */
export const EquipmentSummary: UIFieldClientComponent = ({ path }) => {
  const { id } = useDocumentInfo();
  const family = useFamily();
  if (!family || !id) return null;
  const model = String(id);
  const differing = family.groups.filter((group) =>
    group.options.some((option) => option.models.length > 0),
  );
  return (
    <div className="field-type" style={{ marginBottom: "var(--base)" }}>
      <FieldLabel label="Val" path={path} />
      <div
        style={{
          background: "var(--theme-elevation-50)",
          borderRadius: "var(--style-radius-s)",
          padding: "calc(var(--base) * 0.6) calc(var(--base) * 0.8)",
          lineHeight: 1.7,
        }}
      >
        {differing.map((group) => (
          <div key={group.id}>
            <strong>{group.label}:</strong>{" "}
            {group.options
              .filter((option) => hasOption(option, model))
              .map((option) => option.label)
              .join(", ") || "inget"}
          </div>
        ))}
        <div>
          {differing.length
            ? "Allt annat finns för alla modeller. "
            : "Allt finns för alla modeller. "}
          <a href={`/admin/collections/truck-families/${family.id}`}>
            Ändra under trucktypens Val
          </a>
        </div>
      </div>
    </div>
  );
};
