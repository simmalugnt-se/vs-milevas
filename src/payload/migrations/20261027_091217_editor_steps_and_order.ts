import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The configurator settings get the steps' names and the order of those after the variants, and
 * truck types are ordered by dragging (Payload's `orderable`, a fractional index in `_order`)
 * instead of a number. The fractional keys "a0", "a1" … keep the order the numbers gave; every
 * version gets its document's.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_configurator_settings_steps_step" AS ENUM('battery', 'lift-height', 'extras');
  CREATE TYPE "public"."enum__configurator_settings_v_version_steps_step" AS ENUM('battery', 'lift-height', 'extras');
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
  
  ALTER TABLE "truck_families" ADD COLUMN "_order" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "configurator_settings_locales" ADD COLUMN "model_step_label" varchar DEFAULT 'Lyftkapacitet';
  ALTER TABLE "_configurator_settings_v_locales" ADD COLUMN "version_model_step_label" varchar DEFAULT 'Lyftkapacitet';
  ALTER TABLE "configurator_settings_steps" ADD CONSTRAINT "configurator_settings_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_settings_steps_locales" ADD CONSTRAINT "configurator_settings_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_steps" ADD CONSTRAINT "_configurator_settings_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_version_steps_locales" ADD CONSTRAINT "_configurator_settings_v_version_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "configurator_settings_steps_order_idx" ON "configurator_settings_steps" USING btree ("_order");
  CREATE INDEX "configurator_settings_steps_parent_id_idx" ON "configurator_settings_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configurator_settings_steps_locales_locale_parent_id_unique" ON "configurator_settings_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_configurator_settings_v_version_steps_order_idx" ON "_configurator_settings_v_version_steps" USING btree ("_order");
  CREATE INDEX "_configurator_settings_v_version_steps_parent_id_idx" ON "_configurator_settings_v_version_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_configurator_settings_v_version_steps_locales_locale_parent" ON "_configurator_settings_v_version_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_families__order_idx" ON "truck_families" USING btree ("_order");
  CREATE INDEX "_truck_families_v_version_version__order_idx" ON "_truck_families_v" USING btree ("version__order");
  UPDATE "truck_families" AS t SET "_order" = 'a' || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', r.n::int, 1)
    FROM (SELECT "id", row_number() OVER (ORDER BY "sort_order", "created_at") AS n FROM "truck_families") AS r
    WHERE t."id" = r."id";
  UPDATE "_truck_families_v" AS v SET "version__order" = t."_order" FROM "truck_families" AS t WHERE v."parent_id" = t."id";
  ALTER TABLE "truck_families" DROP COLUMN "sort_order";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_sort_order";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_settings_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_settings_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_configurator_settings_v_version_steps_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "configurator_settings_steps" CASCADE;
  DROP TABLE "configurator_settings_steps_locales" CASCADE;
  DROP TABLE "_configurator_settings_v_version_steps" CASCADE;
  DROP TABLE "_configurator_settings_v_version_steps_locales" CASCADE;
  DROP INDEX "truck_families__order_idx";
  DROP INDEX "_truck_families_v_version_version__order_idx";
  ALTER TABLE "truck_families" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_sort_order" numeric DEFAULT 0;
  UPDATE "truck_families" AS t SET "sort_order" = r.n * 10
    FROM (SELECT "id", row_number() OVER (ORDER BY "_order" COLLATE "C", "created_at") AS n FROM "truck_families") AS r
    WHERE t."id" = r."id";
  UPDATE "_truck_families_v" AS v SET "version_sort_order" = t."sort_order" FROM "truck_families" AS t WHERE v."parent_id" = t."id";
  ALTER TABLE "truck_families" DROP COLUMN "_order";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version__order";
  ALTER TABLE "configurator_settings_locales" DROP COLUMN "model_step_label";
  ALTER TABLE "_configurator_settings_v_locales" DROP COLUMN "version_model_step_label";
  DROP TYPE "public"."enum_configurator_settings_steps_step";
  DROP TYPE "public"."enum__configurator_settings_v_version_steps_step";`)
}
