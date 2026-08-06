import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_cfg_options_price_mode" AS ENUM('included', 'add', 'replaceBase');
  CREATE TYPE "public"."enum_truck_cfg_groups_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum_truck_families_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__truck_cfg_options_v_price_mode" AS ENUM('included', 'add', 'replaceBase');
  CREATE TYPE "public"."enum__truck_cfg_groups_v_selection_mode" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum__truck_families_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__truck_families_v_published_locale" AS ENUM('en', 'sv');
  CREATE TYPE "public"."enum_configurator_requests_request_type" AS ENUM('order', 'call');
  CREATE TYPE "public"."enum_configurator_requests_status" AS ENUM('new', 'contacted', 'processing', 'completed', 'rejected');
  CREATE TYPE "public"."enum_configurator_requests_locale" AS ENUM('sv', 'en');
  CREATE TYPE "public"."enum_configurator_requests_call_preference" AS ENUM('asap', 'specific');
  CREATE TYPE "public"."enum_configurator_requests_email_status" AS ENUM('pending', 'sent', 'failed', 'notConfigured');
  CREATE TYPE "public"."enum_configurator_settings_financing_methods_kind" AS ENUM('purchase', 'monthly');
  CREATE TYPE "public"."enum_configurator_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__configurator_settings_v_version_financing_methods_kind" AS ENUM('purchase', 'monthly');
  CREATE TYPE "public"."enum__configurator_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__configurator_settings_v_published_locale" AS ENUM('en', 'sv');
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_families" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"base_price" numeric,
  	"sku" varchar,
  	"image_id" uuid,
  	"brochure_id" uuid,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_truck_families_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "truck_families_locales" (
  	"name" varchar,
  	"description" varchar,
  	"delivery_time" varchar,
  	"warranty" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_families_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_key" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_base_price" numeric,
  	"version_sku" varchar,
  	"version_image_id" uuid,
  	"version_brochure_id" uuid,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__truck_families_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__truck_families_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_truck_families_v_locales" (
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_delivery_time" varchar,
  	"version_warranty" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "configurator_requests" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"reference" varchar NOT NULL,
  	"idempotency_key" varchar NOT NULL,
  	"request_type" "enum_configurator_requests_request_type" NOT NULL,
  	"status" "enum_configurator_requests_status" DEFAULT 'new' NOT NULL,
  	"locale" "enum_configurator_requests_locale" NOT NULL,
  	"source_url" varchar,
  	"contact_company" varchar,
  	"contact_organization_number" varchar,
  	"contact_name" varchar NOT NULL,
  	"contact_email" varchar,
  	"contact_phone" varchar NOT NULL,
  	"call_preference" "enum_configurator_requests_call_preference",
  	"preferred_time" varchar,
  	"message" varchar,
  	"snapshot" jsonb NOT NULL,
  	"email_status" "enum_configurator_requests_email_status" DEFAULT 'pending' NOT NULL,
  	"sales_email_id" varchar,
  	"customer_email_id" varchar,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configurator_settings_financing_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"kind" "enum_configurator_settings_financing_methods_kind",
  	"months" numeric,
  	"monthly_factor" numeric
  );
  
  CREATE TABLE "configurator_settings_financing_methods_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "configurator_settings" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"quote_validity_days" numeric DEFAULT 14,
  	"_status" "enum_configurator_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_configurator_settings_v_version_financing_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"kind" "enum__configurator_settings_v_version_financing_methods_kind",
  	"months" numeric,
  	"monthly_factor" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_configurator_settings_v_version_financing_methods_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_configurator_settings_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"version_quote_validity_days" numeric DEFAULT 14,
  	"version__status" "enum__configurator_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__configurator_settings_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "truck_families_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "configurator_requests_id" uuid;
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
  ALTER TABLE "truck_families" ADD CONSTRAINT "truck_families_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_families" ADD CONSTRAINT "truck_families_brochure_id_documents_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_families_locales" ADD CONSTRAINT "truck_families_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_parent_id_truck_families_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."truck_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_version_brochure_id_documents_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v_locales" ADD CONSTRAINT "_truck_families_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_financing_methods" ADD CONSTRAINT "configurator_settings_financing_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_financing_methods_locales" ADD CONSTRAINT "configurator_settings_financing_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD CONSTRAINT "_configurator_settings_v_version_financing_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_financing_methods_locales" ADD CONSTRAINT "_configurator_settings_v_version_financing_methods_locale_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_financing_methods"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "truck_families_image_idx" ON "truck_families" USING btree ("image_id");
  CREATE INDEX "truck_families_brochure_idx" ON "truck_families" USING btree ("brochure_id");
  CREATE INDEX "truck_families_updated_at_idx" ON "truck_families" USING btree ("updated_at");
  CREATE INDEX "truck_families_created_at_idx" ON "truck_families" USING btree ("created_at");
  CREATE INDEX "truck_families__status_idx" ON "truck_families" USING btree ("_status");
  CREATE UNIQUE INDEX "truck_families_locales_locale_parent_id_unique" ON "truck_families_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "_truck_families_v_parent_idx" ON "_truck_families_v" USING btree ("parent_id");
  CREATE INDEX "_truck_families_v_version_version_image_idx" ON "_truck_families_v" USING btree ("version_image_id");
  CREATE INDEX "_truck_families_v_version_version_brochure_idx" ON "_truck_families_v" USING btree ("version_brochure_id");
  CREATE INDEX "_truck_families_v_version_version_updated_at_idx" ON "_truck_families_v" USING btree ("version_updated_at");
  CREATE INDEX "_truck_families_v_version_version_created_at_idx" ON "_truck_families_v" USING btree ("version_created_at");
  CREATE INDEX "_truck_families_v_version_version__status_idx" ON "_truck_families_v" USING btree ("version__status");
  CREATE INDEX "_truck_families_v_created_at_idx" ON "_truck_families_v" USING btree ("created_at");
  CREATE INDEX "_truck_families_v_updated_at_idx" ON "_truck_families_v" USING btree ("updated_at");
  CREATE INDEX "_truck_families_v_snapshot_idx" ON "_truck_families_v" USING btree ("snapshot");
  CREATE INDEX "_truck_families_v_published_locale_idx" ON "_truck_families_v" USING btree ("published_locale");
  CREATE INDEX "_truck_families_v_latest_idx" ON "_truck_families_v" USING btree ("latest");
  CREATE INDEX "_truck_families_v_autosave_idx" ON "_truck_families_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_truck_families_v_locales_locale_parent_id_unique" ON "_truck_families_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "configurator_requests_reference_idx" ON "configurator_requests" USING btree ("reference");
  CREATE UNIQUE INDEX "configurator_requests_idempotency_key_idx" ON "configurator_requests" USING btree ("idempotency_key");
  CREATE INDEX "configurator_requests_updated_at_idx" ON "configurator_requests" USING btree ("updated_at");
  CREATE INDEX "configurator_requests_created_at_idx" ON "configurator_requests" USING btree ("created_at");
  CREATE INDEX "configurator_settings_financing_methods_order_idx" ON "configurator_settings_financing_methods" USING btree ("_order");
  CREATE INDEX "configurator_settings_financing_methods_parent_id_idx" ON "configurator_settings_financing_methods" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configurator_settings_financing_methods_locales_locale_paren" ON "configurator_settings_financing_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "configurator_settings__status_idx" ON "configurator_settings" USING btree ("_status");
  CREATE INDEX "_configurator_settings_v_version_financing_methods_order_idx" ON "_configurator_settings_v_version_financing_methods" USING btree ("_order");
  CREATE INDEX "_configurator_settings_v_version_financing_methods_parent_id_idx" ON "_configurator_settings_v_version_financing_methods" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_configurator_settings_v_version_financing_methods_locales_l" ON "_configurator_settings_v_version_financing_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_configurator_settings_v_version_version__status_idx" ON "_configurator_settings_v" USING btree ("version__status");
  CREATE INDEX "_configurator_settings_v_created_at_idx" ON "_configurator_settings_v" USING btree ("created_at");
  CREATE INDEX "_configurator_settings_v_updated_at_idx" ON "_configurator_settings_v" USING btree ("updated_at");
  CREATE INDEX "_configurator_settings_v_snapshot_idx" ON "_configurator_settings_v" USING btree ("snapshot");
  CREATE INDEX "_configurator_settings_v_published_locale_idx" ON "_configurator_settings_v" USING btree ("published_locale");
  CREATE INDEX "_configurator_settings_v_latest_idx" ON "_configurator_settings_v" USING btree ("latest");
  CREATE INDEX "_configurator_settings_v_autosave_idx" ON "_configurator_settings_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_truck_families_fk" FOREIGN KEY ("truck_families_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_configurator_requests_fk" FOREIGN KEY ("configurator_requests_id") REFERENCES "public"."configurator_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_truck_families_id_idx" ON "payload_locked_documents_rels" USING btree ("truck_families_id");
  CREATE INDEX "payload_locked_documents_rels_configurator_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("configurator_requests_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "truck_families" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_families_locales" DISABLE ROW LEVEL SECURITY;
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
  ALTER TABLE "_truck_families_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_families_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_financing_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_financing_methods_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_financing_methods_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v" DISABLE ROW LEVEL SECURITY;
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
  DROP TABLE "truck_families" CASCADE;
  DROP TABLE "truck_families_locales" CASCADE;
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
  DROP TABLE "_truck_families_v" CASCADE;
  DROP TABLE "_truck_families_v_locales" CASCADE;
  DROP TABLE "configurator_requests" CASCADE;
  DROP TABLE "configurator_settings_financing_methods" CASCADE;
  DROP TABLE "configurator_settings_financing_methods_locales" CASCADE;
  DROP TABLE "configurator_settings" CASCADE;
  DROP TABLE "_configurator_settings_v_version_financing_methods" CASCADE;
  DROP TABLE "_configurator_settings_v_version_financing_methods_locales" CASCADE;
  DROP TABLE "_configurator_settings_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_truck_families_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_configurator_requests_fk";
  
  DROP INDEX "payload_locked_documents_rels_truck_families_id_idx";
  DROP INDEX "payload_locked_documents_rels_configurator_requests_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "truck_families_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "configurator_requests_id";
  DROP TYPE "public"."enum_truck_cfg_options_price_mode";
  DROP TYPE "public"."enum_truck_cfg_groups_selection_mode";
  DROP TYPE "public"."enum_truck_families_status";
  DROP TYPE "public"."enum__truck_cfg_options_v_price_mode";
  DROP TYPE "public"."enum__truck_cfg_groups_v_selection_mode";
  DROP TYPE "public"."enum__truck_families_v_version_status";
  DROP TYPE "public"."enum__truck_families_v_published_locale";
  DROP TYPE "public"."enum_configurator_requests_request_type";
  DROP TYPE "public"."enum_configurator_requests_status";
  DROP TYPE "public"."enum_configurator_requests_locale";
  DROP TYPE "public"."enum_configurator_requests_call_preference";
  DROP TYPE "public"."enum_configurator_requests_email_status";
  DROP TYPE "public"."enum_configurator_settings_financing_methods_kind";
  DROP TYPE "public"."enum_configurator_settings_status";
  DROP TYPE "public"."enum__configurator_settings_v_version_financing_methods_kind";
  DROP TYPE "public"."enum__configurator_settings_v_version_status";
  DROP TYPE "public"."enum__configurator_settings_v_published_locale";`);
}
