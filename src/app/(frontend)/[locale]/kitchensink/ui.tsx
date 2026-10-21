import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FigmaNotes } from "./figma-notes-list";
import {
  kitchensinkPages,
  type KitchensinkPage as Page,
  type SectionId,
  sectionTitle,
} from "./sections";

const findPage = (href: Page["href"]) =>
  kitchensinkPages.find((page) => page.href === href) ?? kitchensinkPages[0];

/** The page's sections as links, grouped; a sticky column from Desktop S, a row of chips below. */
function SectionIndex({ page, layout }: { page: Page; layout: "column" | "chips" }) {
  if (layout === "chips") {
    return (
      <nav aria-label="Sektioner">
        <ul className="flex flex-wrap gap-(--spacing-2xs)">
          {page.groups.flatMap((group) =>
            group.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-sm border border-border-primary px-(--spacing-2xs) py-(--spacing-3xs) text-text-xs text-ui-secondary hover:border-border-secondary hover:text-ui-primary"
                >
                  {section.title}
                </a>
              </li>
            )),
          )}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Sektioner" className="sticky top-28 space-y-(--spacing-md)">
      {page.groups.map((group) => (
        <div key={group.title} className="space-y-(--spacing-2xs)">
          <p className="text-label-s text-ui-tertiary">{group.title}</p>
          <ul className="space-y-(--spacing-3xs)">
            {group.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-text-m text-ui-secondary hover:text-ui-primary"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * One kitchensink page: title and intro from `sections.ts`, the section index beside the content
 * from Desktop S. `fullWidth` drops the index column, for blocks that run edge to edge.
 */
export function KitchensinkPage({
  href,
  fullWidth,
  children,
}: {
  href: Page["href"];
  fullWidth?: boolean;
  children: ReactNode;
}) {
  const page = findPage(href);
  const hasSections = page.groups.length > 0;
  const withColumn = hasSections && !fullWidth;

  return (
    <div
      className={`px-(--ks-gutter) pt-(--spacing-xl) ${
        withColumn
          ? "desktop-s:grid desktop-s:grid-cols-[11rem_minmax(0,1fr)] desktop-s:gap-x-(--spacing-2xl)"
          : ""
      }`}
    >
      {withColumn ? (
        <aside className="hidden desktop-s:block">
          <SectionIndex page={page} layout="column" />
        </aside>
      ) : null}
      <div className="min-w-0 space-y-(--spacing-3xl)">
        <header className="space-y-(--spacing-sm)">
          <h1 className="text-display-m text-ui-primary">{page.title}</h1>
          <p className="max-w-prose text-text-l text-ui-secondary">{page.intro}</p>
          {hasSections ? (
            <div className={withColumn ? "desktop-s:hidden" : ""}>
              <SectionIndex page={page} layout="chips" />
            </div>
          ) : null}
          <p className="max-w-prose text-text-xs text-ui-tertiary">
            Fortsätta arbetet? Läs <code className="font-mono">docs/design-system.md</code>; frågor
            och avvikelser står vid varje del och samlat under{" "}
            <Link href="/kitchensink/notes" className="underline hover:text-ui-primary">
              Frågor
            </Link>
            .
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

/** One of the page's groups (a Figma page), with its sections below. */
export function Group({
  title,
  figma,
  children,
}: {
  title: string;
  figma: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-(--spacing-2xl)">
      <h2 className="flex flex-wrap items-baseline justify-between gap-x-(--spacing-sm) border-b-2 border-border-secondary pb-(--spacing-2xs) text-display-s text-ui-primary">
        {title}
        <span className="text-label-s text-ui-tertiary">Figma {figma}</span>
      </h2>
      <div className="space-y-(--spacing-2xl) *:not-first:border-t *:not-first:border-border-primary *:not-first:pt-(--spacing-xl)">
        {children}
      </div>
    </div>
  );
}

/**
 * One token group or component. `figma` is the node it is built from and `api` the component's
 * props, both shown under the title. `draft` marks a component whose Figma frame is not finished.
 * The section's questions and deviations from `figma-notes.ts` follow.
 */
export function Section({
  id,
  figma,
  api,
  description,
  draft,
  children,
}: {
  id: SectionId;
  figma?: string;
  api?: string;
  description?: ReactNode;
  /** Why the component is a draft; shown as a notice under the title. */
  draft?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28 space-y-(--spacing-md)">
      <div className="space-y-(--spacing-2xs)">
        <h3
          id={id}
          className="flex flex-wrap items-baseline gap-x-(--spacing-sm) text-display-xs text-ui-primary"
        >
          {sectionTitle(id)}
          {draft ? <span className="text-label-s text-status-warning">Utkast</span> : null}
        </h3>
        {figma || api ? (
          <p className="flex flex-wrap gap-x-(--spacing-sm) gap-y-1 font-mono text-xs text-ui-tertiary">
            {figma ? <span>Figma {figma}</span> : null}
            {api ? <code className="text-ui-secondary">{api}</code> : null}
          </p>
        ) : null}
        {draft ? (
          <p className="max-w-prose border-l-4 border-status-warning bg-bg-fill px-4 py-3 text-sm text-ui-primary">
            {draft}
          </p>
        ) : null}
        {description ? (
          <div className="max-w-prose text-sm text-ui-secondary">{description}</div>
        ) : null}
      </div>
      <FigmaNotes target={id} />
      {children}
    </section>
  );
}

/** One variant with a label above it, so every example says what it shows. */
export function Example({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={`min-w-0 space-y-2 ${className ?? ""}`}>
      <figcaption className="font-mono text-xs text-ui-secondary">{label}</figcaption>
      {children}
    </figure>
  );
}
