import type { FormHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";

export type ContactFormType = "order" | "call" | "contact";

type ContactFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> & {
  type: ContactFormType;
  /** Text XL above the fields (order, call). */
  heading?: ReactNode;
  /** Text XS under the heading (order, call). */
  text?: ReactNode;
  /**
   * The fields. In call and contact they sit two to a row from Tablet; give a full-width one
   * `tablet:col-span-2`.
   */
  children: ReactNode;
  /** The send button, full width under the fields. */
  submit: ReactNode;
  /**
   * Shows the cross top right (order, call). Figma has none on Mobile, but a popup needs one to
   * close on a phone, so it shows there too.
   */
  onClose?: () => void;
  closeLabel?: string;
  /** Fill the parent's height instead of Figma's proportions, as in the popup. */
  fill?: boolean;
  /**
   * Beside the form from Desktop S and under it below (order): a <ContactFormInfo>, "Vad händer
   * nu?". The panel then takes the whole width.
   */
  aside?: ReactNode;
};

/**
 * contact-form from Figma "02 — Components" → "Form" (9309:27343). Mobile below Tablet, Desktop
 * from Tablet.
 * - order and call: a white panel (`bg-active`, `radius-lg`) in Figma's proportions (784 × 816 and
 *   375 × 816), the content centred: Text XL heading and Text XS text, then the fields and the button
 *   with `spacing/lg` between. Desktop lays the panel out on six columns, the content in columns 2–5
 *   and the 24px cross in the sixth; Mobile has `spacing/md` at the sides and no cross.
 * - order: the fields stacked, `spacing/sm` apart. call: two to a row on Desktop, `spacing/md` apart.
 * - order with `aside` (Figma 9321:42926–42935): from Desktop S the panel has 12 columns (1424 × 816
 *   in Figma), the form in columns 2–5 and the aside in 8–11, their tops level and the two centred
 *   together; below Desktop S the aside under the form, `spacing/4xl` apart (Tablet `spacing/3xl`,
 *   64px in both), and the panel scrolls.
 * - contact: no panel; the fields two to a row on Desktop and the button below, for a Dark section.
 */
export function ContactForm({
  type,
  heading,
  text,
  children,
  submit,
  onClose,
  closeLabel = "Stäng",
  fill = false,
  aside,
  className,
  ...props
}: ContactFormProps) {
  const fields =
    type === "order" ? (
      <div className="flex flex-col gap-(--spacing-sm)">{children}</div>
    ) : (
      <div className="grid gap-x-(--spacing-2xs) gap-y-(--spacing-md) tablet:grid-cols-2">
        {children}
      </div>
    );

  if (type === "contact") {
    return (
      <form className={`flex flex-col gap-(--spacing-md) ${className ?? ""}`} {...props}>
        {fields}
        {submit}
      </form>
    );
  }

  const content = (
    <>
      <div className="flex flex-col gap-(--spacing-2xs)">
        {heading ? <h2 className="text-text-xl text-ui-primary">{heading}</h2> : null}
        {text ? <p className="text-text-xs text-ui-tertiary">{text}</p> : null}
      </div>
      {fields}
      {submit}
    </>
  );

  return (
    <form
      className={`mode-light grid grid-cols-6 gap-x-(--spacing-2xs) rounded-lg bg-bg-active px-(--spacing-md) tablet:px-0 ${
        aside ? "desktop-s:grid-cols-12" : ""
      } ${
        fill
          ? "h-full overflow-y-auto"
          : aside
            ? "aspect-[375/816] overflow-y-auto tablet:aspect-[784/816] desktop-s:aspect-[1424/816]"
            : "aspect-[375/816] tablet:aspect-[784/816]"
      } ${className ?? ""}`}
      {...props}
    >
      {aside ? (
        <div className="col-span-full row-start-1 grid grid-cols-subgrid content-center-safe gap-y-(--spacing-4xl) py-(--spacing-xl) tablet:gap-y-(--spacing-3xl)">
          <div className="col-span-full flex flex-col gap-(--spacing-lg) tablet:col-[2/span_4]">
            {content}
          </div>
          <div className="col-span-full tablet:col-[2/span_4] desktop-s:col-[8/span_4] desktop-s:row-start-1">
            {aside}
          </div>
        </div>
      ) : (
        <div className="col-span-full row-start-1 flex flex-col justify-center-safe gap-(--spacing-lg) py-(--spacing-xl) tablet:col-[2/span_4]">
          {content}
        </div>
      )}
      {onClose ? (
        <div
          className={`col-start-6 row-start-1 flex justify-end self-start p-(--spacing-sm) max-tablet:-mr-(--spacing-md) ${
            aside ? "desktop-s:col-start-12" : ""
          }`}
        >
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="text-ui-primary"
          >
            <Icon name="close" className="size-6" />
          </button>
        </div>
      ) : null}
    </form>
  );
}

type ContactFormInfoProps = {
  /** Text XL: "Vad händer nu?". */
  heading: ReactNode;
  steps: Array<{ heading: ReactNode; text?: ReactNode }>;
};

/**
 * The order popup's "Vad händer nu?" (Figma "info-box-wrapper", 9613:21687): a Text XL heading and,
 * `spacing/2xs` under it, numbered rows with a line under each, `spacing/xs` around and between:
 * `[01]` in Label S before a Text M heading, and a Text XS text in `ui-tertiary`.
 */
export function ContactFormInfo({ heading, steps }: ContactFormInfoProps) {
  return (
    <div className="flex flex-col gap-(--spacing-2xs)">
      <h2 className="text-text-xl text-ui-primary">{heading}</h2>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex flex-col gap-(--spacing-xs) py-(--spacing-xs) shadow-[inset_0_calc(var(--stroke-width)*-1)_var(--color-border-primary)]"
          >
            <p className="flex items-center gap-(--spacing-xs) text-ui-primary">
              <span className="text-label-s">[{String(index + 1).padStart(2, "0")}]</span>
              <span className="text-text-m">{step.heading}</span>
            </p>
            {step.text ? <p className="text-text-xs text-ui-tertiary">{step.text}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
