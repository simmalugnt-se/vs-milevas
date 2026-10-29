/** "Text" on a truck type's series, shown on the series' card in the configurator. */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "truck_family_series_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_truck_family_series_v_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "truck_family_series_locales" ADD CONSTRAINT "truck_family_series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_family_series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_family_series_v_locales" ADD CONSTRAINT "_truck_family_series_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_family_series_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "truck_family_series_locales_locale_parent_id_unique" ON "truck_family_series_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_truck_family_series_v_locales_locale_parent_id_unique" ON "_truck_family_series_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "truck_family_series_locales" CASCADE;
  DROP TABLE "_truck_family_series_v_locales" CASCADE;`)
}
