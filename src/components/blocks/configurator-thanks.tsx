import type { ReactNode } from "react";

type ConfiguratorThanksProps = {
  /** Display M: "Tack för din beställning!". */
  heading: ReactNode;
  /** A <PriceBox variant="checkout">. */
  price: ReactNode;
  /** "Boka samtal", beside the price box from Desktop S. */
  contact?: ReactNode;
  /** The truck, from Desktop S. */
  image?: ReactNode;
  /** "Vad händer nu?". */
  stepsHeading: ReactNode;
  steps: Array<{ heading: ReactNode; text?: ReactNode }>;
};

/**
 * The thank-you screen from Figma "04 — Blocks" → "COnfigurator" (`type=TNX!`, 9321:46803), on
 * `bg-fill-secondary`. Below Desktop S 6rem on top for the site's overlaid navigation; from it the
 * navigation's row (`spacing/xl`), which the price box touches, and `spacing/xl` more for the rest,
 * as the configurator's steps:
 * - Desktop S and L: the heading top left and "Vad händer nu?" bottom left over 5 of 12 columns;
 *   the truck over the other 7 with the price box and "Boka samtal" top right (304px). The
 *   window's height (Figma's frame is 832px), growing only when the content does not fit.
 * - Tablet and Mobile: the heading, the price box and the steps, `spacing/md` apart. No truck and
 *   no "Boka samtal".
 * The steps are a `bg-fill` box (`radius-lg`) of rows with a line between: `[01]` in Label S
 * before a Text L heading, and a Text M text in `ui-tertiary`, `spacing/sm` around and between.
 * Figma numbers them 01, 02, 04, 05, 05; here they count.
 */
export function ConfiguratorThanks({
  heading,
  price,
  contact,
  image,
  stepsHeading,
  steps,
}: ConfiguratorThanksProps) {
  return (
    <section className="bg-bg-fill-secondary px-(--spacing-md) pt-[calc(6rem+var(--spacing-xl))] pb-(--spacing-xl) tablet:px-(--spacing-xl) desktop-s:grid desktop-s:min-h-svh desktop-s:pt-(--spacing-xl) desktop-s:grid-cols-12 desktop-s:px-(--spacing-md)">
      <div className="flex flex-col gap-(--spacing-md) desktop-s:col-span-5 desktop-s:justify-between desktop-s:pt-(--spacing-xl)">
        <h1 className="text-display-m text-ui-primary">{heading}</h1>
        <div className="desktop-s:hidden">{price}</div>
        <div className="flex flex-col gap-(--spacing-3xs) desktop-s:gap-(--spacing-xs)">
          <h2 className="text-text-m text-ui-primary">{stepsHeading}</h2>
          <ol className="flex flex-col overflow-hidden rounded-lg bg-bg-fill">
            {steps.map((step, index) => (
              <li
                key={index}
                className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm) not-last:shadow-[inset_0_calc(var(--stroke-width)*-1)_var(--color-border-primary)]"
              >
                <p className="flex items-center gap-(--spacing-2xs) text-ui-primary">
                  <span className="text-label-s">[{String(index + 1).padStart(2, "0")}]</span>
                  <span className="text-text-l">{step.heading}</span>
                </p>
                {step.text ? <p className="text-text-m text-ui-tertiary">{step.text}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="relative hidden flex-col items-end desktop-s:col-span-7 desktop-s:flex">
        {image ? <div className="absolute inset-0">{image}</div> : null}
        <div className="relative flex w-[19rem] flex-col gap-(--spacing-2xs)">
          {price}
          {contact}
        </div>
      </div>
    </section>
  );
}
