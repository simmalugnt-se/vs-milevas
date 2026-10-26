import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- The header's button pointed at a page through the relationship tables; its rows go with it.
  DELETE FROM "header_rels" WHERE "path" LIKE 'cta.%';
  DELETE FROM "_header_v_rels" WHERE "path" LIKE 'version.cta.%';
  DELETE FROM "footer_rels" WHERE "path" LIKE 'navItems.%';
  DELETE FROM "_footer_v_rels" WHERE "path" LIKE 'version.navItems.%';
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer_nav_items_locales" CASCADE;
  DROP TABLE "_footer_v_version_nav_items" CASCADE;
  DROP TABLE "_footer_v_version_nav_items_locales" CASCADE;
  ALTER TABLE "header" DROP COLUMN "site_name";
  ALTER TABLE "header" DROP COLUMN "cta_type";
  ALTER TABLE "header" DROP COLUMN "cta_url";
  ALTER TABLE "header" DROP COLUMN "cta_new_tab";
  ALTER TABLE "header_locales" DROP COLUMN "site_tagline";
  ALTER TABLE "header_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_header_v" DROP COLUMN "version_site_name";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_type";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_url";
  ALTER TABLE "_header_v" DROP COLUMN "version_cta_new_tab";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_site_tagline";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_cta_label";
  DROP TYPE "public"."enum_header_cta_type";
  DROP TYPE "public"."enum__header_v_version_cta_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum__footer_v_version_nav_items_link_type";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_cta_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__footer_v_version_nav_items_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "footer_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"link_type" "enum__footer_v_version_nav_items_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "header" ADD COLUMN "site_name" varchar DEFAULT 'Milevas';
  ALTER TABLE "header" ADD COLUMN "cta_type" "enum_header_cta_type" DEFAULT 'internal';
  ALTER TABLE "header" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "header" ADD COLUMN "cta_new_tab" boolean;
  ALTER TABLE "header_locales" ADD COLUMN "site_tagline" varchar DEFAULT 'Boilerplate for Payload CMS and Next.js.';
  ALTER TABLE "header_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_site_name" varchar DEFAULT 'Milevas';
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_type" "enum__header_v_version_cta_type" DEFAULT 'internal';
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_url" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_cta_new_tab" boolean;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_site_tagline" varchar DEFAULT 'Boilerplate for Payload CMS and Next.js.';
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_cta_label" varchar;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_locales" ADD CONSTRAINT "footer_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_nav_items" ADD CONSTRAINT "_footer_v_version_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_nav_items_locales" ADD CONSTRAINT "_footer_v_version_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_nav_items_locales_locale_parent_id_unique" ON "footer_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_nav_items_order_idx" ON "_footer_v_version_nav_items" USING btree ("_order");
  CREATE INDEX "_footer_v_version_nav_items_parent_id_idx" ON "_footer_v_version_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_nav_items_locales_locale_parent_id_unique" ON "_footer_v_version_nav_items_locales" USING btree ("_locale","_parent_id");`);
}
