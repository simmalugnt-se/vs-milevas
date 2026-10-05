import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/** The Navigation's button (Header `cta`) and the Footer's mail address (`email`). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_cta_type" AS ENUM('internal', 'external');
  ALTER TABLE "header" ADD COLUMN "cta_type" "enum_header_cta_type" DEFAULT 'internal';
  ALTER TABLE "header" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "header" ADD COLUMN "cta_new_tab" boolean;
  ALTER TABLE "header_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_type" "enum__header_v_version_cta_type" DEFAULT 'internal';
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_url" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_new_tab" boolean;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_cta_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "email" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_email" varchar;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP COLUMN "cta_type";
  ALTER TABLE "header" DROP COLUMN "cta_url";
  ALTER TABLE "header" DROP COLUMN "cta_new_tab";
  ALTER TABLE "header_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_type";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_url";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_new_tab";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_cta_label";
  ALTER TABLE "footer" DROP COLUMN "email";
  ALTER TABLE "_footer_v" DROP COLUMN "version_email";
  DROP TYPE "public"."enum_header_cta_type";
  DROP TYPE "public"."enum__header_v_version_cta_type";`);
}
