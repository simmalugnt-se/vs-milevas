import type { HTMLAttributes, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";

/**
 * Image & Text from Figma "04 — Blocks" (9098:16638): a photo over the whole block under a 65 %
 * black layer, and on it, centred, a Display L heading, a text and a Tejp button, `spacing/md`
 * apart, in Dark's `ui-primary`.
 * - Desktop L and S: the text over columns 3–10 of 12.
 * - Tablet and Mobile: over all 6 columns; Mobile has Text L instead of Text XL.
 * 800px high in every mode (a 50rem minimum here, so long copy can grow), with `spacing/sm` inside
 * the edges. Edge to edge, as the other blocks: Figma's Desktop frames are 16px narrower than the
 * page (1424 and 1264), see figma-notes.
 *
 * Reused by a Payload block with localized copy and visual editing markers.
 */

type ImageTextProps = HTMLAttributes<HTMLElement> & {
  /** The photo, e.g. a `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
  heading: ReactNode;
  text?: ReactNode;
  cta?: {
    label: string;
    href: string;
    rel?: string;
    target?: "_blank";
    attributes?: HTMLAttributes<HTMLAnchorElement>;
  };
};

export function ImageText({ image, heading, text, cta, ...attributes }: ImageTextProps) {
  return (
    <section
      {...attributes}
      className="relative isolate grid min-h-[50rem] grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) overflow-hidden mode-dark bg-bg-fill p-(--spacing-sm)"
    >
      <div className="absolute inset-0 -z-10">
        {image}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.65)]" />
      </div>
      <div className="col-span-full flex flex-col items-center justify-center gap-(--spacing-md) text-center text-ui-primary desktop-s:col-span-8 desktop-s:col-start-3">
        <h2 className="text-display-l">{heading}</h2>
        {text ? <p className="text-text-l tablet:text-text-xl tablet:text-pretty">{text}</p> : null}
        {cta ? (
          <ButtonLink
            {...cta.attributes}
            href={cta.href}
            rel={cta.rel}
            target={cta.target}
            mode="tejp"
            size="m"
          >
            {cta.label}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  );
}
