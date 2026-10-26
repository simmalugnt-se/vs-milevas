import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_settings_financing_methods" RENAME COLUMN "monthly_factor" TO "monthly_percent";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" RENAME COLUMN "monthly_factor" TO "monthly_percent";
  -- A factor of 0.01875 is 1.875 % of the total price a month.
  UPDATE "configurator_settings_financing_methods" SET "monthly_percent" = "monthly_percent" * 100;
  UPDATE "_configurator_settings_v_version_financing_methods" SET "monthly_percent" = "monthly_percent" * 100;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_settings_financing_methods" RENAME COLUMN "monthly_percent" TO "monthly_factor";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" RENAME COLUMN "monthly_percent" TO "monthly_factor";
  UPDATE "configurator_settings_financing_methods" SET "monthly_factor" = "monthly_factor" / 100;
  UPDATE "_configurator_settings_v_version_financing_methods" SET "monthly_factor" = "monthly_factor" / 100;`);
}
