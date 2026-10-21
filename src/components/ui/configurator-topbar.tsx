import type { HTMLAttributes, ReactNode } from "react";

/**
 * topbar from Figma "02 — Components" → "Configurator" (9207:32131): the head of a configurator
 * step, `[01] LABEL` in Label S on `bg-fill`, the number in `ui-tertiary` and the label in
 * `ui-primary`, `spacing/sm` around. A `stroke/width` frame in `border-primary`, drawn inside as
 * Figma's stroke is, and `radius-sm` on the top corners only; configurator-box puts its choices
 * under it. Named for the configurator so it is not taken for the site's navigation.
 */

type ConfiguratorTopbarProps = HTMLAttributes<HTMLDivElement> & {
  /** Step number, shown as `[01]`. */
  number: ReactNode;
  label: ReactNode;
};

export function ConfiguratorTopbar({ number, label, className, ...props }: ConfiguratorTopbarProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-t-sm bg-bg-fill p-(--spacing-sm) text-label-s whitespace-nowrap ring-(length:--stroke-width) ring-border-primary ring-inset ${className ?? ""}`}
      {...props}
    >
      <span className="text-ui-tertiary">[{number}]</span>
      <span className="text-ui-primary">{label}</span>
    </div>
  );
}
