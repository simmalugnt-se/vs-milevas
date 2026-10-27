import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Batteries, masts and extras get "Visas för" (`available_for`). The hero's, Text och logotypers
 * and Text och inforutas headings become rich text with colored parts: the white heading and the
 * yellow `highlight` are one field, the yellow kept as the text's color. Pages and their versions
 * keep blocks as JSON, so each block is rewritten there, per language. Self-contained, so later
 * changes to the site's code do not change what it does.
 */

type Run = { text: string; color?: "yellow" };
type Block = Record<string, unknown> & { blockType?: string };
type Localized = Record<string, unknown>;

/** Hero and inforuta: a line per line; Text och logotyper: one line, the yellow part last. */
const LINES = { milevasHero: true, textBoxinfo: true, textColumns: false } as const;
type HeadingBlock = keyof typeof LINES;
const isHeadingBlock = (type: unknown): type is HeadingBlock =>
  typeof type === "string" && type in LINES;

const textNode = ({ text, color }: Run) => ({
  type: "text",
  text,
  format: 0,
  style: "",
  mode: "normal",
  detail: 0,
  version: 1,
  ...(color ? { $: { color } } : {}),
});

const richText = (lines: Run[][]) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: null,
    children: lines.map((runs) => ({
      type: "paragraph",
      format: "",
      indent: 0,
      version: 1,
      direction: null,
      textFormat: 0,
      textStyle: "",
      children: runs.map(textNode),
    })),
  },
});

const split = (text: unknown) =>
  typeof text === "string"
    ? text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

function toRichText(type: HeadingBlock, heading: unknown, highlight: unknown) {
  const white = split(heading);
  const yellow = split(highlight);
  if (LINES[type]) {
    return richText([
      ...white.map((text) => [{ text }]),
      ...yellow.map((text) => [{ text, color: "yellow" as const }]),
    ]);
  }
  const runs: Run[] = [];
  if (white.length) runs.push({ text: white.join(" ") + (yellow.length ? " " : "") });
  if (yellow.length) runs.push({ text: yellow.join(" "), color: "yellow" });
  return richText([runs]);
}

type LexicalNode = { text?: unknown; children?: LexicalNode[]; $?: { color?: unknown } };

/** Back: the white text as the heading, the yellow as the highlight, a line per paragraph. */
function fromRichText(type: HeadingBlock, value: unknown) {
  const white: string[] = [];
  const yellow: string[] = [];
  for (const paragraph of (value as { root?: LexicalNode } | null)?.root?.children ?? []) {
    const runs = (paragraph.children ?? []).filter((node) => typeof node.text === "string");
    const plain = runs.filter((node) => node.$?.color !== "yellow").map((node) => node.text);
    const colored = runs.filter((node) => node.$?.color === "yellow").map((node) => node.text);
    if (plain.join("").trim()) white.push(plain.join("").trim());
    if (colored.join("").trim()) yellow.push(colored.join("").trim());
  }
  const join = LINES[type] ? "\n" : " ";
  return { heading: white.join(join), highlight: yellow.join(join) || undefined };
}

const perLocale = (value: unknown, each: (locale: string) => unknown): Localized | unknown => {
  if (!value || typeof value !== "object" || "root" in value) return value;
  return Object.fromEntries(Object.keys(value).map((locale) => [locale, each(locale)]));
};

function upBlock(block: Block): Block {
  if (!isHeadingBlock(block.blockType)) return block;
  const type = block.blockType;
  const { heading, highlight, ...rest } = block as Block & {
    heading?: unknown;
    highlight?: unknown;
  };
  if (typeof heading === "string")
    return { ...rest, heading: toRichText(type, heading, highlight) };
  const headings = (heading ?? {}) as Localized;
  const highlights = (highlight ?? {}) as Localized;
  const locales = [...new Set([...Object.keys(headings), ...Object.keys(highlights)])];
  return {
    ...rest,
    heading: Object.fromEntries(
      locales.map((locale) => [locale, toRichText(type, headings[locale], highlights[locale])]),
    ),
  };
}

function downBlock(block: Block): Block {
  if (!isHeadingBlock(block.blockType)) return block;
  const type = block.blockType;
  const value = block.heading;
  if (value && typeof value === "object" && "root" in value) {
    const back = fromRichText(type, value);
    return { ...block, heading: back.heading, highlight: back.highlight };
  }
  const locales = Object.keys((value ?? {}) as Localized);
  const back = (locale: string) => fromRichText(type, (value as Localized)[locale]);
  const highlights = locales.flatMap((locale) => {
    const highlight = back(locale).highlight;
    return highlight ? [[locale, highlight]] : [];
  });
  return {
    ...block,
    heading: perLocale(value, (locale) => back(locale).heading),
    // A block without a yellow part had no highlight at all.
    ...(highlights.length > 0 ? { highlight: Object.fromEntries(highlights) } : {}),
  };
}

async function rewrite(
  db: MigrateUpArgs["db"],
  table: string,
  column: string,
  change: (block: Block) => Block,
) {
  const { rows } = await db.execute(
    sql.raw(
      `SELECT id, ${column} AS layout FROM ${table} WHERE ${column}::text ~ '"(milevasHero|textBoxinfo|textColumns)"'`,
    ),
  );
  for (const row of rows as Array<{ id: string; layout: Block[] | null }>) {
    if (!Array.isArray(row.layout)) continue;
    const layout = JSON.stringify(row.layout.map(change));
    await db.execute(
      sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = ${layout}::jsonb WHERE id = ${row.id}`,
    );
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "truck_batteries" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "truck_lift_heights" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "truck_extras" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "_truck_batteries_v" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "_truck_lift_heights_v" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "_truck_extras_v" ADD COLUMN "available_for" jsonb;`);
  await rewrite(db, "pages", "layout", upBlock);
  await rewrite(db, "_pages_v", "version_layout", upBlock);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await rewrite(db, "pages", "layout", downBlock);
  await rewrite(db, "_pages_v", "version_layout", downBlock);
  await db.execute(sql`
  ALTER TABLE "truck_batteries" DROP COLUMN "available_for";
  ALTER TABLE "truck_lift_heights" DROP COLUMN "available_for";
  ALTER TABLE "truck_extras" DROP COLUMN "available_for";
  ALTER TABLE "_truck_batteries_v" DROP COLUMN "available_for";
  ALTER TABLE "_truck_lift_heights_v" DROP COLUMN "available_for";
  ALTER TABLE "_truck_extras_v" DROP COLUMN "available_for";`);
}
