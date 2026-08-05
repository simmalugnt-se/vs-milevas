/**
 * Migration Template: Localizing an Existing Field
 *
 * This template shows how to migrate a field from non-localized to localized
 * while preserving existing data.
 *
 * Steps:
 * 1. Generate migration: pnpm payload migrate:create your-migration-name
 * 2. Copy the generated schema changes
 * 3. Add data migration steps BEFORE dropping columns
 * 4. Test on development database
 */

import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ============================================
  // STEP 1: Create locales tables (from generated migration)
  // ============================================
  await db.execute(sql`
    CREATE TABLE "pages_blocks_text_and_media_locales" (
      "text" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    CREATE TABLE "_pages_v_blocks_text_and_media_locales" (
      "text" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    ALTER TABLE "pages_blocks_text_and_media_locales"
      ADD CONSTRAINT "pages_blocks_text_and_media_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id")
      REFERENCES "public"."pages_blocks_text_and_media"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_pages_v_blocks_text_and_media_locales"
      ADD CONSTRAINT "_pages_v_blocks_text_and_media_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id")
      REFERENCES "public"."_pages_v_blocks_text_and_media"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "pages_blocks_text_and_media_locales_locale_parent_id_unique"
      ON "pages_blocks_text_and_media_locales" USING btree ("_locale","_parent_id");

    CREATE UNIQUE INDEX "_pages_v_blocks_text_and_media_locales_locale_parent_id_uniq"
      ON "_pages_v_blocks_text_and_media_locales" USING btree ("_locale","_parent_id");
  `);

  // ============================================
  // STEP 2: MIGRATE EXISTING DATA
  // Copy existing values to locales table with default locale ('en')
  // ============================================

  // Migrate main table data
  await db.execute(sql`
    INSERT INTO "pages_blocks_text_and_media_locales" ("text", "_locale", "_parent_id")
    SELECT "text", 'en'::_locales, "id"
    FROM "pages_blocks_text_and_media"
    WHERE "text" IS NOT NULL;
  `);

  // Migrate version table data (if you have drafts/versions)
  await db.execute(sql`
    INSERT INTO "_pages_v_blocks_text_and_media_locales" ("text", "_locale", "_parent_id")
    SELECT "text", 'en'::_locales, "id"
    FROM "_pages_v_blocks_text_and_media"
    WHERE "text" IS NOT NULL;
  `);

  // ============================================
  // STEP 3: Drop columns (data is now safely in locales tables)
  // ============================================
  await db.execute(sql`
    ALTER TABLE "pages_blocks_text_and_media" DROP COLUMN "text";
    ALTER TABLE "_pages_v_blocks_text_and_media" DROP COLUMN "text";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse the migration
  await db.execute(sql`
    -- Re-add columns
    ALTER TABLE "pages_blocks_text_and_media" ADD COLUMN "text" varchar;
    ALTER TABLE "_pages_v_blocks_text_and_media" ADD COLUMN "text" varchar;

    -- Migrate data back from locales table
    UPDATE "pages_blocks_text_and_media" t
    SET "text" = l."text"
    FROM "pages_blocks_text_and_media_locales" l
    WHERE t."id" = l."_parent_id" AND l."_locale" = 'en'::_locales;

    UPDATE "_pages_v_blocks_text_and_media" t
    SET "text" = l."text"
    FROM "_pages_v_blocks_text_and_media_locales" l
    WHERE t."id" = l."_parent_id" AND l."_locale" = 'en'::_locales;

    -- Drop locales tables
    DROP TABLE "pages_blocks_text_and_media_locales" CASCADE;
    DROP TABLE "_pages_v_blocks_text_and_media_locales" CASCADE;
  `);
}
