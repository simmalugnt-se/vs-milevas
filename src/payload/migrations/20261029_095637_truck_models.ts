/**
 * Truck models as their own collection (`truck-models`), and the truck type's groups in place of its
 * fixed lists. This migration changes the schema and keeps the old rows aside (`mig_*`); the data is
 * moved by the branch's last migration, `20261029_152204_equipment_and_step_order`, once every
 * table the truck types use exists (the Local API writes all of them).
 *
 * The old variants' table has the new collection's name, so the old rows are copied aside first,
 * then the old tables dropped and the new ones created. `down` restores the schema only, not the
 * data.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "mig_truck_models" AS
    SELECT m.*, l.weight, l.turning_radius FROM "truck_models" m
    LEFT JOIN "truck_models_locales" l ON l._parent_id = m.id AND l._locale = 'sv';
  CREATE TABLE "mig_truck_batteries" AS
    SELECT b.*, l.label, l.capacity, l.description FROM "truck_batteries" b
    LEFT JOIN "truck_batteries_locales" l ON l._parent_id = b.id AND l._locale = 'sv';
  CREATE TABLE "mig_truck_lift_heights" AS SELECT * FROM "truck_lift_heights";
  CREATE TABLE "mig_truck_extras" AS
    SELECT e.*, l.label, l.description FROM "truck_extras" e
    LEFT JOIN "truck_extras_locales" l ON l._parent_id = e.id AND l._locale = 'sv';
  CREATE TABLE "mig_truck_families" AS
    SELECT f.id, l.travel_speed, l.lift_height_help FROM "truck_families" f
    LEFT JOIN "truck_families_locales" l ON l._parent_id = f.id AND l._locale = 'sv';
  CREATE TABLE "mig_settings_steps" AS
    SELECT s._order, s.step::text AS step, l.label FROM "configurator_settings_steps" s
    LEFT JOIN "configurator_settings_steps_locales" l ON l._parent_id = s.id AND l._locale = 'sv';
  CREATE TABLE "mig_settings" AS
    SELECT model_step_label FROM "configurator_settings_locales" WHERE _locale = 'sv';
  DROP TABLE "truck_models" CASCADE;
  DROP TABLE "truck_models_locales" CASCADE;
  DROP TABLE "_truck_models_v" CASCADE;
  DROP TABLE "_truck_models_v_locales" CASCADE;
`);

  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_model_steps_property" AS ENUM('capacity', 'wheels', 'series');
  CREATE TYPE "public"."enum__truck_model_steps_v_property" AS ENUM('capacity', 'wheels', 'series');
  CREATE TYPE "public"."enum_truck_models_wheels" AS ENUM('3', '4');
  CREATE TYPE "public"."enum_truck_models_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__truck_models_v_version_wheels" AS ENUM('3', '4');
  CREATE TYPE "public"."enum__truck_models_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__truck_models_v_published_locale" AS ENUM('sv');
  CREATE TABLE "truck_family_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "truck_family_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_model_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"property" "enum_truck_model_steps_property"
  );
  
  CREATE TABLE "truck_model_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_option_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid
  );
  
  CREATE TABLE "truck_option_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "truck_option_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_question_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"image_id" uuid,
  	"available_for" jsonb
  );
  
  CREATE TABLE "truck_question_options_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"multiple" boolean DEFAULT false
  );
  
  CREATE TABLE "truck_questions_locales" (
  	"label" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_family_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_family_specs_v_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_model_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"property" "enum__truck_model_steps_v_property",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_steps_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_option_images_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_option_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_option_specs_v_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_question_options_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"sku" varchar,
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"image_id" uuid,
  	"available_for" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_question_options_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_questions_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"multiple" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_questions_v_locales" (
  	"label" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "truck_model_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "truck_model_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_models" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"family_id" uuid,
  	"name" varchar,
  	"sku" varchar,
  	"series" varchar,
  	"capacity_kg" numeric,
  	"wheels" "enum_truck_models_wheels",
  	"price" numeric,
  	"dealer_discount_percent" numeric,
  	"image_id" uuid,
  	"brochure_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_truck_models_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "truck_models_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_model_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_specs_v_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_models_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_family_id" uuid,
  	"version_name" varchar,
  	"version_sku" varchar,
  	"version_series" varchar,
  	"version_capacity_kg" numeric,
  	"version_wheels" "enum__truck_models_v_version_wheels",
  	"version_price" numeric,
  	"version_dealer_discount_percent" numeric,
  	"version_image_id" uuid,
  	"version_brochure_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__truck_models_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__truck_models_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_truck_models_v_locales" (
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_batteries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_batteries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_lift_heights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extras" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extras_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_batteries_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_batteries_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_lift_heights_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extras_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extras_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_steps_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_batteries" CASCADE;
  DROP TABLE "truck_batteries_locales" CASCADE;
  DROP TABLE "truck_lift_heights" CASCADE;
  DROP TABLE "truck_extras" CASCADE;
  DROP TABLE "truck_extras_locales" CASCADE;
  DROP TABLE "_truck_batteries_v" CASCADE;
  DROP TABLE "_truck_batteries_v_locales" CASCADE;
  DROP TABLE "_truck_lift_heights_v" CASCADE;
  DROP TABLE "_truck_extras_v" CASCADE;
  DROP TABLE "_truck_extras_v_locales" CASCADE;
  DROP TABLE "configurator_settings_steps" CASCADE;
  DROP TABLE "configurator_settings_steps_locales" CASCADE;
  DROP TABLE "_configurator_settings_v_version_steps" CASCADE;
  DROP TABLE "_configurator_settings_v_version_steps_locales" CASCADE;
  ALTER TABLE "truck_families_locales" ADD COLUMN "card_spec" varchar;
  ALTER TABLE "truck_families_rels" ADD COLUMN "truck_models_id" uuid;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_card_spec" varchar;
  ALTER TABLE "_truck_families_v_rels" ADD COLUMN "truck_models_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "truck_models_id" uuid;
  ALTER TABLE "truck_family_specs" ADD CONSTRAINT "truck_family_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_family_specs_locales" ADD CONSTRAINT "truck_family_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_family_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_steps" ADD CONSTRAINT "truck_model_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_steps_locales" ADD CONSTRAINT "truck_model_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_images" ADD CONSTRAINT "truck_option_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_option_images" ADD CONSTRAINT "truck_option_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_question_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs" ADD CONSTRAINT "truck_option_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_question_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs_locales" ADD CONSTRAINT "truck_option_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_option_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_question_options" ADD CONSTRAINT "truck_question_options_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_question_options" ADD CONSTRAINT "truck_question_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_question_options_locales" ADD CONSTRAINT "truck_question_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_question_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_questions" ADD CONSTRAINT "truck_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_questions_locales" ADD CONSTRAINT "truck_questions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_family_specs_v" ADD CONSTRAINT "_truck_family_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_family_specs_v_locales" ADD CONSTRAINT "_truck_family_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_family_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v" ADD CONSTRAINT "_truck_model_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v_locales" ADD CONSTRAINT "_truck_model_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_images_v" ADD CONSTRAINT "_truck_option_images_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_option_images_v" ADD CONSTRAINT "_truck_option_images_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_question_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v" ADD CONSTRAINT "_truck_option_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_question_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v_locales" ADD CONSTRAINT "_truck_option_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_option_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_question_options_v" ADD CONSTRAINT "_truck_question_options_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_question_options_v" ADD CONSTRAINT "_truck_question_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_question_options_v_locales" ADD CONSTRAINT "_truck_question_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_question_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_questions_v" ADD CONSTRAINT "_truck_questions_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_questions_v_locales" ADD CONSTRAINT "_truck_questions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_questions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs" ADD CONSTRAINT "truck_model_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs_locales" ADD CONSTRAINT "truck_model_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_family_id_truck_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."truck_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_brochure_id_documents_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_models_locales" ADD CONSTRAINT "truck_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v" ADD CONSTRAINT "_truck_model_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v_locales" ADD CONSTRAINT "_truck_model_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_parent_id_truck_models_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."truck_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_version_family_id_truck_families_id_fk" FOREIGN KEY ("version_family_id") REFERENCES "public"."truck_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_version_image_id_images_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_version_brochure_id_documents_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v_locales" ADD CONSTRAINT "_truck_models_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_family_specs_order_idx" ON "truck_family_specs" USING btree ("_order");
  CREATE INDEX "truck_family_specs_parent_id_idx" ON "truck_family_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_family_specs_locales_locale_parent_id_unique" ON "truck_family_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_model_steps_order_idx" ON "truck_model_steps" USING btree ("_order");
  CREATE INDEX "truck_model_steps_parent_id_idx" ON "truck_model_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_model_steps_locales_locale_parent_id_unique" ON "truck_model_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_option_images_order_idx" ON "truck_option_images" USING btree ("_order");
  CREATE INDEX "truck_option_images_parent_id_idx" ON "truck_option_images" USING btree ("_parent_id");
  CREATE INDEX "truck_option_images_image_idx" ON "truck_option_images" USING btree ("image_id");
  CREATE INDEX "truck_option_specs_order_idx" ON "truck_option_specs" USING btree ("_order");
  CREATE INDEX "truck_option_specs_parent_id_idx" ON "truck_option_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_option_specs_locales_locale_parent_id_unique" ON "truck_option_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_question_options_order_idx" ON "truck_question_options" USING btree ("_order");
  CREATE INDEX "truck_question_options_parent_id_idx" ON "truck_question_options" USING btree ("_parent_id");
  CREATE INDEX "truck_question_options_image_idx" ON "truck_question_options" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_question_options_locales_locale_parent_id_unique" ON "truck_question_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_questions_order_idx" ON "truck_questions" USING btree ("_order");
  CREATE INDEX "truck_questions_parent_id_idx" ON "truck_questions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_questions_locales_locale_parent_id_unique" ON "truck_questions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_family_specs_v_order_idx" ON "_truck_family_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_family_specs_v_parent_id_idx" ON "_truck_family_specs_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_family_specs_v_locales_locale_parent_id_unique" ON "_truck_family_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_steps_v_order_idx" ON "_truck_model_steps_v" USING btree ("_order");
  CREATE INDEX "_truck_model_steps_v_parent_id_idx" ON "_truck_model_steps_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_model_steps_v_locales_locale_parent_id_unique" ON "_truck_model_steps_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_option_images_v_order_idx" ON "_truck_option_images_v" USING btree ("_order");
  CREATE INDEX "_truck_option_images_v_parent_id_idx" ON "_truck_option_images_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_option_images_v_image_idx" ON "_truck_option_images_v" USING btree ("image_id");
  CREATE INDEX "_truck_option_specs_v_order_idx" ON "_truck_option_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_option_specs_v_parent_id_idx" ON "_truck_option_specs_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_option_specs_v_locales_locale_parent_id_unique" ON "_truck_option_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_question_options_v_order_idx" ON "_truck_question_options_v" USING btree ("_order");
  CREATE INDEX "_truck_question_options_v_parent_id_idx" ON "_truck_question_options_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_question_options_v_image_idx" ON "_truck_question_options_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_question_options_v_locales_locale_parent_id_unique" ON "_truck_question_options_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_questions_v_order_idx" ON "_truck_questions_v" USING btree ("_order");
  CREATE INDEX "_truck_questions_v_parent_id_idx" ON "_truck_questions_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_questions_v_locales_locale_parent_id_unique" ON "_truck_questions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_model_specs_order_idx" ON "truck_model_specs" USING btree ("_order");
  CREATE INDEX "truck_model_specs_parent_id_idx" ON "truck_model_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_model_specs_locales_locale_parent_id_unique" ON "truck_model_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_models_family_idx" ON "truck_models" USING btree ("family_id");
  CREATE INDEX "truck_models_image_idx" ON "truck_models" USING btree ("image_id");
  CREATE INDEX "truck_models_brochure_idx" ON "truck_models" USING btree ("brochure_id");
  CREATE INDEX "truck_models_updated_at_idx" ON "truck_models" USING btree ("updated_at");
  CREATE INDEX "truck_models_created_at_idx" ON "truck_models" USING btree ("created_at");
  CREATE INDEX "truck_models__status_idx" ON "truck_models" USING btree ("_status");
  CREATE UNIQUE INDEX "truck_models_locales_locale_parent_id_unique" ON "truck_models_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_specs_v_order_idx" ON "_truck_model_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_model_specs_v_parent_id_idx" ON "_truck_model_specs_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_model_specs_v_locales_locale_parent_id_unique" ON "_truck_model_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_models_v_parent_idx" ON "_truck_models_v" USING btree ("parent_id");
  CREATE INDEX "_truck_models_v_version_version_family_idx" ON "_truck_models_v" USING btree ("version_family_id");
  CREATE INDEX "_truck_models_v_version_version_image_idx" ON "_truck_models_v" USING btree ("version_image_id");
  CREATE INDEX "_truck_models_v_version_version_brochure_idx" ON "_truck_models_v" USING btree ("version_brochure_id");
  CREATE INDEX "_truck_models_v_version_version_updated_at_idx" ON "_truck_models_v" USING btree ("version_updated_at");
  CREATE INDEX "_truck_models_v_version_version_created_at_idx" ON "_truck_models_v" USING btree ("version_created_at");
  CREATE INDEX "_truck_models_v_version_version__status_idx" ON "_truck_models_v" USING btree ("version__status");
  CREATE INDEX "_truck_models_v_created_at_idx" ON "_truck_models_v" USING btree ("created_at");
  CREATE INDEX "_truck_models_v_updated_at_idx" ON "_truck_models_v" USING btree ("updated_at");
  CREATE INDEX "_truck_models_v_snapshot_idx" ON "_truck_models_v" USING btree ("snapshot");
  CREATE INDEX "_truck_models_v_published_locale_idx" ON "_truck_models_v" USING btree ("published_locale");
  CREATE INDEX "_truck_models_v_latest_idx" ON "_truck_models_v" USING btree ("latest");
  CREATE INDEX "_truck_models_v_autosave_idx" ON "_truck_models_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_truck_models_v_locales_locale_parent_id_unique" ON "_truck_models_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_families_rels" ADD CONSTRAINT "truck_families_rels_truck_models_fk" FOREIGN KEY ("truck_models_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_rels" ADD CONSTRAINT "_truck_families_v_rels_truck_models_fk" FOREIGN KEY ("truck_models_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_truck_models_fk" FOREIGN KEY ("truck_models_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_families_rels_truck_models_id_idx" ON "truck_families_rels" USING btree ("truck_models_id");
  CREATE INDEX "_truck_families_v_rels_truck_models_id_idx" ON "_truck_families_v_rels" USING btree ("truck_models_id");
  CREATE INDEX "payload_locked_documents_rels_truck_models_id_idx" ON "payload_locked_documents_rels" USING btree ("truck_models_id");
  ALTER TABLE "truck_families_locales" DROP COLUMN "travel_speed";
  ALTER TABLE "truck_families_locales" DROP COLUMN "lift_height_help";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_travel_speed";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_lift_height_help";
  ALTER TABLE "configurator_settings_locales" DROP COLUMN "model_step_label";
  ALTER TABLE "_configurator_settings_v_locales" DROP COLUMN "version_model_step_label";
  DROP TYPE "public"."enum_configurator_settings_steps_step";
  DROP TYPE "public"."enum__configurator_settings_v_version_steps_step";`);

  // The steps as they are now: the model steps by what they choose by, the steps after the model
  // (in the questions' table) with their columns, the default model, and which options are for some models only and which models tick them. Created here, so the data
  // below is written in its final shape.
  await db.execute(sql`
  CREATE TYPE "public"."enum_truck_questions_columns" AS ENUM('auto', 'one', 'two');
  CREATE TYPE "public"."enum__truck_questions_v_columns" AS ENUM('auto', 'one', 'two');
  ALTER TABLE "truck_questions" ADD COLUMN "columns" "enum_truck_questions_columns" DEFAULT 'auto';
  ALTER TABLE "_truck_questions_v" ADD COLUMN "columns" "enum__truck_questions_v_columns" DEFAULT 'auto';
  DROP TABLE "truck_model_steps" CASCADE;
  DROP TABLE "truck_model_steps_locales" CASCADE;
  DROP TABLE "_truck_model_steps_v" CASCADE;
  DROP TABLE "_truck_model_steps_v_locales" CASCADE;
  DROP TYPE "public"."enum_truck_model_steps_property";
  DROP TYPE "public"."enum__truck_model_steps_v_property";
  CREATE TYPE "public"."enum_truck_model_steps_step" AS ENUM('capacity', 'wheels', 'series', 'model');
  CREATE TYPE "public"."enum__truck_model_steps_v_step" AS ENUM('capacity', 'wheels', 'series', 'model');
  CREATE TABLE "truck_model_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" "enum_truck_model_steps_step"
  );
  
  CREATE TABLE "truck_model_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_model_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"step" "enum__truck_model_steps_v_step",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_steps_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_families" ADD COLUMN "default_model_id" uuid;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_default_model_id" uuid;
  ALTER TABLE "truck_model_steps" ADD CONSTRAINT "truck_model_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_steps_locales" ADD CONSTRAINT "truck_model_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v" ADD CONSTRAINT "_truck_model_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v_locales" ADD CONSTRAINT "_truck_model_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_model_steps_order_idx" ON "truck_model_steps" USING btree ("_order");
  CREATE INDEX "truck_model_steps_parent_id_idx" ON "truck_model_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_model_steps_locales_locale_parent_id_unique" ON "truck_model_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_steps_v_order_idx" ON "_truck_model_steps_v" USING btree ("_order");
  CREATE INDEX "_truck_model_steps_v_parent_id_idx" ON "_truck_model_steps_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_model_steps_v_locales_locale_parent_id_unique" ON "_truck_model_steps_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_families" ADD CONSTRAINT "truck_families_default_model_id_truck_models_id_fk" FOREIGN KEY ("default_model_id") REFERENCES "public"."truck_models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_version_default_model_id_truck_models_id_fk" FOREIGN KEY ("version_default_model_id") REFERENCES "public"."truck_models"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "truck_families_default_model_idx" ON "truck_families" USING btree ("default_model_id");
  CREATE INDEX "_truck_families_v_version_version_default_model_idx" ON "_truck_families_v" USING btree ("version_default_model_id");
  ALTER TABLE "truck_question_options" ADD COLUMN "for_all_models" boolean DEFAULT true;
  ALTER TABLE "_truck_question_options_v" ADD COLUMN "for_all_models" boolean DEFAULT true;
  ALTER TABLE "truck_models" ADD COLUMN "own_options" jsonb;
  ALTER TABLE "_truck_models_v" ADD COLUMN "version_own_options" jsonb;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The old rows kept aside, if the last migration has not moved them yet.
  await db.execute(sql`
  DROP TABLE IF EXISTS "mig_truck_models";
  DROP TABLE IF EXISTS "mig_truck_batteries";
  DROP TABLE IF EXISTS "mig_truck_lift_heights";
  DROP TABLE IF EXISTS "mig_truck_extras";
  DROP TABLE IF EXISTS "mig_truck_families";
  DROP TABLE IF EXISTS "mig_settings_steps";
  DROP TABLE IF EXISTS "mig_settings";`);
  await db.execute(sql`
  ALTER TABLE "truck_question_options" DROP COLUMN "for_all_models";
  ALTER TABLE "_truck_question_options_v" DROP COLUMN "for_all_models";
  ALTER TABLE "truck_models" DROP COLUMN "own_options";
  ALTER TABLE "_truck_models_v" DROP COLUMN "version_own_options";`);
  await db.execute(sql`
  ALTER TABLE "truck_model_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_model_steps" CASCADE;
  DROP TABLE "truck_model_steps_locales" CASCADE;
  DROP TABLE "_truck_model_steps_v" CASCADE;
  DROP TABLE "_truck_model_steps_v_locales" CASCADE;
  ALTER TABLE "truck_families" DROP CONSTRAINT "truck_families_default_model_id_truck_models_id_fk";
  
  ALTER TABLE "_truck_families_v" DROP CONSTRAINT "_truck_families_v_version_default_model_id_truck_models_id_fk";
  
  DROP INDEX "truck_families_default_model_idx";
  DROP INDEX "_truck_families_v_version_version_default_model_idx";
  ALTER TABLE "truck_families" DROP COLUMN "default_model_id";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_default_model_id";
  DROP TYPE "public"."enum_truck_model_steps_step";
  DROP TYPE "public"."enum__truck_model_steps_v_step";`);
  await db.execute(sql`
  CREATE TYPE "public"."enum_truck_model_steps_property" AS ENUM('capacity', 'wheels', 'series');
  CREATE TYPE "public"."enum__truck_model_steps_v_property" AS ENUM('capacity', 'wheels', 'series');
  CREATE TABLE "truck_model_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"property" "enum_truck_model_steps_property"
  );
  
  CREATE TABLE "truck_model_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_model_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"property" "enum__truck_model_steps_v_property",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_steps_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_model_steps" ADD CONSTRAINT "truck_model_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_steps_locales" ADD CONSTRAINT "truck_model_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v" ADD CONSTRAINT "_truck_model_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v_locales" ADD CONSTRAINT "_truck_model_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_model_steps_order_idx" ON "truck_model_steps" USING btree ("_order");
  CREATE INDEX "truck_model_steps_parent_id_idx" ON "truck_model_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_model_steps_locales_locale_parent_id_unique" ON "truck_model_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_steps_v_order_idx" ON "_truck_model_steps_v" USING btree ("_order");
  CREATE INDEX "_truck_model_steps_v_parent_id_idx" ON "_truck_model_steps_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_model_steps_v_locales_locale_parent_id_unique" ON "_truck_model_steps_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_questions" DROP COLUMN "columns";
  ALTER TABLE "_truck_questions_v" DROP COLUMN "columns";
  DROP TYPE "public"."enum_truck_questions_columns";
  DROP TYPE "public"."enum__truck_questions_v_columns";`);
  await db.execute(sql`
  DROP TABLE "truck_models" CASCADE;
  DROP TABLE "truck_models_locales" CASCADE;
  DROP TABLE "_truck_models_v" CASCADE;
  DROP TABLE "_truck_models_v_locales" CASCADE;
   CREATE TYPE "public"."enum_configurator_settings_steps_step" AS ENUM('battery', 'lift-height', 'extras');
  CREATE TYPE "public"."enum__configurator_settings_v_version_steps_step" AS ENUM('battery', 'lift-height', 'extras');
  CREATE TABLE "truck_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"capacity_kg" numeric,
  	"sku" varchar,
  	"price" numeric,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false
  );
  
  CREATE TABLE "truck_models_locales" (
  	"weight" varchar,
  	"turning_radius" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_batteries" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false,
  	"available_for" jsonb
  );
  
  CREATE TABLE "truck_batteries_locales" (
  	"label" varchar,
  	"capacity" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_lift_heights" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lift_height" numeric,
  	"build_height" numeric,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false,
  	"available_for" jsonb
  );
  
  CREATE TABLE "truck_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"available_for" jsonb
  );
  
  CREATE TABLE "truck_extras_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_models_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"capacity_kg" numeric,
  	"sku" varchar,
  	"price" numeric,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_models_v_locales" (
  	"weight" varchar,
  	"turning_radius" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_batteries_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false,
  	"available_for" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_batteries_v_locales" (
  	"label" varchar,
  	"capacity" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_lift_heights_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"lift_height" numeric,
  	"build_height" numeric,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"default_selected" boolean DEFAULT false,
  	"available_for" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extras_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"available_for" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extras_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "configurator_settings_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" "enum_configurator_settings_steps_step"
  );
  
  CREATE TABLE "configurator_settings_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_configurator_settings_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"step" "enum__configurator_settings_v_version_steps_step",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_configurator_settings_v_version_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_family_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_family_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_question_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_question_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_questions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_family_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_family_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_images_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_question_options_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_question_options_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_questions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_questions_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_family_specs" CASCADE;
  DROP TABLE "truck_family_specs_locales" CASCADE;
  DROP TABLE "truck_model_steps" CASCADE;
  DROP TABLE "truck_model_steps_locales" CASCADE;
  DROP TABLE "truck_option_images" CASCADE;
  DROP TABLE "truck_option_specs" CASCADE;
  DROP TABLE "truck_option_specs_locales" CASCADE;
  DROP TABLE "truck_question_options" CASCADE;
  DROP TABLE "truck_question_options_locales" CASCADE;
  DROP TABLE "truck_questions" CASCADE;
  DROP TABLE "truck_questions_locales" CASCADE;
  DROP TABLE "_truck_family_specs_v" CASCADE;
  DROP TABLE "_truck_family_specs_v_locales" CASCADE;
  DROP TABLE "_truck_model_steps_v" CASCADE;
  DROP TABLE "_truck_model_steps_v_locales" CASCADE;
  DROP TABLE "_truck_option_images_v" CASCADE;
  DROP TABLE "_truck_option_specs_v" CASCADE;
  DROP TABLE "_truck_option_specs_v_locales" CASCADE;
  DROP TABLE "_truck_question_options_v" CASCADE;
  DROP TABLE "_truck_question_options_v_locales" CASCADE;
  DROP TABLE "_truck_questions_v" CASCADE;
  DROP TABLE "_truck_questions_v_locales" CASCADE;
  DROP TABLE "truck_model_specs" CASCADE;
  DROP TABLE "truck_model_specs_locales" CASCADE;
  DROP TABLE "_truck_model_specs_v" CASCADE;
  DROP TABLE "_truck_model_specs_v_locales" CASCADE;
  
  ALTER TABLE "truck_families_rels" DROP CONSTRAINT IF EXISTS "truck_families_rels_truck_models_fk";
  
  
  ALTER TABLE "_truck_families_v_rels" DROP CONSTRAINT IF EXISTS "_truck_families_v_rels_truck_models_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_truck_models_fk";
  
  DROP INDEX IF EXISTS "truck_families_rels_truck_models_id_idx";
  DROP INDEX IF EXISTS "_truck_families_v_rels_truck_models_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_truck_models_id_idx";
  ALTER TABLE "truck_families_locales" ADD COLUMN "travel_speed" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "lift_height_help" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_travel_speed" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_lift_height_help" varchar;
  ALTER TABLE "configurator_settings_locales" ADD COLUMN "model_step_label" varchar DEFAULT 'Lyftkapacitet';
  ALTER TABLE "_configurator_settings_v_locales" ADD COLUMN "version_model_step_label" varchar DEFAULT 'Lyftkapacitet';
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_models_locales" ADD CONSTRAINT "truck_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_batteries" ADD CONSTRAINT "truck_batteries_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_batteries" ADD CONSTRAINT "truck_batteries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_batteries_locales" ADD CONSTRAINT "truck_batteries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_batteries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_lift_heights" ADD CONSTRAINT "truck_lift_heights_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_lift_heights" ADD CONSTRAINT "truck_lift_heights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extras" ADD CONSTRAINT "truck_extras_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_extras" ADD CONSTRAINT "truck_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extras_locales" ADD CONSTRAINT "truck_extras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_models_v_locales" ADD CONSTRAINT "_truck_models_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v" ADD CONSTRAINT "_truck_batteries_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v" ADD CONSTRAINT "_truck_batteries_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v_locales" ADD CONSTRAINT "_truck_batteries_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_batteries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v" ADD CONSTRAINT "_truck_lift_heights_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v" ADD CONSTRAINT "_truck_lift_heights_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extras_v" ADD CONSTRAINT "_truck_extras_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_extras_v" ADD CONSTRAINT "_truck_extras_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extras_v_locales" ADD CONSTRAINT "_truck_extras_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_steps" ADD CONSTRAINT "configurator_settings_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_steps_locales" ADD CONSTRAINT "configurator_settings_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_steps" ADD CONSTRAINT "_configurator_settings_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_steps_locales" ADD CONSTRAINT "_configurator_settings_v_version_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_models_order_idx" ON "truck_models" USING btree ("_order");
  CREATE INDEX "truck_models_parent_id_idx" ON "truck_models" USING btree ("_parent_id");
  CREATE INDEX "truck_models_image_idx" ON "truck_models" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_models_locales_locale_parent_id_unique" ON "truck_models_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_batteries_order_idx" ON "truck_batteries" USING btree ("_order");
  CREATE INDEX "truck_batteries_parent_id_idx" ON "truck_batteries" USING btree ("_parent_id");
  CREATE INDEX "truck_batteries_image_idx" ON "truck_batteries" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_batteries_locales_locale_parent_id_unique" ON "truck_batteries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_lift_heights_order_idx" ON "truck_lift_heights" USING btree ("_order");
  CREATE INDEX "truck_lift_heights_parent_id_idx" ON "truck_lift_heights" USING btree ("_parent_id");
  CREATE INDEX "truck_lift_heights_image_idx" ON "truck_lift_heights" USING btree ("image_id");
  CREATE INDEX "truck_extras_order_idx" ON "truck_extras" USING btree ("_order");
  CREATE INDEX "truck_extras_parent_id_idx" ON "truck_extras" USING btree ("_parent_id");
  CREATE INDEX "truck_extras_image_idx" ON "truck_extras" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_extras_locales_locale_parent_id_unique" ON "truck_extras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_models_v_order_idx" ON "_truck_models_v" USING btree ("_order");
  CREATE INDEX "_truck_models_v_parent_id_idx" ON "_truck_models_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_models_v_image_idx" ON "_truck_models_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_models_v_locales_locale_parent_id_unique" ON "_truck_models_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_batteries_v_order_idx" ON "_truck_batteries_v" USING btree ("_order");
  CREATE INDEX "_truck_batteries_v_parent_id_idx" ON "_truck_batteries_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_batteries_v_image_idx" ON "_truck_batteries_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_batteries_v_locales_locale_parent_id_unique" ON "_truck_batteries_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_lift_heights_v_order_idx" ON "_truck_lift_heights_v" USING btree ("_order");
  CREATE INDEX "_truck_lift_heights_v_parent_id_idx" ON "_truck_lift_heights_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_lift_heights_v_image_idx" ON "_truck_lift_heights_v" USING btree ("image_id");
  CREATE INDEX "_truck_extras_v_order_idx" ON "_truck_extras_v" USING btree ("_order");
  CREATE INDEX "_truck_extras_v_parent_id_idx" ON "_truck_extras_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_extras_v_image_idx" ON "_truck_extras_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_extras_v_locales_locale_parent_id_unique" ON "_truck_extras_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "configurator_settings_steps_order_idx" ON "configurator_settings_steps" USING btree ("_order");
  CREATE INDEX "configurator_settings_steps_parent_id_idx" ON "configurator_settings_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configurator_settings_steps_locales_locale_parent_id_unique" ON "configurator_settings_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_configurator_settings_v_version_steps_order_idx" ON "_configurator_settings_v_version_steps" USING btree ("_order");
  CREATE INDEX "_configurator_settings_v_version_steps_parent_id_idx" ON "_configurator_settings_v_version_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_configurator_settings_v_version_steps_locales_locale_parent" ON "_configurator_settings_v_version_steps_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_families_locales" DROP COLUMN "card_spec";
  ALTER TABLE "truck_families_rels" DROP COLUMN "truck_models_id";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_card_spec";
  ALTER TABLE "_truck_families_v_rels" DROP COLUMN "truck_models_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "truck_models_id";
  DROP TYPE "public"."enum_truck_model_steps_property";
  DROP TYPE "public"."enum__truck_model_steps_v_property";
  DROP TYPE "public"."enum_truck_models_wheels";
  DROP TYPE "public"."enum_truck_models_status";
  DROP TYPE "public"."enum__truck_models_v_version_wheels";
  DROP TYPE "public"."enum__truck_models_v_version_status";
  DROP TYPE "public"."enum__truck_models_v_published_locale";`);
}
