import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * The Footer global as Figma's footer: link columns (`linkGroups`) and the contact column's
 * heading, phone and location; the copyright gets Figma's text as default. Only adds.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_link_groups_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__footer_v_version_link_groups_links_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "footer_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_link_groups_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean
  );
  
  CREATE TABLE "footer_link_groups_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_link_groups_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"link_type" "enum__footer_v_version_link_groups_links_link_type" DEFAULT 'internal',
  	"link_url" varchar,
  	"link_new_tab" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_link_groups_links_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_link_groups_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "footer_locales" ALTER COLUMN "copyright" SET DEFAULT 'Milevas AB. Alla rättigheter förbehållna.';
  ALTER TABLE "_footer_v_locales" ALTER COLUMN "version_copyright" SET DEFAULT 'Milevas AB. Alla rättigheter förbehållna.';
  ALTER TABLE "footer" ADD COLUMN "phone" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "contact_heading" varchar DEFAULT 'Kontakt';
  ALTER TABLE "footer_locales" ADD COLUMN "location" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_phone" varchar;
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_contact_heading" varchar DEFAULT 'Kontakt';
  ALTER TABLE "_footer_v_locales" ADD COLUMN "version_location" varchar;
  ALTER TABLE "footer_link_groups_links" ADD CONSTRAINT "footer_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_link_groups_links_locales" ADD CONSTRAINT "footer_link_groups_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_groups_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_link_groups" ADD CONSTRAINT "footer_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_link_groups_locales" ADD CONSTRAINT "footer_link_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups_links" ADD CONSTRAINT "_footer_v_version_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups_links_locales" ADD CONSTRAINT "_footer_v_version_link_groups_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_link_groups_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups" ADD CONSTRAINT "_footer_v_version_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_link_groups_locales" ADD CONSTRAINT "_footer_v_version_link_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_link_groups_links_order_idx" ON "footer_link_groups_links" USING btree ("_order");
  CREATE INDEX "footer_link_groups_links_parent_id_idx" ON "footer_link_groups_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_link_groups_links_locales_locale_parent_id_unique" ON "footer_link_groups_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_link_groups_order_idx" ON "footer_link_groups" USING btree ("_order");
  CREATE INDEX "footer_link_groups_parent_id_idx" ON "footer_link_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_link_groups_locales_locale_parent_id_unique" ON "footer_link_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_link_groups_links_order_idx" ON "_footer_v_version_link_groups_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_link_groups_links_parent_id_idx" ON "_footer_v_version_link_groups_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_link_groups_links_locales_locale_parent_id" ON "_footer_v_version_link_groups_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_link_groups_order_idx" ON "_footer_v_version_link_groups" USING btree ("_order");
  CREATE INDEX "_footer_v_version_link_groups_parent_id_idx" ON "_footer_v_version_link_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_link_groups_locales_locale_parent_id_uniqu" ON "_footer_v_version_link_groups_locales" USING btree ("_locale","_parent_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_link_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_link_groups_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_link_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_link_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_link_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_link_groups_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_link_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_link_groups_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_link_groups_links" CASCADE;
  DROP TABLE "footer_link_groups_links_locales" CASCADE;
  DROP TABLE "footer_link_groups" CASCADE;
  DROP TABLE "footer_link_groups_locales" CASCADE;
  DROP TABLE "_footer_v_version_link_groups_links" CASCADE;
  DROP TABLE "_footer_v_version_link_groups_links_locales" CASCADE;
  DROP TABLE "_footer_v_version_link_groups" CASCADE;
  DROP TABLE "_footer_v_version_link_groups_locales" CASCADE;
  ALTER TABLE "footer_locales" ALTER COLUMN "copyright" SET DEFAULT 'Milevas';
  ALTER TABLE "_footer_v_locales" ALTER COLUMN "version_copyright" SET DEFAULT 'Milevas';
  ALTER TABLE "footer" DROP COLUMN "phone";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_heading";
  ALTER TABLE "footer_locales" DROP COLUMN "location";
  ALTER TABLE "_footer_v" DROP COLUMN "version_phone";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_contact_heading";
  ALTER TABLE "_footer_v_locales" DROP COLUMN "version_location";
  DROP TYPE "public"."enum_footer_link_groups_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_link_groups_links_link_type";`);
}
