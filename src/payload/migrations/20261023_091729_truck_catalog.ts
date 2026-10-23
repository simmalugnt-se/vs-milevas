import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Truck data built on what the configurator's steps need (docs/truck-data-schema.md): the
 * `truck-specs` collection; truck families with models and choices instead of steps, groups and
 * options, and without base price and SKU; the configurator settings' warranty note and next
 * steps; and a `source` on Header menus and Footer columns that lists the truck families. The old
 * catalogue was placeholder data, so its tables are dropped; `pnpm seed:configurator` fills the
 * new ones.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_choices_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum_truck_choices_display" AS ENUM('grid', 'stack', 'images', 'imageRows', 'prices');
  CREATE TYPE "public"."enum_truck_families_contact_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__truck_choices_v_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum__truck_choices_v_display" AS ENUM('grid', 'stack', 'images', 'imageRows', 'prices');
  CREATE TYPE "public"."enum__truck_families_v_version_contact_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_header_nav_items_source" AS ENUM('links', 'truckFamilies');
  CREATE TYPE "public"."enum__header_v_version_nav_items_source" AS ENUM('links', 'truckFamilies');
  CREATE TYPE "public"."enum_footer_link_groups_source" AS ENUM('links', 'truckFamilies');
  CREATE TYPE "public"."enum__footer_v_version_link_groups_source" AS ENUM('links', 'truckFamilies');
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
  
  CREATE TABLE "truck_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"sku" varchar,
  	"price" numeric,
  	"capacity_kg" numeric,
  	"default_selected" boolean DEFAULT false
  );
  
  CREATE TABLE "truck_models_locales" (
  	"label" varchar,
  	"description" varchar,
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
  
  CREATE TABLE "truck_families_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" uuid
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
  
  CREATE TABLE "_truck_models_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"sku" varchar,
  	"price" numeric,
  	"capacity_kg" numeric,
  	"default_selected" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_models_v_locales" (
  	"label" varchar,
  	"description" varchar,
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
  
  CREATE TABLE "_truck_families_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" uuid
  );
  
  CREATE TABLE "truck_specs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"unit" varchar,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"on_card" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "truck_specs_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "configurator_settings_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "configurator_settings_next_steps_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_configurator_settings_v_version_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_configurator_settings_v_version_next_steps_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_cfg_all" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_any" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_none" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_cfg_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_all_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_any_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_none_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_options_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_options_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_groups_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_groups_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_steps_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_cfg_steps_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_cfg_all" CASCADE;
  DROP TABLE "truck_cfg_any" CASCADE;
  DROP TABLE "truck_cfg_none" CASCADE;
  DROP TABLE "truck_cfg_specs" CASCADE;
  DROP TABLE "truck_cfg_specs_locales" CASCADE;
  DROP TABLE "truck_cfg_options" CASCADE;
  DROP TABLE "truck_cfg_options_locales" CASCADE;
  DROP TABLE "truck_cfg_groups" CASCADE;
  DROP TABLE "truck_cfg_groups_locales" CASCADE;
  DROP TABLE "truck_cfg_steps" CASCADE;
  DROP TABLE "truck_cfg_steps_locales" CASCADE;
  DROP TABLE "_truck_cfg_all_v" CASCADE;
  DROP TABLE "_truck_cfg_any_v" CASCADE;
  DROP TABLE "_truck_cfg_none_v" CASCADE;
  DROP TABLE "_truck_cfg_specs_v" CASCADE;
  DROP TABLE "_truck_cfg_specs_v_locales" CASCADE;
  DROP TABLE "_truck_cfg_options_v" CASCADE;
  DROP TABLE "_truck_cfg_options_v_locales" CASCADE;
  DROP TABLE "_truck_cfg_groups_v" CASCADE;
  DROP TABLE "_truck_cfg_groups_v_locales" CASCADE;
  DROP TABLE "_truck_cfg_steps_v" CASCADE;
  DROP TABLE "_truck_cfg_steps_v_locales" CASCADE;
  ALTER TABLE "truck_families" ADD COLUMN "configurable" boolean DEFAULT true;
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_type" "enum_truck_families_contact_link_type" DEFAULT 'internal';
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_url" varchar;
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_new_tab" boolean;
  ALTER TABLE "truck_families_locales" ADD COLUMN "singular_name" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "contact_link_label" varchar;
  ALTER TABLE "truck_families_locales" ADD COLUMN "model_choice_label" varchar DEFAULT 'Modell';
  ALTER TABLE "truck_families_locales" ADD COLUMN "model_choice_heading" varchar DEFAULT 'Välj modell';
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_configurable" boolean DEFAULT true;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_type" "enum__truck_families_v_version_contact_link_type" DEFAULT 'internal';
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_url" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_new_tab" boolean;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_singular_name" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_contact_link_label" varchar;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_model_choice_label" varchar DEFAULT 'Modell';
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_model_choice_heading" varchar DEFAULT 'Välj modell';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "truck_specs_id" uuid;
  ALTER TABLE "header_nav_items" ADD COLUMN "source" "enum_header_nav_items_source" DEFAULT 'links';
  ALTER TABLE "_header_v_version_nav_items" ADD COLUMN "source" "enum__header_v_version_nav_items_source" DEFAULT 'links';
  ALTER TABLE "footer_link_groups" ADD COLUMN "source" "enum_footer_link_groups_source" DEFAULT 'links';
  ALTER TABLE "_footer_v_version_link_groups" ADD COLUMN "source" "enum__footer_v_version_link_groups_source" DEFAULT 'links';
  ALTER TABLE "configurator_settings_locales" ADD COLUMN "warranty_note" varchar;
  ALTER TABLE "_configurator_settings_v_locales" ADD COLUMN "version_warranty_note" varchar;
  ALTER TABLE "truck_fam_specs" ADD CONSTRAINT "truck_fam_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_fam_specs" ADD CONSTRAINT "truck_fam_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_fam_specs_locales" ADD CONSTRAINT "truck_fam_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_fam_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs" ADD CONSTRAINT "truck_model_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_model_specs" ADD CONSTRAINT "truck_model_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_specs_locales" ADD CONSTRAINT "truck_model_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_models_locales" ADD CONSTRAINT "truck_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs" ADD CONSTRAINT "truck_option_specs_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_option_specs" ADD CONSTRAINT "truck_option_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_specs_locales" ADD CONSTRAINT "truck_option_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_option_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_options" ADD CONSTRAINT "truck_options_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_options" ADD CONSTRAINT "truck_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_choices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_options_locales" ADD CONSTRAINT "truck_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_choices" ADD CONSTRAINT "truck_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_choices_locales" ADD CONSTRAINT "truck_choices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_choices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_families_texts" ADD CONSTRAINT "truck_families_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_families_rels" ADD CONSTRAINT "truck_families_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_families_rels" ADD CONSTRAINT "truck_families_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v" ADD CONSTRAINT "_truck_fam_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v" ADD CONSTRAINT "_truck_fam_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_fam_specs_v_locales" ADD CONSTRAINT "_truck_fam_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_fam_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v" ADD CONSTRAINT "_truck_model_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v" ADD CONSTRAINT "_truck_model_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_specs_v_locales" ADD CONSTRAINT "_truck_model_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_models_v_locales" ADD CONSTRAINT "_truck_models_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v" ADD CONSTRAINT "_truck_option_specs_v_spec_id_truck_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."truck_specs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v" ADD CONSTRAINT "_truck_option_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_specs_v_locales" ADD CONSTRAINT "_truck_option_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_option_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_options_v" ADD CONSTRAINT "_truck_options_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_options_v" ADD CONSTRAINT "_truck_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_choices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_options_v_locales" ADD CONSTRAINT "_truck_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_choices_v" ADD CONSTRAINT "_truck_choices_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_choices_v_locales" ADD CONSTRAINT "_truck_choices_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_choices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_texts" ADD CONSTRAINT "_truck_families_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_rels" ADD CONSTRAINT "_truck_families_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_rels" ADD CONSTRAINT "_truck_families_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_specs_locales" ADD CONSTRAINT "truck_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_next_steps" ADD CONSTRAINT "configurator_settings_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_next_steps_locales" ADD CONSTRAINT "configurator_settings_next_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_next_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_next_steps" ADD CONSTRAINT "_configurator_settings_v_version_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_next_steps_locales" ADD CONSTRAINT "_configurator_settings_v_version_next_steps_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_next_steps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_fam_specs_order_idx" ON "truck_fam_specs" USING btree ("_order");
  CREATE INDEX "truck_fam_specs_parent_id_idx" ON "truck_fam_specs" USING btree ("_parent_id");
  CREATE INDEX "truck_fam_specs_spec_idx" ON "truck_fam_specs" USING btree ("spec_id");
  CREATE UNIQUE INDEX "truck_fam_specs_locales_locale_parent_id_unique" ON "truck_fam_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_model_specs_order_idx" ON "truck_model_specs" USING btree ("_order");
  CREATE INDEX "truck_model_specs_parent_id_idx" ON "truck_model_specs" USING btree ("_parent_id");
  CREATE INDEX "truck_model_specs_spec_idx" ON "truck_model_specs" USING btree ("spec_id");
  CREATE UNIQUE INDEX "truck_model_specs_locales_locale_parent_id_unique" ON "truck_model_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_models_order_idx" ON "truck_models" USING btree ("_order");
  CREATE INDEX "truck_models_parent_id_idx" ON "truck_models" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_models_locales_locale_parent_id_unique" ON "truck_models_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "truck_families_rels_order_idx" ON "truck_families_rels" USING btree ("order");
  CREATE INDEX "truck_families_rels_parent_idx" ON "truck_families_rels" USING btree ("parent_id");
  CREATE INDEX "truck_families_rels_path_idx" ON "truck_families_rels" USING btree ("path");
  CREATE INDEX "truck_families_rels_pages_id_idx" ON "truck_families_rels" USING btree ("pages_id");
  CREATE INDEX "_truck_fam_specs_v_order_idx" ON "_truck_fam_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_fam_specs_v_parent_id_idx" ON "_truck_fam_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_fam_specs_v_spec_idx" ON "_truck_fam_specs_v" USING btree ("spec_id");
  CREATE UNIQUE INDEX "_truck_fam_specs_v_locales_locale_parent_id_unique" ON "_truck_fam_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_model_specs_v_order_idx" ON "_truck_model_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_model_specs_v_parent_id_idx" ON "_truck_model_specs_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_model_specs_v_spec_idx" ON "_truck_model_specs_v" USING btree ("spec_id");
  CREATE UNIQUE INDEX "_truck_model_specs_v_locales_locale_parent_id_unique" ON "_truck_model_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_models_v_order_idx" ON "_truck_models_v" USING btree ("_order");
  CREATE INDEX "_truck_models_v_parent_id_idx" ON "_truck_models_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_models_v_locales_locale_parent_id_unique" ON "_truck_models_v_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "_truck_families_v_rels_order_idx" ON "_truck_families_v_rels" USING btree ("order");
  CREATE INDEX "_truck_families_v_rels_parent_idx" ON "_truck_families_v_rels" USING btree ("parent_id");
  CREATE INDEX "_truck_families_v_rels_path_idx" ON "_truck_families_v_rels" USING btree ("path");
  CREATE INDEX "_truck_families_v_rels_pages_id_idx" ON "_truck_families_v_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "truck_specs_key_idx" ON "truck_specs" USING btree ("key");
  CREATE INDEX "truck_specs_updated_at_idx" ON "truck_specs" USING btree ("updated_at");
  CREATE INDEX "truck_specs_created_at_idx" ON "truck_specs" USING btree ("created_at");
  CREATE UNIQUE INDEX "truck_specs_locales_locale_parent_id_unique" ON "truck_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "configurator_settings_next_steps_order_idx" ON "configurator_settings_next_steps" USING btree ("_order");
  CREATE INDEX "configurator_settings_next_steps_parent_id_idx" ON "configurator_settings_next_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configurator_settings_next_steps_locales_locale_parent_id_un" ON "configurator_settings_next_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_configurator_settings_v_version_next_steps_order_idx" ON "_configurator_settings_v_version_next_steps" USING btree ("_order");
  CREATE INDEX "_configurator_settings_v_version_next_steps_parent_id_idx" ON "_configurator_settings_v_version_next_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_configurator_settings_v_version_next_steps_locales_locale_p" ON "_configurator_settings_v_version_next_steps_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_truck_specs_fk" FOREIGN KEY ("truck_specs_id") REFERENCES "public"."truck_specs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_truck_specs_id_idx" ON "payload_locked_documents_rels" USING btree ("truck_specs_id");
  ALTER TABLE "truck_families" DROP COLUMN "base_price";
  ALTER TABLE "truck_families" DROP COLUMN "sku";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_base_price";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_sku";
  DROP TYPE "public"."enum_truck_cfg_options_price_mode";
  DROP TYPE "public"."enum_truck_cfg_groups_selection_mode";
  DROP TYPE "public"."enum__truck_cfg_options_v_price_mode";
  DROP TYPE "public"."enum__truck_cfg_groups_v_selection_mode";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_cfg_options_price_mode" AS ENUM('included', 'add', 'replaceBase');
  CREATE TYPE "public"."enum_truck_cfg_groups_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum__truck_cfg_options_v_price_mode" AS ENUM('included', 'add', 'replaceBase');
  CREATE TYPE "public"."enum__truck_cfg_groups_v_selection_mode" AS ENUM('single', 'multiple');
  CREATE TABLE "truck_cfg_all" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reference" varchar
  );
  
  CREATE TABLE "truck_cfg_any" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reference" varchar
  );
  
  CREATE TABLE "truck_cfg_none" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reference" varchar
  );
  
  CREATE TABLE "truck_cfg_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "truck_cfg_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_cfg_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"price_mode" "enum_truck_cfg_options_price_mode" DEFAULT 'included',
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"sku" varchar
  );
  
  CREATE TABLE "truck_cfg_options_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_cfg_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"selection_mode" "enum_truck_cfg_groups_selection_mode" DEFAULT 'single',
  	"required" boolean DEFAULT true
  );
  
  CREATE TABLE "truck_cfg_groups_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_cfg_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar
  );
  
  CREATE TABLE "truck_cfg_steps_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_cfg_all_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"reference" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_any_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"reference" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_none_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"reference" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_specs_v_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_cfg_options_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"price_mode" "enum__truck_cfg_options_v_price_mode" DEFAULT 'included',
  	"price" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"sku" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_options_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_cfg_groups_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"selection_mode" "enum__truck_cfg_groups_v_selection_mode" DEFAULT 'single',
  	"required" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_groups_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_cfg_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_cfg_steps_v_locales" (
  	"label" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_fam_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_fam_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_models" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_models_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_choices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_choices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_families_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_families_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_fam_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_fam_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_models_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_models_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_options_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_options_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_choices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_choices_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_families_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_families_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_next_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_next_steps_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_fam_specs" CASCADE;
  DROP TABLE "truck_fam_specs_locales" CASCADE;
  DROP TABLE "truck_model_specs" CASCADE;
  DROP TABLE "truck_model_specs_locales" CASCADE;
  DROP TABLE "truck_models" CASCADE;
  DROP TABLE "truck_models_locales" CASCADE;
  DROP TABLE "truck_option_specs" CASCADE;
  DROP TABLE "truck_option_specs_locales" CASCADE;
  DROP TABLE "truck_options" CASCADE;
  DROP TABLE "truck_options_locales" CASCADE;
  DROP TABLE "truck_choices" CASCADE;
  DROP TABLE "truck_choices_locales" CASCADE;
  DROP TABLE "truck_families_texts" CASCADE;
  DROP TABLE "truck_families_rels" CASCADE;
  DROP TABLE "_truck_fam_specs_v" CASCADE;
  DROP TABLE "_truck_fam_specs_v_locales" CASCADE;
  DROP TABLE "_truck_model_specs_v" CASCADE;
  DROP TABLE "_truck_model_specs_v_locales" CASCADE;
  DROP TABLE "_truck_models_v" CASCADE;
  DROP TABLE "_truck_models_v_locales" CASCADE;
  DROP TABLE "_truck_option_specs_v" CASCADE;
  DROP TABLE "_truck_option_specs_v_locales" CASCADE;
  DROP TABLE "_truck_options_v" CASCADE;
  DROP TABLE "_truck_options_v_locales" CASCADE;
  DROP TABLE "_truck_choices_v" CASCADE;
  DROP TABLE "_truck_choices_v_locales" CASCADE;
  DROP TABLE "_truck_families_v_texts" CASCADE;
  DROP TABLE "_truck_families_v_rels" CASCADE;
  DROP TABLE "truck_specs" CASCADE;
  DROP TABLE "truck_specs_locales" CASCADE;
  DROP TABLE "configurator_settings_next_steps" CASCADE;
  DROP TABLE "configurator_settings_next_steps_locales" CASCADE;
  DROP TABLE "_configurator_settings_v_version_next_steps" CASCADE;
  DROP TABLE "_configurator_settings_v_version_next_steps_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_truck_specs_fk";
  
  DROP INDEX "payload_locked_documents_rels_truck_specs_id_idx";
  ALTER TABLE "truck_families" ADD COLUMN "base_price" numeric;
  ALTER TABLE "truck_families" ADD COLUMN "sku" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_base_price" numeric;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_sku" varchar;
  ALTER TABLE "truck_cfg_all" ADD CONSTRAINT "truck_cfg_all_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_any" ADD CONSTRAINT "truck_cfg_any_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_none" ADD CONSTRAINT "truck_cfg_none_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_specs" ADD CONSTRAINT "truck_cfg_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_specs_locales" ADD CONSTRAINT "truck_cfg_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_options" ADD CONSTRAINT "truck_cfg_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_options_locales" ADD CONSTRAINT "truck_cfg_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_groups" ADD CONSTRAINT "truck_cfg_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_groups_locales" ADD CONSTRAINT "truck_cfg_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_steps" ADD CONSTRAINT "truck_cfg_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_cfg_steps_locales" ADD CONSTRAINT "truck_cfg_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_cfg_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_all_v" ADD CONSTRAINT "_truck_cfg_all_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_any_v" ADD CONSTRAINT "_truck_cfg_any_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_none_v" ADD CONSTRAINT "_truck_cfg_none_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_specs_v" ADD CONSTRAINT "_truck_cfg_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_specs_v_locales" ADD CONSTRAINT "_truck_cfg_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_options_v" ADD CONSTRAINT "_truck_cfg_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_options_v_locales" ADD CONSTRAINT "_truck_cfg_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_groups_v" ADD CONSTRAINT "_truck_cfg_groups_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_groups_v_locales" ADD CONSTRAINT "_truck_cfg_groups_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_steps_v" ADD CONSTRAINT "_truck_cfg_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_cfg_steps_v_locales" ADD CONSTRAINT "_truck_cfg_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_cfg_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_cfg_all_order_idx" ON "truck_cfg_all" USING btree ("_order");
  CREATE INDEX "truck_cfg_all_parent_id_idx" ON "truck_cfg_all" USING btree ("_parent_id");
  CREATE INDEX "truck_cfg_any_order_idx" ON "truck_cfg_any" USING btree ("_order");
  CREATE INDEX "truck_cfg_any_parent_id_idx" ON "truck_cfg_any" USING btree ("_parent_id");
  CREATE INDEX "truck_cfg_none_order_idx" ON "truck_cfg_none" USING btree ("_order");
  CREATE INDEX "truck_cfg_none_parent_id_idx" ON "truck_cfg_none" USING btree ("_parent_id");
  CREATE INDEX "truck_cfg_specs_order_idx" ON "truck_cfg_specs" USING btree ("_order");
  CREATE INDEX "truck_cfg_specs_parent_id_idx" ON "truck_cfg_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_cfg_specs_locales_locale_parent_id_unique" ON "truck_cfg_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_cfg_options_order_idx" ON "truck_cfg_options" USING btree ("_order");
  CREATE INDEX "truck_cfg_options_parent_id_idx" ON "truck_cfg_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_cfg_options_locales_locale_parent_id_unique" ON "truck_cfg_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_cfg_groups_order_idx" ON "truck_cfg_groups" USING btree ("_order");
  CREATE INDEX "truck_cfg_groups_parent_id_idx" ON "truck_cfg_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_cfg_groups_locales_locale_parent_id_unique" ON "truck_cfg_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_cfg_steps_order_idx" ON "truck_cfg_steps" USING btree ("_order");
  CREATE INDEX "truck_cfg_steps_parent_id_idx" ON "truck_cfg_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_cfg_steps_locales_locale_parent_id_unique" ON "truck_cfg_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_cfg_all_v_order_idx" ON "_truck_cfg_all_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_all_v_parent_id_idx" ON "_truck_cfg_all_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_cfg_any_v_order_idx" ON "_truck_cfg_any_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_any_v_parent_id_idx" ON "_truck_cfg_any_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_cfg_none_v_order_idx" ON "_truck_cfg_none_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_none_v_parent_id_idx" ON "_truck_cfg_none_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_cfg_specs_v_order_idx" ON "_truck_cfg_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_specs_v_parent_id_idx" ON "_truck_cfg_specs_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_cfg_specs_v_locales_locale_parent_id_unique" ON "_truck_cfg_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_cfg_options_v_order_idx" ON "_truck_cfg_options_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_options_v_parent_id_idx" ON "_truck_cfg_options_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_cfg_options_v_locales_locale_parent_id_unique" ON "_truck_cfg_options_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_cfg_groups_v_order_idx" ON "_truck_cfg_groups_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_groups_v_parent_id_idx" ON "_truck_cfg_groups_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_cfg_groups_v_locales_locale_parent_id_unique" ON "_truck_cfg_groups_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_cfg_steps_v_order_idx" ON "_truck_cfg_steps_v" USING btree ("_order");
  CREATE INDEX "_truck_cfg_steps_v_parent_id_idx" ON "_truck_cfg_steps_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_cfg_steps_v_locales_locale_parent_id_unique" ON "_truck_cfg_steps_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "truck_families" DROP COLUMN "configurable";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_type";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_url";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_new_tab";
  ALTER TABLE "truck_families_locales" DROP COLUMN "singular_name";
  ALTER TABLE "truck_families_locales" DROP COLUMN "contact_link_label";
  ALTER TABLE "truck_families_locales" DROP COLUMN "model_choice_label";
  ALTER TABLE "truck_families_locales" DROP COLUMN "model_choice_heading";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_configurable";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_type";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_url";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_new_tab";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_singular_name";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_contact_link_label";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_model_choice_label";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_model_choice_heading";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "truck_specs_id";
  ALTER TABLE "header_nav_items" DROP COLUMN "source";
  ALTER TABLE "_header_v_version_nav_items" DROP COLUMN "source";
  ALTER TABLE "footer_link_groups" DROP COLUMN "source";
  ALTER TABLE "_footer_v_version_link_groups" DROP COLUMN "source";
  ALTER TABLE "configurator_settings_locales" DROP COLUMN "warranty_note";
  ALTER TABLE "_configurator_settings_v_locales" DROP COLUMN "version_warranty_note";
  DROP TYPE "public"."enum_truck_choices_selection_mode";
  DROP TYPE "public"."enum_truck_choices_display";
  DROP TYPE "public"."enum_truck_families_contact_link_type";
  DROP TYPE "public"."enum__truck_choices_v_selection_mode";
  DROP TYPE "public"."enum__truck_choices_v_display";
  DROP TYPE "public"."enum__truck_families_v_version_contact_link_type";
  DROP TYPE "public"."enum_header_nav_items_source";
  DROP TYPE "public"."enum__header_v_version_nav_items_source";
  DROP TYPE "public"."enum_footer_link_groups_source";
  DROP TYPE "public"."enum__footer_v_version_link_groups_source";`);
}
