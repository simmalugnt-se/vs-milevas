/**
 * "Överordnad sida" on pages, and `path`, the page's address under its parents: every page so far
 * is at the top level, so its address is its slug, in the documents and in their versions.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "parent_id" uuid;
  ALTER TABLE "pages" ADD COLUMN "path" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_parent_id" uuid;
  ALTER TABLE "_pages_v" ADD COLUMN "version_path" varchar;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  UPDATE "pages" SET "path" = "slug";
  UPDATE "_pages_v" SET "version_path" = "version_slug";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_parent_id_pages_id_fk";
  DROP INDEX "pages_parent_idx";
  DROP INDEX "pages_path_idx";
  DROP INDEX "_pages_v_version_version_parent_idx";
  DROP INDEX "_pages_v_version_version_path_idx";
  ALTER TABLE "pages" DROP COLUMN "parent_id";
  ALTER TABLE "pages" DROP COLUMN "path";
  ALTER TABLE "_pages_v" DROP COLUMN "version_parent_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_path";`);
}
