import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_lift_heights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_lift_heights_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_lift_heights_locales" CASCADE;
  DROP TABLE "_truck_lift_heights_v_locales" CASCADE;
  ALTER TABLE "truck_lift_heights" ALTER COLUMN "build_height" SET DATA TYPE numeric USING NULLIF(regexp_replace("build_height", '[^0-9.]', '', 'g'), '')::numeric;
  ALTER TABLE "_truck_lift_heights_v" ALTER COLUMN "build_height" SET DATA TYPE numeric USING NULLIF(regexp_replace("build_height", '[^0-9.]', '', 'g'), '')::numeric;
  ALTER TABLE "truck_models_locales" ADD COLUMN "weight" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "turning_radius" varchar;
  ALTER TABLE "truck_batteries_locales" ADD COLUMN "capacity" varchar;
  ALTER TABLE "truck_lift_heights" ADD COLUMN "lift_height" numeric;
  ALTER TABLE "truck_families_locales" ADD COLUMN "travel_speed" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "weight" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "turning_radius" varchar;
  ALTER TABLE "_truck_batteries_v_locales" ADD COLUMN "capacity" varchar;
  ALTER TABLE "_truck_lift_heights_v" ADD COLUMN "lift_height" numeric;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_travel_speed" varchar;
  ALTER TABLE "truck_models_locales" DROP COLUMN "label";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_battery";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_turning_radius";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_travel_speed";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_battery_capacity";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_weight";
  ALTER TABLE "truck_models_locales" DROP COLUMN "specs_build_height";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_battery";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_turning_radius";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_travel_speed";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_battery_capacity";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_weight";
  ALTER TABLE "truck_families_locales" DROP COLUMN "specs_build_height";
  ALTER TABLE "truck_families_locales" DROP COLUMN "model_choice_label";
  ALTER TABLE "truck_families_locales" DROP COLUMN "model_choice_heading";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "label";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_battery";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_turning_radius";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_travel_speed";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_battery_capacity";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_weight";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "specs_build_height";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_battery";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_turning_radius";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_travel_speed";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_battery_capacity";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_weight";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_specs_build_height";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_model_choice_label";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_model_choice_heading";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "truck_lift_heights_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_lift_heights_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_lift_heights" ALTER COLUMN "build_height" SET DATA TYPE varchar;
  ALTER TABLE "_truck_lift_heights_v" ALTER COLUMN "build_height" SET DATA TYPE varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "label" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_battery" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_turning_radius" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_travel_speed" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_battery_capacity" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_weight" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "specs_build_height" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_battery" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_turning_radius" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_travel_speed" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_battery_capacity" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_weight" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "specs_build_height" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "model_choice_label" varchar DEFAULT 'Modell';
  ALTER TABLE "truck_families_locales" ADD COLUMN "model_choice_heading" varchar DEFAULT 'Välj modell';
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "label" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_battery" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_turning_radius" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_travel_speed" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_battery_capacity" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_weight" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "specs_build_height" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_battery" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_turning_radius" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_travel_speed" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_battery_capacity" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_weight" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_specs_build_height" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_model_choice_label" varchar DEFAULT 'Modell';
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_model_choice_heading" varchar DEFAULT 'Välj modell';
  ALTER TABLE "truck_lift_heights_locales" ADD CONSTRAINT "truck_lift_heights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_lift_heights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v_locales" ADD CONSTRAINT "_truck_lift_heights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_lift_heights_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "truck_lift_heights_locales_locale_parent_id_unique" ON "truck_lift_heights_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_truck_lift_heights_v_locales_locale_parent_id_unique" ON "_truck_lift_heights_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_models_locales" DROP COLUMN "weight";
  ALTER TABLE "truck_models_locales" DROP COLUMN "turning_radius";
  ALTER TABLE "truck_batteries_locales" DROP COLUMN "capacity";
  ALTER TABLE "truck_lift_heights" DROP COLUMN "lift_height";
  ALTER TABLE "truck_families_locales" DROP COLUMN "travel_speed";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "weight";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "turning_radius";
  ALTER TABLE "_truck_batteries_v_locales" DROP COLUMN "capacity";
  ALTER TABLE "_truck_lift_heights_v" DROP COLUMN "lift_height";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_travel_speed";`);
}
