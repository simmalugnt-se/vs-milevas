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
};

/**
 * contact-form from Figma "02 — Components" → "Form" (9309:27343). Mobile below Tablet, Desktop
 * from Tablet.
 * - order and call: a white panel (`bg-active`, `radius-lg`) in Figma's proportions (784 × 816 and
 *   375 × 816), the content centred: Text XL heading and Text XS text, then the fields and the button
 *   with `spacing/lg` between. Desktop lays the panel out on six columns, the content in columns 2–5
 *   and the 24px cross in the sixth; Mobile has `spacing/md` at the sides and no cross.
 * - order: the fields stacked, `spacing/sm` apart. call: two to a row on Desktop, `spacing/md` apart.
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

  return (
    <form
      className={`mode-light grid grid-cols-6 gap-x-(--spacing-2xs) rounded-lg bg-bg-active px-(--spacing-md) tablet:px-0 ${
        fill ? "h-full overflow-y-auto" : "aspect-[375/816] tablet:aspect-[784/816]"
      } ${className ?? ""}`}
      {...props}
    >
      <div className="col-span-full row-start-1 flex flex-col justify-center-safe gap-(--spacing-lg) py-(--spacing-xl) tablet:col-[2/span_4]">
        <div className="flex flex-col gap-(--spacing-2xs)">
          {heading ? <h2 className="text-text-xl text-ui-primary">{heading}</h2> : null}
          {text ? <p className="text-text-xs text-ui-tertiary">{text}</p> : null}
        </div>
        {fields}
        {submit}
      </div>
      {onClose ? (
        <div className="col-start-6 row-start-1 flex justify-end self-start p-(--spacing-sm) max-tablet:-mr-(--spacing-md)">
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
