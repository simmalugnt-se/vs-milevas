import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "truck_batteries" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false
  );
  
  CREATE TABLE "truck_batteries_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_lift_heights" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"build_height" varchar,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false
  );
  
  CREATE TABLE "truck_lift_heights_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid,
  	"price" numeric DEFAULT 0
  );
  
  CREATE TABLE "truck_extras_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_batteries_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_batteries_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_lift_heights_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"build_height" varchar,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_lift_heights_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_extras_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"price" numeric DEFAULT 0,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extras_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_fam_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_fam_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_choices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_choices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_families_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_fam_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_fam_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_options_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_options_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_choices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_choices_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_families_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_specs_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_fam_specs" CASCADE;
  DROP TABLE "truck_fam_specs_locales" CASCADE;
  DROP TABLE "truck_model_specs" CASCADE;
  DROP TABLE "truck_model_specs_locales" CASCADE;
  DROP TABLE "truck_option_specs" CASCADE;
  DROP TABLE "truck_option_specs_locales" CASCADE;
  DROP TABLE "truck_options" CASCADE;
  DROP TABLE "truck_options_locales" CASCADE;
  DROP TABLE "truck_choices" CASCADE;
  DROP TABLE "truck_choices_locales" CASCADE;
  DROP TABLE "truck_families_texts" CASCADE;
  DROP TABLE "_truck_fam_specs_v" CASCADE;
  DROP TABLE "_truck_fam_specs_v_locales" CASCADE;
  DROP TABLE "_truck_model_specs_v" CASCADE;
  DROP TABLE "_truck_model_specs_v_locales" CASCADE;
  DROP TABLE "_truck_option_specs_v" CASCADE;
  DROP TABLE "_truck_option_specs_v_locales" CASCADE;
  DROP TABLE "_truck_options_v" CASCADE;
  DROP TABLE "_truck_options_v_locales" CASCADE;
  DROP TABLE "_truck_choices_v" CASCADE;
  DROP TABLE "_truck_choices_v_locales" CASCADE;
  DROP TABLE "_truck_families_v_texts" CASCADE;
  DROP TABLE "truck_specs" CASCADE;
  DROP TABLE "truck_specs_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_truck_specs_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_truck_specs_id_idx";
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
  ALTER TABLE "truck_families_locales" ADD COLUMN "lift_height_help" varchar;
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
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_lift_height_help" varchar;
  ALTER TABLE "truck_batteries" ADD CONSTRAINT "truck_batteries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_batteries_locales" ADD CONSTRAINT "truck_batteries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_batteries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_lift_heights" ADD CONSTRAINT "truck_lift_heights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_lift_heights_locales" ADD CONSTRAINT "truck_lift_heights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_lift_heights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extras" ADD CONSTRAINT "truck_extras_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_extras" ADD CONSTRAINT "truck_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extras_locales" ADD CONSTRAINT "truck_extras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v" ADD CONSTRAINT "_truck_batteries_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v_locales" ADD CONSTRAINT "_truck_batteries_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_batteries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v" ADD CONSTRAINT "_truck_lift_heights_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v_locales" ADD CONSTRAINT "_truck_lift_heights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_lift_heights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extras_v" ADD CONSTRAINT "_truck_extras_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_extras_v" ADD CONSTRAINT "_truck_extras_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extras_v_locales" ADD CONSTRAINT "_truck_extras_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extras_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_batteries_order_idx" ON "truck_batteries" USING btree ("_order");
  CREATE INDEX "truck_batteries_parent_id_idx" ON "truck_batteries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_batteries_locales_locale_parent_id_unique" ON "truck_batteries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_lift_heights_order_idx" ON "truck_lift_heights" USING btree ("_order");
  CREATE INDEX "truck_lift_heights_parent_id_idx" ON "truck_lift_heights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_lift_heights_locales_locale_parent_id_unique" ON "truck_lift_heights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_extras_order_idx" ON "truck_extras" USING btree ("_order");
  CREATE INDEX "truck_extras_parent_id_idx" ON "truck_extras" USING btree ("_parent_id");
  CREATE INDEX "truck_extras_image_idx" ON "truck_extras" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_extras_locales_locale_parent_id_unique" ON "truck_extras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_batteries_v_order_idx" ON "_truck_batteries_v" USING btree ("_order");
  CREATE INDEX "_truck_batteries_v_parent_id_idx" ON "_truck_batteries_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_batteries_v_locales_locale_parent_id_unique" ON "_truck_batteries_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_lift_heights_v_order_idx" ON "_truck_lift_heights_v" USING btree ("_order");
  CREATE INDEX "_truck_lift_heights_v_parent_id_idx" ON "_truck_lift_heights_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_lift_heights_v_locales_locale_parent_id_unique" ON "_truck_lift_heights_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_extras_v_order_idx" ON "_truck_extras_v" USING btree ("_order");
  CREATE INDEX "_truck_extras_v_parent_id_idx" ON "_truck_extras_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_extras_v_image_idx" ON "_truck_extras_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_extras_v_locales_locale_parent_id_unique" ON "_truck_extras_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_models" DROP COLUMN "key";
  ALTER TABLE "truck_models_locales" DROP COLUMN "description";
  ALTER TABLE "_truck_models_v" DROP COLUMN "key";
  ALTER TABLE "_truck_models_v_locales" DROP COLUMN "description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "truck_specs_id";
  DROP TYPE "public"."enum_truck_choices_selection_mode";
  DROP TYPE "public"."enum_truck_choices_display";
  DROP TYPE "public"."enum__truck_choices_v_selection_mode";
  DROP TYPE "public"."enum__truck_choices_v_display";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_choices_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum_truck_choices_display" AS ENUM('grid', 'stack', 'images', 'imageRows', 'prices');
  CREATE TYPE "public"."enum__truck_choices_v_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum__truck_choices_v_display" AS ENUM('grid', 'stack', 'images', 'imageRows', 'prices');
  CREATE TABLE "truck_fam_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"spec_id" uuid
  );
  
  CREATE TABLE "truck_fam_specs_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_model_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"spec_id" uuid
  );
  
  CREATE TABLE "truck_model_specs_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_option_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"spec_id" uuid
  );
  
  CREATE TABLE "truck_option_specs_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"image_id" uuid,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"sku" varchar
  );
  
  CREATE TABLE "truck_options_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"selection_mode" "enum_truck_choices_selection_mode" DEFAULT 'single',
  	"required" boolean DEFAULT true,
  	"display" "enum_truck_choices_display"
  );
  
  CREATE TABLE "truck_choices_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_families_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_truck_fam_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"spec_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_fam_specs_v_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_model_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"spec_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_specs_v_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_option_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"spec_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_option_specs_v_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_options_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"image_id" uuid,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"sku" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_options_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_choices_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"selection_mode" "enum__truck_choices_v_selection_mode" DEFAULT 'single',
  	"required" boolean DEFAULT true,
  	"display" "enum__truck_choices_v_display",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_choices_v_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_families_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "truck_specs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"unit" varchar,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"on_card" boolean DEFAULT false,
  	"in_quote" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "truck_specs_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_batteries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_batteries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_lift_heights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_lift_heights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extras" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extras_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_batteries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_batteries_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_lift_heights_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_lift_heights_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extras_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extras_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_batteries" CASCADE;
  DROP TABLE "truck_batteries_locales" CASCADE;
  DROP TABLE "truck_lift_heights" CASCADE;
  DROP TABLE "truck_lift_heights_locales" CASCADE;
  DROP TABLE "truck_extras" CASCADE;
  DROP TABLE "truck_extras_locales" CASCADE;
  DROP TABLE "_truck_batteries_v" CASCADE;
  DROP TABLE "_truck_batteries_v_locales" CASCADE;
  DROP TABLE "_truck_lift_heights_v" CASCADE;
  DROP TABLE "_truck_lift_heights_v_locales" CASCADE;
  DROP TABLE "_truck_extras_v" CASCADE;
  DROP TABLE "_truck_extras_v_locales" CASCADE;
  ALTER TABLE "truck_models" ADD COLUMN "key" varchar;
  ALTER TABLE "truck_models_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "_truck_models_v" ADD COLUMN "key" varchar;
  ALTER TABLE "_truck_models_v_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "truck_specs_id" uuid;
  ALTER TABLE "truck_fam_specs" ADD CONSTRAINT "truck_fam_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_fam_specs" ADD CONSTRAINT "truck_fam_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_fam_specs_locales" ADD CONSTRAINT "truck_fam_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_fam_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs" ADD CONSTRAINT "truck_model_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_model_specs" ADD CONSTRAINT "truck_model_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs_locales" ADD CONSTRAINT "truck_model_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs" ADD CONSTRAINT "truck_option_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_option_specs" ADD CONSTRAINT "truck_option_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs_locales" ADD CONSTRAINT "truck_option_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_option_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_options" ADD CONSTRAINT "truck_options_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_options" ADD CONSTRAINT "truck_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_choices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_options_locales" ADD CONSTRAINT "truck_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_choices" ADD CONSTRAINT "truck_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_choices_locales" ADD CONSTRAINT "truck_choices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_choices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_families_texts" ADD CONSTRAINT "truck_families_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v" ADD CONSTRAINT "_truck_fam_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v" ADD CONSTRAINT "_truck_fam_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v_locales" ADD CONSTRAINT "_truck_fam_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_fam_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v" ADD CONSTRAINT "_truck_model_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v" ADD CONSTRAINT "_truck_model_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v_locales" ADD CONSTRAINT "_truck_model_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v" ADD CONSTRAINT "_truck_option_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v" ADD CONSTRAINT "_truck_option_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v_locales" ADD CONSTRAINT "_truck_option_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_option_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_options_v" ADD CONSTRAINT "_truck_options_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_options_v" ADD CONSTRAINT "_truck_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_choices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_options_v_locales" ADD CONSTRAINT "_truck_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_choices_v" ADD CONSTRAINT "_truck_choices_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_choices_v_locales" ADD CONSTRAINT "_truck_choices_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_choices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_texts" ADD CONSTRAINT "_truck_families_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_specs_locales" ADD CONSTRAINT "truck_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_specs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_fam_specs_order_idx" ON "truck_fam_specs" USING btree ("_order");
  CREATE INDEX "truck_fam_specs_parent_id_idx" ON "truck_fam_specs" USING btree ("_parent_id");
  CREATE INDEX "truck_fam_specs_spec_idx" ON "truck_fam_specs" USING btree ("spec_id");
  CREATE UNIQUE INDEX "truck_fam_specs_locales_locale_parent_id_unique" ON "truck_fam_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_model_specs_order_idx" ON "truck_model_specs" USING btree ("_order");
  CREATE INDEX "truck_model_specs_parent_id_idx" ON "truck_model_specs" USING btree ("_parent_id");
  CREATE INDEX "truck_model_specs_spec_idx" ON "truck_model_specs" USING btree ("spec_id");
  CREATE UNIQUE INDEX "truck_model_specs_locales_locale_parent_id_unique" ON "truck_model_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_option_specs_order_idx" ON "truck_option_specs" USING btree ("_order");
  CREATE INDEX "truck_option_specs_parent_id_idx" ON "truck_option_specs" USING btree ("_parent_id");
  CREATE INDEX "truck_option_specs_spec_idx" ON "truck_option_specs" USING btree ("spec_id");
  CREATE UNIQUE INDEX "truck_option_specs_locales_locale_parent_id_unique" ON "truck_option_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_options_order_idx" ON "truck_options" USING btree ("_order");
  CREATE INDEX "truck_options_parent_id_idx" ON "truck_options" USING btree ("_parent_id");
  CREATE INDEX "truck_options_image_idx" ON "truck_options" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_options_locales_locale_parent_id_unique" ON "truck_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_choices_order_idx" ON "truck_choices" USING btree ("_order");
  CREATE INDEX "truck_choices_parent_id_idx" ON "truck_choices" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_choices_locales_locale_parent_id_unique" ON "truck_choices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_families_texts_order_parent" ON "truck_families_texts" USING btree ("order","parent_id");
  CREATE INDEX "_truck_fam_specs_v_order_idx" ON "_truck_fam_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_fam_specs_v_parent_id_idx" ON "_truck_fam_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_fam_specs_v_spec_idx" ON "_truck_fam_specs_v" USING btree ("spec_id");
  CREATE UNIQUE INDEX "_truck_fam_specs_v_locales_locale_parent_id_unique" ON "_truck_fam_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_specs_v_order_idx" ON "_truck_model_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_model_specs_v_parent_id_idx" ON "_truck_model_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_model_specs_v_spec_idx" ON "_truck_model_specs_v" USING btree ("spec_id");
  CREATE UNIQUE INDEX "_truck_model_specs_v_locales_locale_parent_id_unique" ON "_truck_model_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_option_specs_v_order_idx" ON "_truck_option_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_option_specs_v_parent_id_idx" ON "_truck_option_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_option_specs_v_spec_idx" ON "_truck_option_specs_v" USING btree ("spec_id");
  CREATE UNIQUE INDEX "_truck_option_specs_v_locales_locale_parent_id_unique" ON "_truck_option_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_options_v_order_idx" ON "_truck_options_v" USING btree ("_order");
  CREATE INDEX "_truck_options_v_parent_id_idx" ON "_truck_options_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_options_v_image_idx" ON "_truck_options_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_options_v_locales_locale_parent_id_unique" ON "_truck_options_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_choices_v_order_idx" ON "_truck_choices_v" USING btree ("_order");
  CREATE INDEX "_truck_choices_v_parent_id_idx" ON "_truck_choices_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_choices_v_locales_locale_parent_id_unique" ON "_truck_choices_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_families_v_texts_order_parent" ON "_truck_families_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "truck_specs_key_idx" ON "truck_specs" USING btree ("key");
  CREATE INDEX "truck_specs_updated_at_idx" ON "truck_specs" USING btree ("updated_at");
  CREATE INDEX "truck_specs_created_at_idx" ON "truck_specs" USING btree ("created_at");
  CREATE UNIQUE INDEX "truck_specs_locales_locale_parent_id_unique" ON "truck_specs_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_truck_specs_fk" FOREIGN KEY ("truck_specs_id") REFERENCES "public"."truck_specs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_truck_specs_id_idx" ON "payload_locked_documents_rels" USING btree ("truck_specs_id");
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
  ALTER TABLE "truck_families_locales" DROP COLUMN "lift_height_help";
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
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_lift_height_help";`);
}
