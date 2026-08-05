import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "header_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_header_v_version_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "footer_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_locales" (
  	"copyright" varchar DEFAULT 'Payload Boilerplate',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_nav_items_locales" (
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_footer_v_locales" (
  	"version_copyright" varchar DEFAULT 'Payload Boilerplate',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "header_nav_items_locales" ADD CONSTRAINT "header_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items_locales" ADD CONSTRAINT "_header_v_version_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_locales" ADD CONSTRAINT "footer_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_nav_items_locales" ADD CONSTRAINT "_footer_v_version_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_locales" ADD CONSTRAINT "_footer_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "header_nav_items_locales_locale_parent_id_unique" ON "header_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_header_v_version_nav_items_locales_locale_parent_id_unique" ON "_header_v_version_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_nav_items_locales_locale_parent_id_unique" ON "footer_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_nav_items_locales_locale_parent_id_unique" ON "_footer_v_version_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_footer_v_locales_locale_parent_id_unique" ON "_footer_v_locales" USING btree ("_locale","_parent_id");

  INSERT INTO "header_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", 'en'::_locales, "id"
  FROM "header_nav_items"
  WHERE "link_label" IS NOT NULL;

  INSERT INTO "_header_v_version_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", 'en'::_locales, "id"
  FROM "_header_v_version_nav_items"
  WHERE "link_label" IS NOT NULL;

  INSERT INTO "footer_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", 'en'::_locales, "id"
  FROM "footer_nav_items"
  WHERE "link_label" IS NOT NULL;

  INSERT INTO "footer_locales" ("copyright", "_locale", "_parent_id")
  SELECT "copyright", 'en'::_locales, "id"
  FROM "footer"
  WHERE "copyright" IS NOT NULL;

  INSERT INTO "_footer_v_version_nav_items_locales" ("link_label", "_locale", "_parent_id")
  SELECT "link_label", 'en'::_locales, "id"
  FROM "_footer_v_version_nav_items"
  WHERE "link_label" IS NOT NULL;

  INSERT INTO "_footer_v_locales" ("version_copyright", "_locale", "_parent_id")
  SELECT "version_copyright", 'en'::_locales, "id"
  FROM "_footer_v"
  WHERE "version_copyright" IS NOT NULL;

  ALTER TABLE "header_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "_header_v_version_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "footer_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "footer" DROP COLUMN "copyright";
  ALTER TABLE "_footer_v_version_nav_items" DROP COLUMN "link_label";
  ALTER TABLE "_footer_v" DROP COLUMN "version_copyright";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_header_v_version_nav_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "footer_nav_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "copyright" varchar DEFAULT 'Payload Boilerplate';
  ALTER TABLE "_footer_v_version_nav_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_copyright" varchar DEFAULT 'Payload Boilerplate';

  UPDATE "header_nav_items" target
  SET "link_label" = source."link_label"
  FROM "header_nav_items_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  UPDATE "_header_v_version_nav_items" target
  SET "link_label" = source."link_label"
  FROM "_header_v_version_nav_items_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  UPDATE "footer_nav_items" target
  SET "link_label" = source."link_label"
  FROM "footer_nav_items_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  UPDATE "footer" target
  SET "copyright" = source."copyright"
  FROM "footer_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  UPDATE "_footer_v_version_nav_items" target
  SET "link_label" = source."link_label"
  FROM "_footer_v_version_nav_items_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  UPDATE "_footer_v" target
  SET "version_copyright" = source."version_copyright"
  FROM "_footer_v_locales" source
  WHERE target."id" = source."_parent_id" AND source."_locale" = 'en'::_locales;

  DROP TABLE "header_nav_items_locales" CASCADE;
  DROP TABLE "_header_v_version_nav_items_locales" CASCADE;
  DROP TABLE "footer_nav_items_locales" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "_footer_v_version_nav_items_locales" CASCADE;
  DROP TABLE "_footer_v_locales" CASCADE;`);
}
