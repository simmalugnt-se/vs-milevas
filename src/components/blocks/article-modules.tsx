import type { HTMLAttributes, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";

/**
 * Article modules from Figma "04 — Blocks" (9670:17197), for building articles a module at a time:
 * Text, Lista, Rubrik and Helbild, Figma's `Type`. All are on Dark `bg-fill`.
 *
 * Reused by Payload blocks with localized copy and visual editing markers.
 */

export type ArticleCta = {
  label: string;
  href: string;
  rel?: string;
  target?: "_blank";
  attributes?: HTMLAttributes<HTMLAnchorElement>;
};

export type ArticlePlacement = "left" | "center" | "right";

/** For a `next/image` with `fill` in a module: a 5:4 image beside the text. */
export const ARTICLE_SIDE_IMAGE_SIZES = "(min-width: 1024px) 40vw, (min-width: 768px) 65vw, 100vw";
/** A 16:9 image under centered text. */
export const ARTICLE_CENTER_IMAGE_SIZES =
  "(min-width: 1024px) 50vw, (min-width: 768px) 65vw, 100vw";

/** `spacing/md` at the sides and `spacing/xl` above and below; `spacing/2xl` between the rows. */
const moduleClass =
  "grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) gap-y-(--spacing-2xl) overflow-hidden mode-dark bg-bg-fill px-(--spacing-md) py-(--spacing-xl) text-ui-primary";

const centerColumns =
  "tablet:col-span-4 tablet:col-start-2 desktop-s:col-span-6 desktop-s:col-start-4";

/** Mirrored by side; below Desktop S the image sits under the text, shifted to the other side. */
const textWithImageColumns: Record<ArticlePlacement, string> = {
  left: "tablet:col-span-4 desktop-s:col-span-6 desktop-s:row-start-1",
  center: centerColumns,
  right:
    "tablet:col-span-4 tablet:col-start-3 desktop-s:col-span-6 desktop-s:col-start-7 desktop-s:row-start-1",
};

const imageColumns: Record<ArticlePlacement, string> = {
  left: "aspect-[5/4] tablet:col-span-4 tablet:col-start-3 desktop-s:col-span-5 desktop-s:col-start-8 desktop-s:row-start-1",
  center: `aspect-video ${centerColumns}`,
  right:
    "aspect-[5/4] tablet:col-span-4 desktop-s:col-span-5 desktop-s:col-start-1 desktop-s:row-start-1",
};

function ModuleImage({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`relative col-span-full self-start overflow-hidden rounded-sm ${className}`}>
      {children}
    </div>
  );
}

function ModuleButton({ cta }: { cta: ArticleCta }) {
  return (
    <ButtonLink {...cta.attributes} href={cta.href} rel={cta.rel} target={cta.target} mode="tejp">
      {cta.label}
    </ButtonLink>
  );
}

type TextColumnProps = {
  className: string;
  heading?: ReactNode;
  headingAs: "h1" | "h2";
  lead?: ReactNode;
  cta?: ArticleCta;
  children?: ReactNode;
};

/** Figma's "Text wrapper": Text XL, Text L, the module's content and a button, `spacing/md` apart. */
function TextColumn({
  className,
  heading,
  headingAs: Heading,
  lead,
  cta,
  children,
}: TextColumnProps) {
  return (
    <div className={`col-span-full flex flex-col items-start gap-(--spacing-md) ${className}`}>
      {heading ? <Heading className="text-text-xl text-pretty">{heading}</Heading> : null}
      {lead ? <p className="text-text-l">{lead}</p> : null}
      {children}
      {cta ? <ModuleButton cta={cta} /> : null}
    </div>
  );
}

type ArticleContentProps = {
  /** Text XL. */
  heading?: ReactNode;
  /** The heading's element: `h1` when the module opens a page without a hero. */
  headingAs?: "h1" | "h2";
  /** Text L. */
  lead?: ReactNode;
  cta?: ArticleCta;
  /** A `next/image` with `fill` and `object-cover`. */
  image?: ReactNode;
};

type ArticleTextProps = HTMLAttributes<HTMLElement> &
  ArticleContentProps & {
    /** Text M, as paragraphs with a blank line between them. */
    body?: ReactNode;
    /** Where the text stands. */
    placement?: ArticlePlacement;
  };

/**
 * Type=Text. Text over 6 columns (Desktop) or 4 (Tablet) in the middle, and without an image over 7
 * or 4 at the sides. A 5:4 image goes in the opposite 5 columns on Desktop and under the text,
 * shifted, on Tablet; centered text has a 16:9 image under it in the same columns.
 */
export function ArticleText({
  heading,
  headingAs = "h2",
  lead,
  body,
  cta,
  image,
  placement = "center",
  ...attributes
}: ArticleTextProps) {
  const columns = image
    ? textWithImageColumns[placement]
    : {
        left: "tablet:col-span-4 desktop-s:col-span-7",
        center: centerColumns,
        right: "tablet:col-span-4 tablet:col-start-3 desktop-s:col-span-7 desktop-s:col-start-6",
      }[placement];
  return (
    <section {...attributes} className={moduleClass}>
      <TextColumn className={columns} heading={heading} headingAs={headingAs} lead={lead} cta={cta}>
        {body ? (
          <div className="w-full text-text-m [&_a]:underline [&_p+p]:mt-[1lh]">{body}</div>
        ) : null}
      </TextColumn>
      {image ? <ModuleImage className={imageColumns[placement]}>{image}</ModuleImage> : null}
    </section>
  );
}

type ArticleListProps = HTMLAttributes<HTMLElement> &
  ArticleContentProps & {
    /** One row each, numbered `[01]`, `[02]` and so on. */
    items: ReactNode[];
    /** Where the text stands; with no image it stands to the left, the only one Figma draws. */
    placement?: Exclude<ArticlePlacement, "center">;
  };

/**
 * Type=List. The same columns as Text with an image, and Label S numbers before Text M rows, with
 * `spacing/sm` between the rows and after the number.
 */
export function ArticleList({
  heading,
  headingAs = "h2",
  lead,
  items,
  cta,
  image,
  placement = "left",
  ...attributes
}: ArticleListProps) {
  const side = image ? placement : "left";
  return (
    <section {...attributes} className={moduleClass}>
      <TextColumn
        className={textWithImageColumns[side]}
        heading={heading}
        headingAs={headingAs}
        lead={lead}
        cta={cta}
      >
        <ol className="flex w-full flex-col gap-(--spacing-sm)">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-(--spacing-sm)">
              <span className="shrink-0 pt-[0.3125rem] text-label-s">
                [{String(index + 1).padStart(2, "0")}]
              </span>
              <span className="min-w-0 flex-1 text-text-m">{item}</span>
            </li>
          ))}
        </ol>
      </TextColumn>
      {image ? <ModuleImage className={imageColumns[side]}>{image}</ModuleImage> : null}
    </section>
  );
}

type ArticleHeadingProps = HTMLAttributes<HTMLElement> & {
  /** Display M. */
  heading: ReactNode;
  /** The heading's element: `h1` when the module opens a page without a hero. */
  headingAs?: "h1" | "h2";
  /** Text XL without an image and Text L on one, as Figma draws them. */
  text?: ReactNode;
  /** A `next/image` with `fill` and `object-cover`; the module then fills with it. */
  image?: ReactNode;
  /** Only on an image; Figma draws no button without one. */
  cta?: ArticleCta;
};

/**
 * Type=Heading, with the text over 10 of 12 columns on Desktop and all on Tablet and Mobile.
 * - Without an image: `spacing/2xl` above and below, and `spacing/md` to the text.
 * - On an image: edge to edge under a 50 % black layer, the text at the bottom with `spacing/sm`
 *   between the parts and `spacing/xl` under them. Figma's frame heights (832 on Desktop, 800 below)
 *   are proportions of the width in each mode, at most as high as the window so the text stays in
 *   view. They are minimums: text too long for them makes the module taller.
 */
export function ArticleHeading({
  heading,
  headingAs: Heading = "h2",
  text,
  image,
  cta,
  ...attributes
}: ArticleHeadingProps) {
  if (image) {
    return (
      <section
        {...attributes}
        className="relative isolate grid min-h-[min(100svh,calc(100vw*var(--height-ratio)))] grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) overflow-hidden mode-dark bg-bg-fill pb-(--spacing-xl) text-ui-primary [--height-ratio:calc(800/375)] tablet:[--height-ratio:1] desktop-s:[--height-ratio:calc(832/1280)] desktop-l:[--height-ratio:calc(832/1440)]"
      >
        <div className="absolute inset-0 -z-10">
          {image}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
        </div>
        <div className="col-span-full flex flex-col items-start justify-end gap-(--spacing-sm) px-(--spacing-md) desktop-s:col-span-10">
          <Heading className="text-display-m">{heading}</Heading>
          {text ? <p className="text-text-l">{text}</p> : null}
          {cta ? <ModuleButton cta={cta} /> : null}
        </div>
      </section>
    );
  }
  return (
    <section
      {...attributes}
      className="grid grid-cols-[repeat(var(--grid-columns),minmax(0,1fr))] gap-x-(--grid-gap) overflow-hidden mode-dark bg-bg-fill px-(--spacing-md) py-(--spacing-2xl) text-ui-primary"
    >
      <div className="col-span-full flex flex-col gap-(--spacing-md) desktop-s:col-span-10">
        <Heading className="text-display-m">{heading}</Heading>
        {text ? <p className="text-text-xl text-pretty">{text}</p> : null}
      </div>
    </section>
  );
}

type ArticleImageProps = HTMLAttributes<HTMLElement> & {
  /** A `next/image` with `fill` and `object-cover`. */
  image: ReactNode;
};

/** Type=image-full: a 16:9 image over all columns, with `spacing/2xs` above and below. */
export function ArticleImage({ image, ...attributes }: ArticleImageProps) {
  return (
    <section {...attributes} className="mode-dark bg-bg-fill px-(--spacing-md) py-(--spacing-2xs)">
      <div className="relative aspect-video overflow-hidden rounded-sm">{image}</div>
    </section>
  );
}
