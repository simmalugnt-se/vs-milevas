import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "configurator_settings_locales" (
  	"service_agreement_label" varchar DEFAULT 'Serviceavtal',
  	"service_agreement_description" varchar DEFAULT 'Årlig kostnad. Faktureras separat.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_configurator_settings_v_locales" (
  	"version_service_agreement_label" varchar DEFAULT 'Serviceavtal',
  	"version_service_agreement_description" varchar DEFAULT 'Årlig kostnad. Faktureras separat.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "configurator_requests" ADD COLUMN "service_agreement_selected" boolean DEFAULT false;
  ALTER TABLE "configurator_requests" ADD COLUMN "service_agreement_annual_price" numeric;
  ALTER TABLE "configurator_settings_financing_methods" ADD COLUMN "service_agreement_eligible" boolean DEFAULT false;
  ALTER TABLE "configurator_settings" ADD COLUMN "service_agreement_annual_price" numeric DEFAULT 2856;
  ALTER TABLE "_configurator_settings_v_version_financing_methods" ADD COLUMN "service_agreement_eligible" boolean DEFAULT false;
  ALTER TABLE "_configurator_settings_v" ADD COLUMN "version_service_agreement_annual_price" numeric DEFAULT 2856;
  ALTER TABLE "configurator_settings_locales" ADD CONSTRAINT "configurator_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_configurator_settings_v_locales" ADD CONSTRAINT "_configurator_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_configurator_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "configurator_settings_locales_locale_parent_id_unique" ON "configurator_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_configurator_settings_v_locales_locale_parent_id_unique" ON "_configurator_settings_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "configurator_settings_locales" CASCADE;
  DROP TABLE "_configurator_settings_v_locales" CASCADE;
  ALTER TABLE "configurator_requests" DROP COLUMN "service_agreement_selected";
  ALTER TABLE "configurator_requests" DROP COLUMN "service_agreement_annual_price";
  ALTER TABLE "configurator_settings_financing_methods" DROP COLUMN "service_agreement_eligible";
  ALTER TABLE "configurator_settings" DROP COLUMN "service_agreement_annual_price";
  ALTER TABLE "_configurator_settings_v_version_financing_methods" DROP COLUMN "service_agreement_eligible";
  ALTER TABLE "_configurator_settings_v" DROP COLUMN "version_service_agreement_annual_price";`)
}
