/**
 * Long-term rental's service prices move from each truck type (its tab Långtidshyra) to the way to
 * pay itself, in the configurator settings: a row per truck type and lift capacity range, on every
 * way to pay that is a rental. `down` moves the rows of the first rental back to the truck types.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cs_service_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"family_id" uuid,
  	"min_kg" numeric,
  	"max_kg" numeric,
  	"up_to600" numeric,
  	"up_to1200" numeric,
  	"up_to2000" numeric,
  	"up_to3000" numeric,
  	"over3000" numeric
  );
  
  CREATE TABLE "_cs_service_rates_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"family_id" uuid,
  	"min_kg" numeric,
  	"max_kg" numeric,
  	"up_to600" numeric,
  	"up_to1200" numeric,
  	"up_to2000" numeric,
  	"up_to3000" numeric,
  	"over3000" numeric,
  	"_uuid" varchar
  );
  
  -- Each truck type's rows, in the truck types' order, on every way to pay that is a rental, and on
  -- the settings' latest version, which the admin shows.
  INSERT INTO "cs_service_rates" ("_order", "_parent_id", "id", "family_id", "min_kg", "max_kg", "up_to600", "up_to1200", "up_to2000", "up_to3000", "over3000")
    SELECT
      row_number() OVER (PARTITION BY m."id" ORDER BY f."_order", r."_order"),
      m."id", substr(md5(m."id" || r."id"), 1, 24), r."_parent_id", r."min_kg", r."max_kg", r."up_to600", r."up_to1200", r."up_to2000", r."up_to3000", r."over3000"
    FROM "truck_families_service_rates" r
    JOIN "truck_families" f ON f."id" = r."_parent_id"
    CROSS JOIN "configurator_settings_financing_methods" m
    WHERE m."rental";
  INSERT INTO "_cs_service_rates_v" ("_order", "_parent_id", "family_id", "min_kg", "max_kg", "up_to600", "up_to1200", "up_to2000", "up_to3000", "over3000", "_uuid")
    SELECT
      row_number() OVER (PARTITION BY m."id" ORDER BY f."_order", r."_order"),
      m."id", r."_parent_id", r."min_kg", r."max_kg", r."up_to600", r."up_to1200", r."up_to2000", r."up_to3000", r."over3000", substr(md5(m."id"::text || r."id"), 1, 24)
    FROM "truck_families_service_rates" r
    JOIN "truck_families" f ON f."id" = r."_parent_id"
    CROSS JOIN "_configurator_settings_v_version_financing_methods" m
    JOIN "_configurator_settings_v" v ON v."id" = m."_parent_id"
    WHERE m."rental" AND v."latest";

  DROP TABLE "truck_families_service_rates" CASCADE;
  DROP TABLE "_truck_families_v_version_service_rates" CASCADE;
  ALTER TABLE "cs_service_rates" ADD CONSTRAINT "cs_service_rates_family_id_truck_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."truck_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cs_service_rates" ADD CONSTRAINT "cs_service_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_service_rates_v" ADD CONSTRAINT "_cs_service_rates_v_family_id_truck_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."truck_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cs_service_rates_v" ADD CONSTRAINT "_cs_service_rates_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cs_service_rates_order_idx" ON "cs_service_rates" USING btree ("_order");
  CREATE INDEX "cs_service_rates_parent_id_idx" ON "cs_service_rates" USING btree ("_parent_id");
  CREATE INDEX "cs_service_rates_family_idx" ON "cs_service_rates" USING btree ("family_id");
  CREATE INDEX "_cs_service_rates_v_order_idx" ON "_cs_service_rates_v" USING btree ("_order");
  CREATE INDEX "_cs_service_rates_v_parent_id_idx" ON "_cs_service_rates_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_service_rates_v_family_idx" ON "_cs_service_rates_v" USING btree ("family_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
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
  
  -- The first rental's rows back on their truck types, and on each truck type's latest version.
  INSERT INTO "truck_families_service_rates" ("_order", "_parent_id", "id", "min_kg", "max_kg", "up_to600", "up_to1200", "up_to2000", "up_to3000", "over3000")
    SELECT row_number() OVER (PARTITION BY r."family_id" ORDER BY r."_order"), r."family_id", r."id",
      r."min_kg", r."max_kg", r."up_to600", r."up_to1200", r."up_to2000", r."up_to3000", r."over3000"
    FROM "cs_service_rates" r
    WHERE r."family_id" IS NOT NULL AND r."_parent_id" = (
      SELECT "id" FROM "configurator_settings_financing_methods" WHERE "rental" ORDER BY "_order" LIMIT 1
    );
  INSERT INTO "_truck_families_v_version_service_rates" ("_order", "_parent_id", "min_kg", "max_kg", "up_to600", "up_to1200", "up_to2000", "up_to3000", "over3000", "_uuid")
    SELECT row_number() OVER (PARTITION BY v."id" ORDER BY r."_order"), v."id", r."min_kg", r."max_kg", r."up_to600", r."up_to1200", r."up_to2000", r."up_to3000", r."over3000", r."id"
    FROM "cs_service_rates" r
    JOIN "_truck_families_v" v ON v."parent_id" = r."family_id" AND v."latest"
    WHERE r."_parent_id" = (
      SELECT "id" FROM "configurator_settings_financing_methods" WHERE "rental" ORDER BY "_order" LIMIT 1
    );

  DROP TABLE "cs_service_rates" CASCADE;
  DROP TABLE "_cs_service_rates_v" CASCADE;
  ALTER TABLE "truck_families_service_rates" ADD CONSTRAINT "truck_families_service_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_version_service_rates" ADD CONSTRAINT "_truck_families_v_version_service_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_families_service_rates_order_idx" ON "truck_families_service_rates" USING btree ("_order");
  CREATE INDEX "truck_families_service_rates_parent_id_idx" ON "truck_families_service_rates" USING btree ("_parent_id");
  CREATE INDEX "_truck_families_v_version_service_rates_order_idx" ON "_truck_families_v_version_service_rates" USING btree ("_order");
  CREATE INDEX "_truck_families_v_version_service_rates_parent_id_idx" ON "_truck_families_v_version_service_rates" USING btree ("_parent_id");`);
}
