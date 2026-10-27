import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";
import { quoteFields } from "@/features/configurator/request-fields";
import type { ConfiguratorRequestSnapshot } from "@/features/configurator/types";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_configurator_requests_lines_kind" AS ENUM('base', 'option', 'service');
  CREATE TYPE "public"."enum_dealers_status" AS ENUM('pending', 'accepted', 'rejected');
  CREATE TABLE "configurator_requests_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"price" numeric,
  	"dealer_price" numeric,
  	"kind" "enum_configurator_requests_lines_kind"
  );
  
  CREATE TABLE "configurator_requests_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "dealers" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"status" "enum_dealers_status" DEFAULT 'pending' NOT NULL,
  	"company" varchar NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "configurator_requests" ADD COLUMN "dealer_id" uuid;
  ALTER TABLE "configurator_requests" ADD COLUMN "family_name" varchar;
  ALTER TABLE "configurator_requests" ADD COLUMN "model" varchar;
  ALTER TABLE "configurator_requests" ADD COLUMN "sku" varchar;
  ALTER TABLE "configurator_requests" ADD COLUMN "complete" boolean;
  ALTER TABLE "configurator_requests" ADD COLUMN "total_price" numeric;
  ALTER TABLE "configurator_requests" ADD COLUMN "dealer_total_price" numeric;
  ALTER TABLE "configurator_requests" ADD COLUMN "financing_label" varchar;
  ALTER TABLE "configurator_requests" ADD COLUMN "financing_price" numeric;
  ALTER TABLE "configurator_requests" ADD COLUMN "financing_monthly" boolean;
  ALTER TABLE "configurator_requests" ADD COLUMN "delivery_time" varchar;
  ALTER TABLE "configurator_requests" ADD COLUMN "warranty" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "dealers_id" uuid;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "dealers_id" uuid;
  ALTER TABLE "configurator_settings" ADD COLUMN "dealer_discount_percent" numeric DEFAULT 0;
  ALTER TABLE "_configurator_settings_v" ADD COLUMN "version_dealer_discount_percent" numeric DEFAULT 0;
  ALTER TABLE "configurator_requests_lines" ADD CONSTRAINT "configurator_requests_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurator_requests_specifications" ADD CONSTRAINT "configurator_requests_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurator_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "configurator_requests_lines_order_idx" ON "configurator_requests_lines" USING btree ("_order");
  CREATE INDEX "configurator_requests_lines_parent_id_idx" ON "configurator_requests_lines" USING btree ("_parent_id");
  CREATE INDEX "configurator_requests_specifications_order_idx" ON "configurator_requests_specifications" USING btree ("_order");
  CREATE INDEX "configurator_requests_specifications_parent_id_idx" ON "configurator_requests_specifications" USING btree ("_parent_id");
  CREATE INDEX "dealers_updated_at_idx" ON "dealers" USING btree ("updated_at");
  CREATE INDEX "dealers_created_at_idx" ON "dealers" USING btree ("created_at");
  CREATE UNIQUE INDEX "dealers_email_idx" ON "dealers" USING btree ("email");
  ALTER TABLE "configurator_requests" ADD CONSTRAINT "configurator_requests_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dealers_fk" FOREIGN KEY ("dealers_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_dealers_fk" FOREIGN KEY ("dealers_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "configurator_requests_dealer_idx" ON "configurator_requests" USING btree ("dealer_id");
  CREATE INDEX "payload_locked_documents_rels_dealers_id_idx" ON "payload_locked_documents_rels" USING btree ("dealers_id");
  CREATE INDEX "payload_preferences_rels_dealers_id_idx" ON "payload_preferences_rels" USING btree ("dealers_id");`);

  // Requests sent so far get the readable fields from the quote they keep in `snapshot`.
  const requests = await payload.find({
    collection: "configurator-requests",
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
  });
  for (const request of requests.docs) {
    const snapshot = request.snapshot as ConfiguratorRequestSnapshot | null;
    if (!snapshot?.quote?.lines) continue;
    await payload.update({
      collection: "configurator-requests",
      id: request.id,
      data: quoteFields(snapshot.quote),
      overrideAccess: true,
      req,
    });
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "configurator_requests_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "configurator_requests_specifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dealers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "configurator_requests_lines" CASCADE;
  DROP TABLE "configurator_requests_specifications" CASCADE;
  DROP TABLE "dealers" CASCADE;
  ALTER TABLE "configurator_requests" DROP CONSTRAINT "configurator_requests_dealer_id_dealers_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_dealers_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_dealers_fk";
  
  DROP INDEX "configurator_requests_dealer_idx";
  DROP INDEX "payload_locked_documents_rels_dealers_id_idx";
  DROP INDEX "payload_preferences_rels_dealers_id_idx";
  ALTER TABLE "configurator_requests" DROP COLUMN "dealer_id";
  ALTER TABLE "configurator_requests" DROP COLUMN "family_name";
  ALTER TABLE "configurator_requests" DROP COLUMN "model";
  ALTER TABLE "configurator_requests" DROP COLUMN "sku";
  ALTER TABLE "configurator_requests" DROP COLUMN "complete";
  ALTER TABLE "configurator_requests" DROP COLUMN "total_price";
  ALTER TABLE "configurator_requests" DROP COLUMN "dealer_total_price";
  ALTER TABLE "configurator_requests" DROP COLUMN "financing_label";
  ALTER TABLE "configurator_requests" DROP COLUMN "financing_price";
  ALTER TABLE "configurator_requests" DROP COLUMN "financing_monthly";
  ALTER TABLE "configurator_requests" DROP COLUMN "delivery_time";
  ALTER TABLE "configurator_requests" DROP COLUMN "warranty";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "dealers_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "dealers_id";
  ALTER TABLE "configurator_settings" DROP COLUMN "dealer_discount_percent";
  ALTER TABLE "_configurator_settings_v" DROP COLUMN "version_dealer_discount_percent";
  DROP TYPE "public"."enum_configurator_requests_lines_kind";
  DROP TYPE "public"."enum_dealers_status";`);
}
