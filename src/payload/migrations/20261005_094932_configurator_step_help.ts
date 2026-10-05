import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * An optional help note per configurator step (`TruckFamilies.steps.help`). The configurator block's
 * `heading` and `intro` go too, but blocks are stored as JSON, so they need no migration.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_cfg_steps_locales" ADD COLUMN "help" varchar;
  ALTER TABLE "_truck_cfg_steps_v_locales" ADD COLUMN "help" varchar;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_cfg_steps_locales" DROP COLUMN "help";
  ALTER TABLE "_truck_cfg_steps_v_locales" DROP COLUMN "help";`);
}
