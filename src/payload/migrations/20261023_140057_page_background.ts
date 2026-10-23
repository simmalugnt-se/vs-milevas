import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_background" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__pages_v_version_background" AS ENUM('dark', 'light');
  ALTER TABLE "pages" ADD COLUMN "background" "enum_pages_background" DEFAULT 'dark';
  ALTER TABLE "_pages_v" ADD COLUMN "version_background" "enum__pages_v_version_background" DEFAULT 'dark';`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "background";
  ALTER TABLE "_pages_v" DROP COLUMN "version_background";
  DROP TYPE "public"."enum_pages_background";
  DROP TYPE "public"."enum__pages_v_version_background";`);
}
