import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_families" DROP COLUMN "configurable";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_configurable";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_families" ADD COLUMN "configurable" boolean DEFAULT true;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_configurable" boolean DEFAULT true;`);
}
