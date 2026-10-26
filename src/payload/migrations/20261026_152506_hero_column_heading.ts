import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * The hero's columns shared one heading ("Bygg din truck:") written on each; it is now one field on
 * the block, `columnHeading`, taken from the first column. Pages and their versions keep blocks as
 * JSON, so this rewrites each hero block there.
 */
const moveUp = (column: string) =>
  sql.raw(`
  UPDATE ${column.split(".")[0]} SET ${column.split(".")[1]} = (
    SELECT jsonb_agg(
      CASE WHEN block->>'blockType' = 'milevasHero' THEN
        block || jsonb_build_object(
          'columnHeading', COALESCE(block->'columns'->0->'heading', '{"sv": "Bygg din truck:"}'::jsonb),
          'columns', COALESCE(
            (SELECT jsonb_agg(item - 'heading' ORDER BY i) FROM jsonb_array_elements(block->'columns') WITH ORDINALITY AS c(item, i)),
            '[]'::jsonb
          )
        )
      ELSE block END
      ORDER BY n
    )
    FROM jsonb_array_elements(${column.split(".")[1]}) WITH ORDINALITY AS b(block, n)
  )
  WHERE ${column.split(".")[1]}::text LIKE '%"milevasHero"%';
`);

const moveDown = (column: string) =>
  sql.raw(`
  UPDATE ${column.split(".")[0]} SET ${column.split(".")[1]} = (
    SELECT jsonb_agg(
      CASE WHEN block->>'blockType' = 'milevasHero' THEN
        (block - 'columnHeading') || jsonb_build_object(
          'columns', COALESCE(
            (SELECT jsonb_agg(item || jsonb_build_object('heading', block->'columnHeading') ORDER BY i) FROM jsonb_array_elements(block->'columns') WITH ORDINALITY AS c(item, i)),
            '[]'::jsonb
          )
        )
      ELSE block END
      ORDER BY n
    )
    FROM jsonb_array_elements(${column.split(".")[1]}) WITH ORDINALITY AS b(block, n)
  )
  WHERE ${column.split(".")[1]}::text LIKE '%"milevasHero"%';
`);

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(moveUp("pages.layout"));
  await db.execute(moveUp("_pages_v.version_layout"));
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(moveDown("pages.layout"));
  await db.execute(moveDown("_pages_v.version_layout"));
}
