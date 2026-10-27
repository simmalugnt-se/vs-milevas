import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PriceBox } from "@/components/ui/price-box";
import { ConfiguratorScreen } from "./configurator-screen";

/** A line of text not known yet, as high as the text around it. */
function Bone({ className = "w-24" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-[0.75em] animate-pulse rounded-xs bg-ui-tertiary/25 align-middle motion-reduce:animate-none ${className}`}
    />
  );
}

/** The frame of a configurator step's topbar and choices, as <ConfiguratorBox> draws them. */
const frame =
  "bg-bg-fill p-(--spacing-sm) ring-(length:--stroke-width) ring-border-primary ring-inset";

/**
 * The configurator's step screen before it has read the step from the address: the same
 * <ConfiguratorScreen>, one screen high, with the price box's real labels, a step box of three
 * choices whose text is still placeholders and a placeholder where the step's buttons go, so the
 * page has its height from the start and the footer does not show first and then jump down.
 */
export function ConfiguratorSkeleton({ priceRows }: { priceRows: string[] }) {
  return (
    <div aria-busy="true">
      <p className="sr-only" aria-live="polite">
        Laddar konfiguratorn…
      </p>
      <ConfiguratorScreen
        price={
          <PriceBox
            stackOnMobile
            totalLabel="Totalpris"
            total={<Bone className="w-28" />}
            rows={priceRows.map((label) => ({ label, value: <Bone className="w-16" /> }))}
          />
        }
        contact={
          <Button mode="dark" size="s" iconRight="call" className="w-full" disabled>
            Boka samtal
          </Button>
        }
        step={
          <div aria-hidden className="flex flex-col">
            <div className={`flex items-center gap-4 rounded-t-sm text-label-s ${frame}`}>
              <Bone className="w-8" />
              <Bone className="w-28" />
            </div>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`-mt-(--stroke-width) flex items-start justify-between gap-(--spacing-sm) ${frame} ${
                  index === 2 ? "rounded-b-sm" : ""
                }`}
              >
                <span className="text-display-xs">
                  <Bone className="w-40" />
                </span>
                <span className="text-label-s">
                  <Bone className="w-20" />
                </span>
              </div>
            ))}
          </div>
        }
        actions={
          // As high as a small button (its padding and its icon, hidden), but with no label: which
          // buttons the step has is not known yet.
          <span
            aria-hidden
            className="flex animate-pulse justify-center rounded-sm bg-ui-tertiary/25 p-(--spacing-xs) text-label-s motion-reduce:animate-none"
          >
            <Icon name="arrow-right" className="invisible" />
          </span>
        }
      />
    </div>
  );
}
