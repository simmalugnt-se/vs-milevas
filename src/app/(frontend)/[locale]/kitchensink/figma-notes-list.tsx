import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import { designQuestions, figmaNotes, type NoteStatus, type NoteTarget } from "./figma-notes";
import { kitchensinkPages, sectionHref } from "./sections";

/** Text with `backticks` shown as code. */
function Inline({ text }: { text: string }) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="font-mono text-xs">
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

const statusClasses: Record<NoteStatus, string> = {
  Beslut: "text-ui-secondary",
  "Beslut (teknisk)": "text-ui-secondary",
  Antagande: "text-status-warning",
  Platshållare: "text-status-info",
};

function DesignQuestions({ target }: { target: NoteTarget }) {
  const questions = designQuestions.filter((question) => question.target === target);
  if (questions.length === 0) return null;

  return (
    <div className="max-w-prose space-y-2 border-l-4 border-status-warning bg-bg-fill px-4 py-3 text-sm text-ui-primary">
      <p className="text-label-s">Frågor till designen</p>
      <ul className="list-disc space-y-2 pl-5">
        {questions.map((question) => (
          <li key={question.question}>
            <Inline text={question.question} />
            {question.figma ? (
              <span className="ml-2 font-mono text-xs text-ui-tertiary">
                Figma {question.figma}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Deviations({ target, open }: { target: NoteTarget; open?: boolean }) {
  const notes = figmaNotes.filter((note) => note.target === target);
  if (notes.length === 0) return null;
  const assumptions = notes.filter((note) => note.status === "Antagande").length;

  return (
    <details open={open} className="text-sm">
      <summary className="text-label-s text-ui-secondary">
        Avvikelser och egna beslut ({notes.length}
        {assumptions > 0
          ? `, varav ${assumptions} ${assumptions === 1 ? "antagande" : "antaganden"}`
          : ""}
        )
      </summary>
      <ul className="mt-3 divide-y divide-border-secondary border-y border-border-secondary">
        {notes.map((note) => (
          <li
            key={note.topic}
            className="grid gap-2 py-3 tablet:grid-cols-[12rem_minmax(0,1fr)] tablet:gap-x-6"
          >
            <div>
              <p className="text-ui-primary">
                <Inline text={note.topic} />
              </p>
              <p className={`text-xs ${statusClasses[note.status]}`}>
                {note.status}
                {note.date ? ` · ${note.date}` : ""}
              </p>
            </div>
            <dl className="grid max-w-prose grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1">
              <dt className="text-ui-tertiary">Figma</dt>
              <dd className="text-ui-secondary">
                <Inline text={note.figma} />
              </dd>
              <dt className="text-ui-tertiary">Koden</dt>
              <dd className="text-ui-primary">
                <Inline text={note.code} />
              </dd>
              <dt className="text-ui-tertiary">Varför</dt>
              <dd className="text-ui-secondary">
                <Inline text={note.why} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** The questions and deviations for one kitchensink section or block. */
export function FigmaNotes({ target }: { target: NoteTarget }) {
  return (
    <div className="space-y-4 empty:hidden">
      <DesignQuestions target={target} />
      <Deviations target={target} />
    </div>
  );
}

const hasNotes = (target: NoteTarget) =>
  designQuestions.some((question) => question.target === target) ||
  figmaNotes.some((note) => note.target === target);

/**
 * /kitchensink/notes: what the statuses mean, the notes for the whole site, then every section's
 * questions and deviations under a link to the section, page by page.
 */
export function AllFigmaNotes() {
  return (
    <div className="space-y-(--spacing-3xl)">
      <section aria-labelledby="general" className="space-y-(--spacing-md)">
        <h2
          id="general"
          className="border-b-2 border-border-secondary pb-(--spacing-2xs) text-display-s text-ui-primary"
        >
          Hela sajten
        </h2>
        <p className="max-w-prose text-sm text-ui-secondary">
          Status <strong className="text-ui-primary">Beslut</strong> är bestämt tillsammans,{" "}
          <strong className="text-status-warning">Antagande</strong> är vår tolkning att bekräfta
          och <strong className="text-status-info">Platshållare</strong> är tillfälligt.
        </p>
        <DesignQuestions target="general" />
        <Deviations target="general" open />
      </section>
      {kitchensinkPages
        .filter((page) => page.groups.length > 0)
        .map((page) => (
          <section
            key={page.href}
            aria-labelledby={`notes-${page.title}`}
            className="space-y-(--spacing-xl)"
          >
            <h2
              id={`notes-${page.title}`}
              className="border-b-2 border-border-secondary pb-(--spacing-2xs) text-display-s text-ui-primary"
            >
              {page.title}
            </h2>
            {page.groups.flatMap((group) =>
              group.sections
                .filter((section) => hasNotes(section.id))
                .map((section) => (
                  <div key={section.id} className="space-y-(--spacing-xs)">
                    <h3 className="text-display-xs text-ui-primary">
                      <Link href={sectionHref(section.id)} className="hover:underline">
                        {section.title} →
                      </Link>
                    </h3>
                    <FigmaNotes target={section.id} />
                  </div>
                )),
            )}
          </section>
        ))}
    </div>
  );
}
