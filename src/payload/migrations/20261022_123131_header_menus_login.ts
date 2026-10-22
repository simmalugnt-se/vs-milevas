import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * The Header global as Figma's navigation: each menu (`navItems`) gets its links, each with an
 * image, and an image; `login` is the login link with a short label. Only adds tables and columns.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_nav_items_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_header_login_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_nav_items_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_login_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "header_nav_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"image_id" uuid
  );
  
  CREATE TABLE "header_nav_items_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_header_v_version_nav_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"link_type" "enum__header_v_version_nav_items_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"image_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v_version_nav_items_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "header_nav_items" ADD COLUMN "image_id" uuid;
  ALTER TABLE "header" ADD COLUMN "login_link_type" "enum_header_login_link_type" DEFAULT 'internal';
  ALTER TABLE "header" ADD COLUMN "login_link_url" varchar;
  ALTER TABLE "header" ADD COLUMN "login_link_new_tab" boolean;
  ALTER TABLE "header_locales" ADD COLUMN "login_link_label" varchar;
  ALTER TABLE "header_locales" ADD COLUMN "login_short_label" varchar;
  ALTER TABLE "_header_v_version_nav_items" ADD COLUMN "image_id" uuid;
  ALTER TABLE "_header_v" ADD COLUMN "version_login_link_type" "enum__header_v_version_login_link_type" DEFAULT 'internal';
  ALTER TABLE "_header_v" ADD COLUMN "version_login_link_url" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_login_link_new_tab" boolean;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_login_link_label" varchar;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_login_short_label" varchar;
  ALTER TABLE "header_nav_items_links" ADD CONSTRAINT "header_nav_items_links_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items_links" ADD CONSTRAINT "header_nav_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_links_locales" ADD CONSTRAINT "header_nav_items_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items_links" ADD CONSTRAINT "_header_v_version_nav_items_links_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items_links" ADD CONSTRAINT "_header_v_version_nav_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items_links_locales" ADD CONSTRAINT "_header_v_version_nav_items_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_nav_items_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_links_order_idx" ON "header_nav_items_links" USING btree ("_order");
  CREATE INDEX "header_nav_items_links_parent_id_idx" ON "header_nav_items_links" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_links_image_idx" ON "header_nav_items_links" USING btree ("image_id");
  CREATE UNIQUE INDEX "header_nav_items_links_locales_locale_parent_id_unique" ON "header_nav_items_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_header_v_version_nav_items_links_order_idx" ON "_header_v_version_nav_items_links" USING btree ("_order");
  CREATE INDEX "_header_v_version_nav_items_links_parent_id_idx" ON "_header_v_version_nav_items_links" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_nav_items_links_image_idx" ON "_header_v_version_nav_items_links" USING btree ("image_id");
  CREATE UNIQUE INDEX "_header_v_version_nav_items_links_locales_locale_parent_id_u" ON "_header_v_version_nav_items_links_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items" ADD CONSTRAINT "_header_v_version_nav_items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_nav_items_image_idx" ON "header_nav_items" USING btree ("image_id");
  CREATE INDEX "_header_v_version_nav_items_image_idx" ON "_header_v_version_nav_items" USING btree ("image_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_nav_items_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_nav_items_links_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_nav_items_links" CASCADE;
  DROP TABLE "header_nav_items_links_locales" CASCADE;
  DROP TABLE "_header_v_version_nav_items_links" CASCADE;
  DROP TABLE "_header_v_version_nav_items_links_locales" CASCADE;
  ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_nav_items_image_id_images_id_fk";
  
  ALTER TABLE "_header_v_version_nav_items" DROP CONSTRAINT "_header_v_version_nav_items_image_id_images_id_fk";
  
  DROP INDEX "header_nav_items_image_idx";
  DROP INDEX "_header_v_version_nav_items_image_idx";
  ALTER TABLE "header_nav_items" DROP COLUMN "image_id";
  ALTER TABLE "header" DROP COLUMN "login_link_type";
  ALTER TABLE "header" DROP COLUMN "login_link_url";
  ALTER TABLE "header" DROP COLUMN "login_link_new_tab";
  ALTER TABLE "header_locales" DROP COLUMN "login_link_label";
  ALTER TABLE "header_locales" DROP COLUMN "login_short_label";
  ALTER TABLE "_header_v_version_nav_items" DROP COLUMN "image_id";
  ALTER TABLE "_header_v" DROP COLUMN "version_login_link_type";
  ALTER TABLE "_header_v" DROP COLUMN "version_login_link_url";
  ALTER TABLE "_header_v" DROP COLUMN "version_login_link_new_tab";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_login_link_label";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_login_short_label";
  DROP TYPE "public"."enum_header_nav_items_links_link_type";
  DROP TYPE "public"."enum_header_login_link_type";
  DROP TYPE "public"."enum__header_v_version_nav_items_links_link_type";
  DROP TYPE "public"."enum__header_v_version_login_link_type";`);
}
