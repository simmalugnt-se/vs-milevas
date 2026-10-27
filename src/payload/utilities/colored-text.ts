/**
 * Headings with colored parts ("Bygg din baoli" white, "På typ 30 sekunder" yellow): a small rich
 * text field (`coloredHeadingField`) where editors select text and pick a color, which Lexical
 * keeps as the text's state (`$: { color: "yellow" }`, `TextStateFeature`). The site reads it as
 * lines of runs: each paragraph is a line, each text a run with its color.
 */
export const HEADING_COLORS = {
  yellow: {
    label: "Gul",
    /** The site's class: Tejp on Dark, as Figma's yellow headings. */
    className: "text-ui-brand",
    /** How Admin shows it, readable on Admin's light and dark theme. */
    adminCss: { "background-color": "#E0FF3C", color: "#111111" },
  },
} as const;

export type HeadingColor = keyof typeof HEADING_COLORS;

export type ColoredRun = { text: string; color?: HeadingColor };

type LexicalNode = {
  type?: string;
  text?: unknown;
  children?: LexicalNode[];
  $?: { color?: unknown };
};

const isColor = (value: unknown): value is HeadingColor =>
  typeof value === "string" && value in HEADING_COLORS;

/** The heading's lines, each a list of runs; a line break starts a new line too. Empty lines go. */
export function coloredLines(value: unknown): ColoredRun[][] {
  const root = (value as { root?: LexicalNode } | null | undefined)?.root;
  const lines: ColoredRun[][] = [];
  for (const block of root?.children ?? []) {
    let line: ColoredRun[] = [];
    const walk = (node: LexicalNode) => {
      if (node.type === "linebreak") {
        lines.push(line);
        line = [];
        return;
      }
      if (typeof node.text === "string" && node.text) {
        const color = node.$?.color;
        line.push(isColor(color) ? { text: node.text, color } : { text: node.text });
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(block);
    lines.push(line);
  }
  return lines.filter((runs) => runs.some((run) => run.text.trim()));
}

/** The heading as plain text, lines joined by a space: for labels, titles and checks. */
export function coloredPlainText(value: unknown): string {
  return coloredLines(value)
    .map((runs) => runs.map((run) => run.text).join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const textNode = ({ text, color }: ColoredRun) => ({
  type: "text",
  text,
  format: 0,
  style: "",
  mode: "normal",
  detail: 0,
  version: 1,
  ...(color ? { $: { color } } : {}),
});

/** A heading's rich text from lines of runs, for seeds and the kitchensink. */
export function coloredHeading(lines: ColoredRun[][]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: null,
      children: lines.map((runs) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: null,
        textFormat: 0,
        textStyle: "",
        children: runs.map(textNode),
      })),
    },
  };
}
