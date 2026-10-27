import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * A monthly way to pay gets a range of terms (Figma's slider, 24 to 84 months a year apart) and,
 * for leasing, a residual value, instead of a fixed percentage per month. Leasing's residual is
 * what its percentage left over its term (1,875 % × 48 = 90 %, so 10 %), which keeps its price at
 * the default term; a rental has none, so its price is the total over the months.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "min_months" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "max_months" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "months_step" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "residual_percent" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "min_months" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "max_months" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "months_step" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "residual_percent" numeric;
  UPDATE "configurator_settings_financing_methods" SET "min_months" = 24, "max_months" = 84, "months_step" = 12,
    "residual_percent" = CASE WHEN "key" = 'leasing'
      THEN NULLIF(GREATEST(0, ROUND(100 - "monthly_percent" * "months", 2)), 0) END
    WHERE "kind" = 'monthly';
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "monthly_percent";
  UPDATE "_configurator_settings_v_version_financing_methods" SET "min_months" = 24, "max_months" = 84, "months_step" = 12,
    "residual_percent" = CASE WHEN "key" = 'leasing'
      THEN NULLIF(GREATEST(0, ROUND(100 - "monthly_percent" * "months", 2)), 0) END
    WHERE "kind" = 'monthly';
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "monthly_percent";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "monthly_percent" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "monthly_percent" numeric;
  UPDATE "configurator_settings_financing_methods" SET "monthly_percent" = ROUND((100 - COALESCE("residual_percent", 0)) / "months", 5)
    WHERE "kind" = 'monthly' AND "months" > 0;
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "min_months";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "max_months";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "months_step";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "residual_percent";
  UPDATE "_configurator_settings_v_version_financing_methods" SET "monthly_percent" = ROUND((100 - COALESCE("residual_percent", 0)) / "months", 5)
    WHERE "kind" = 'monthly' AND "months" > 0;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "min_months";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "max_months";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "months_step";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "residual_percent";`)
}
