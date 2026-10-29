/**
 * Leasing and long-term rental reckoned as VS Truck does: each monthly way to pay gets a yearly
 * interest, residual values by term and, for a rental, drive hours and insurance; each truck type
 * its service price per drive hour by lift capacity.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "truck_families_service_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_kg" numeric,
  	"max_kg" numeric,
  	"up_to600" numeric,
  	"up_to1200" numeric,
  	"up_to2000" numeric,
  	"up_to3000" numeric,
  	"over3000" numeric
  );
  
  CREATE TABLE "_truck_families_v_version_service_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"min_kg" numeric,
  	"max_kg" numeric,
  	"up_to600" numeric,
  	"up_to1200" numeric,
  	"up_to2000" numeric,
  	"up_to3000" numeric,
  	"over3000" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "configurator_financing_residuals" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_months" numeric,
  	"max_months" numeric,
  	"percent" numeric
  );
  
  CREATE TABLE "_configurator_financing_residuals_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"min_months" numeric,
  	"max_months" numeric,
  	"percent" numeric,
  	"_uuid" varchar
  );
  
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "interest_rate" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "rental" boolean DEFAULT false;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "drive_hours_per_year" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "insurance_percent" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "interest_rate" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "rental" boolean DEFAULT false;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "drive_hours_per_year" numeric;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "insurance_percent" numeric;
  ALTER TABLE "truck_families_service_rates" ADD CONSTRAINT "truck_families_service_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_version_service_rates" ADD CONSTRAINT "_truck_families_v_version_service_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_financing_residuals" ADD CONSTRAINT "configurator_financing_residuals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_financing_residuals_v" ADD CONSTRAINT "_configurator_financing_residuals_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_families_service_rates_order_idx" ON "truck_families_service_rates" USING btree ("_order");
  CREATE INDEX "truck_families_service_rates_parent_id_idx" ON "truck_families_service_rates" USING btree ("_parent_id");
  CREATE INDEX "_truck_families_v_version_service_rates_order_idx" ON "_truck_families_v_version_service_rates" USING btree ("_order");
  CREATE INDEX "_truck_families_v_version_service_rates_parent_id_idx" ON "_truck_families_v_version_service_rates" USING btree ("_parent_id");
  CREATE INDEX "configurator_financing_residuals_order_idx" ON "configurator_financing_residuals" USING btree ("_order");
  CREATE INDEX "configurator_financing_residuals_parent_id_idx" ON "configurator_financing_residuals" USING btree ("_parent_id");
  CREATE INDEX "_configurator_financing_residuals_v_order_idx" ON "_configurator_financing_residuals_v" USING btree ("_order");
  CREATE INDEX "_configurator_financing_residuals_v_parent_id_idx" ON "_configurator_financing_residuals_v" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "truck_families_service_rates" CASCADE;
  DROP TABLE "_truck_families_v_version_service_rates" CASCADE;
  DROP TABLE "configurator_financing_residuals" CASCADE;
  DROP TABLE "_configurator_financing_residuals_v" CASCADE;
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "interest_rate";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "rental";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "drive_hours_per_year";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "insurance_percent";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "interest_rate";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "rental";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "drive_hours_per_year";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "insurance_percent";`)
}
