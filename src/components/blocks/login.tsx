import type { HTMLAttributes, ReactNode } from "react";

type LoginProps = HTMLAttributes<HTMLElement> & {
  /** The photo beside the form from Desktop S; it fills its half (`object-cover`). */
  image: ReactNode;
  /** The form: <LoginForm>. */
  children: ReactNode;
};

/**
 * Login from Figma "04 — Blocks" (9170:26321), one screen high on Dark `bg-fill`, `grid/margin`
 * around:
 * - Desktop L and S: the photo over columns 1–6 and a white panel (`bg-active`, `radius-lg`) over
 *   7–12, the form centred in the panel's columns 2–5 of 6.
 * - Tablet: the panel alone, the form in the same columns.
 * - Mobile: the panel alone, the form `spacing/md` from its sides.
 * On the page the navigation lies over it in Light, as on Figma's Login page (`data-navigation`).
 */
export function Login({ image, children, ...attributes }: LoginProps) {
  return (
    <section
      data-navigation="light"
      data-navigation-start
      {...attributes}
      className="grid min-h-svh grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-(--grid-gap) mode-dark bg-bg-fill p-(--grid-margin)"
    >
      <div className="relative hidden overflow-hidden rounded-lg desktop-s:col-span-6 desktop-s:block">
        {image}
      </div>
      <div className="col-span-full mode-light grid grid-cols-6 gap-x-(--spacing-2xs) rounded-lg bg-bg-active px-(--spacing-md) tablet:px-0 desktop-s:col-span-6">
        <div className="col-span-full flex flex-col justify-center-safe py-(--spacing-xl) tablet:col-[2/span_4]">
          {children}
        </div>
      </div>
    </section>
  );
}
