import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { TextBox } from "@/components/ui/text-box";

/**
 * Text & boxinfo from Figma "04 — Blocks" (8389:8524): on `bg-inv-fill`, a Display L heading in two
 * colours (the second part in `ui-brand`), Text XL below it, and a light box of text-boxes with a
 * full-width tejp button.
 * - Desktop L and S: the text over 7 of the 12 columns, the box over the last 4, at the bottom.
 * - Tablet: the box under the text, over the last 4 of 6 columns.
 * - Mobile: the box under the text, full width.
 * No fixed height (Figma's Desktop frames are 800px): the box sits at least `spacing/4xl` lower than
 * the text on Desktop, and `spacing/4xl` under it below Desktop, as Figma's 80 and 64px gaps.
 *
 * A component with props for now; it becomes a Payload block later.
 */

export type TextBoxinfoItem = { heading: ReactNode; label?: ReactNode; text?: ReactNode };

type TextBoxinfoProps = {
  heading: ReactNode;
  /** Second part of the heading, on its own line in `ui-brand`. */
  highlight?: ReactNode;
  text?: ReactNode;
  items: TextBoxinfoItem[];
  cta?: { label: string; href: string };
};

export function TextBoxinfo({ heading, highlight, text, items, cta }: TextBoxinfoProps) {
  return (
    <section className="grid-layout gap-y-(--spacing-4xl) bg-bg-inv-fill py-(--spacing-xl)">
      <div className="col-span-full flex flex-col gap-(--spacing-md) px-(--spacing-sm) desktop-s:col-span-7 desktop-s:pr-0">
        <h2 className="text-display-l text-ui-inv-primary">
          {heading}
          {highlight ? <span className="block text-ui-brand">{highlight}</span> : null}
        </h2>
        {text ? <p className="text-text-xl text-ui-inv-primary">{text}</p> : null}
      </div>
      <div className="col-span-full flex flex-col gap-(--grid-gap) px-(--spacing-sm) tablet:col-span-4 tablet:col-start-3 tablet:pl-0 desktop-s:col-start-9 desktop-s:self-end desktop-s:pt-(--spacing-4xl)">
        <div className="flex flex-col rounded-lg bg-bg-fill">
          {items.map((item, index) => (
            <TextBox key={index} {...item} border={index < items.length - 1} />
          ))}
        </div>
        {cta ? (
          <ButtonLink href={cta.href} color="tejp" size="m" className="w-full">
            {cta.label}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  );
}
