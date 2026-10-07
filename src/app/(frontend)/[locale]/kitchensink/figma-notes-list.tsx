import { Fragment } from "react";
import {
  type BlockTarget,
  designQuestions,
  figmaNotes,
  type NoteStatus,
  type NoteTarget,
} from "./figma-notes";

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

/** Where each block's notes are on /kitchensink/blocks. */
const blockLinks: Record<BlockTarget, { title: string; href: string }> = {
  hero: { title: "Milevas Hero", href: "/kitchensink/blocks#hero" },
  navigation: { title: "Navigation", href: "/kitchensink/blocks#navigation" },
  "product-grid": { title: "Product-Grid", href: "/kitchensink/blocks#product-grid" },
  "text-grid": { title: "Text+Grid", href: "/kitchensink/blocks#text-grid" },
  "text-boxinfo": { title: "Text & boxinfo", href: "/kitchensink/blocks#text-boxinfo" },
  configurator: { title: "Configurator", href: "/kitchensink/blocks#configurator-01" },
  footer: { title: "Footer", href: "/kitchensink/blocks#footer" },
};

/**
 * The top of /kitchensink: questions and notes for the whole site, then where the questions about
 * a component or block are. `sectionTitle` names a /kitchensink section.
 */
export function GeneralFigmaNotes({ sectionTitle }: { sectionTitle: (id: string) => string }) {
  const counts = new Map<NoteTarget, number>();
  for (const question of designQuestions) {
    if (question.target !== "general") {
      counts.set(question.target, (counts.get(question.target) ?? 0) + 1);
    }
  }

  return (
    <section aria-labelledby="figma-notes" className="space-y-4">
      <h2 id="figma-notes" className="text-display-s text-ui-primary">
        Frågor och avvikelser
      </h2>
      <p className="max-w-prose text-sm text-ui-secondary">
        Där koden avviker från Figma eller fyller i något Figma inte säger står det vid komponenten
        eller blocket, med status <strong className="text-ui-primary">Beslut</strong> (bestämt
        tillsammans), <strong className="text-status-warning">Antagande</strong> (vår tolkning, att
        bekräfta) eller <strong className="text-status-info">Platshållare</strong> (tillfälligt).
        Här står det som gäller hela sajten.
      </p>
      <DesignQuestions target="general" />
      <div className="max-w-prose space-y-2 text-sm">
        <p className="text-label-s text-ui-primary">Frågor vid komponenter och block</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {[...counts].map(([target, count]) => {
            const block = blockLinks[target as BlockTarget];
            return (
              <li key={target}>
                <a
                  href={block ? block.href : `#${target}`}
                  className="text-ui-secondary underline hover:text-ui-primary"
                >
                  {block ? block.title : sectionTitle(target)} ({count})
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <Deviations target="general" open />
    </section>
  );
}
