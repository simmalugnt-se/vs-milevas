import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ContactProps = HTMLAttributes<HTMLElement> & {
  /** Display L: "Kontakt". */
  heading: ReactNode;
  /** The heading's element: `h1` when the block opens a page without a hero. */
  headingAs?: "h1" | "h2";
  /** The numbered rows: e-mail, phone, social links. Several links in a row sit `spacing/xs` apart. */
  items: ReactNode[];
  /** A <ContactForm type="contact">. */
  form: ReactNode;
};

/** A link in a row: plain for e-mail and phone, `underline` for the social links as in Figma. */
export function ContactLink({
  underline = false,
  className,
  ...attributes
}: AnchorHTMLAttributes<HTMLAnchorElement> & { underline?: boolean }) {
  return (
    <a
      {...attributes}
      className={`${underline ? "underline decoration-from-font [text-underline-position:from-font]" : ""} ${className ?? ""}`}
    />
  );
}

/** Figma's lines add to the height, as a border does. */
const line = "border-b-(length:--stroke-width) border-border-primary";

/**
 * Contact from Figma "04 — Blocks" (9098:22568), on Dark `bg-fill`, `spacing/3xl` above and below:
 * the Display L heading with `spacing/4xl` and a line under it, then numbered Text XL rows with a
 * line under each. The form is set against the bottom of the rows.
 * - Desktop L and S: the rows over columns 1–6 of 12, the form over 8–12, `spacing/sm` inside the
 *   outer edges.
 * - Tablet and Mobile: the rows above the form, `spacing/4xl` apart and `spacing/sm` at the sides.
 *   Tablet gives both the same height, as Figma's two equal rows.
 */
export function Contact({
  heading,
  headingAs: Heading = "h2",
  items,
  form,
  ...attributes
}: ContactProps) {
  return (
    <section
      {...attributes}
      className="grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) gap-y-(--spacing-4xl) mode-dark bg-bg-fill px-(--spacing-2xs) py-(--spacing-3xl) text-ui-primary tablet:auto-rows-fr"
    >
      <div className="col-span-full flex flex-col self-start px-(--spacing-sm) desktop-s:col-span-6 desktop-s:pr-0">
        <Heading className={`pb-(--spacing-4xl) text-display-l ${line}`}>{heading}</Heading>
        <ul className="flex flex-col">
          {items.map((item, index) => (
            <li
              key={index}
              className={`flex flex-wrap items-center gap-(--spacing-xs) py-(--spacing-sm) text-text-xl ${line}`}
            >
              <span className="text-label-s">[{String(index + 1).padStart(2, "0")}]</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-full flex flex-col justify-end px-(--spacing-sm) desktop-s:col-[8/span_5] desktop-s:row-start-1 desktop-s:pl-0">
        {form}
      </div>
    </section>
  );
}
