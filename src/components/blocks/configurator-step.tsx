import type { ReactNode } from "react";
import { Choice } from "@/components/ui/choice";
import { ConfiguratorBox } from "@/components/ui/configurator-box";
import { FinancingChoice } from "@/components/ui/financing-choice";

export type ConfiguratorStepOption = {
  key: string;
  title: ReactNode;
  /** As shown: "169 000 kr", "+18 000 kr", "Ingår". */
  price: string;
  text?: ReactNode;
  /** A product image, e.g. a `next/image` with `fill`, for `images` and `imageRows`. */
  image?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

/**
 * Figma's step types (Configurator `9264:6653`, types 1–5):
 * - `grid`: two per row with title, price and text (type 1, the lift capacity), on Mobile too.
 * - `stack`: under each other (type 2, the mast with its help line).
 * - `images`: two per row with a photo between title and text (type 3, `Choice` `image=big`).
 * - `imageRows`: under each other with a photo on the right (type 4, `image=small`).
 * - `prices`: title and price only, large (type 5, Figma's finance box of `Financiering-02`).
 */
export type ConfiguratorStepDisplay = "grid" | "stack" | "images" | "imageRows" | "prices";

type ConfiguratorStepProps = {
  /** Shown as `[01]`. */
  number: string;
  label: string;
  display: ConfiguratorStepDisplay;
  options: ConfiguratorStepOption[];
  /** Under the box, e.g. the service agreement's <CheckboxChoice>. */
  addon?: ReactNode;
};

/** One step of the configurator: a <ConfiguratorBox> laid out as its type. */
export function ConfiguratorStep({
  number,
  label,
  display,
  options,
  addon,
}: ConfiguratorStepProps) {
  if (display === "prices") {
    return (
      <ConfiguratorBox number={number} label={label} layout="stack" addon={addon}>
        {options.map((option) => (
          <FinancingChoice
            key={option.key}
            title={option.title}
            price={option.price}
            selected={option.selected}
            onSelect={option.disabled ? undefined : option.onSelect}
            aria-disabled={option.disabled || undefined}
          />
        ))}
      </ConfiguratorBox>
    );
  }

  const pictured = display === "images" || display === "imageRows";
  const layout = display === "grid" || display === "images" ? "grid" : "stack";
  return (
    <ConfiguratorBox number={number} label={label} addon={addon} layout={layout}>
      {options.map((option) => (
        <Choice
          key={option.key}
          title={option.title}
          price={option.price}
          text={option.text}
          selected={option.selected}
          disabled={option.disabled}
          image={pictured ? option.image : undefined}
          imageSize={display === "imageRows" ? "small" : "big"}
          onClick={option.onSelect}
        />
      ))}
    </ConfiguratorBox>
  );
}
