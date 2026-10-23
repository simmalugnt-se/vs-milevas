import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_requests_status" AS ENUM('new', 'answered', 'closed');
  CREATE TYPE "public"."enum_contact_requests_locale" AS ENUM('sv', 'en');
  CREATE TYPE "public"."enum_contact_requests_email_status" AS ENUM('pending', 'sent', 'failed', 'notConfigured');
  CREATE TABLE "contact_requests" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"reference" varchar NOT NULL,
  	"idempotency_key" varchar NOT NULL,
  	"status" "enum_contact_requests_status" DEFAULT 'new' NOT NULL,
  	"locale" "enum_contact_requests_locale" NOT NULL,
  	"source_url" varchar,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"message" varchar NOT NULL,
  	"email_status" "enum_contact_requests_email_status" DEFAULT 'pending' NOT NULL,
  	"email_id" varchar,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_footer_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_requests_id" uuid;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links" ADD CONSTRAINT "_footer_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "contact_requests_reference_idx" ON "contact_requests" USING btree ("reference");
  CREATE UNIQUE INDEX "contact_requests_idempotency_key_idx" ON "contact_requests" USING btree ("idempotency_key");
  CREATE INDEX "contact_requests_updated_at_idx" ON "contact_requests" USING btree ("updated_at");
  CREATE INDEX "contact_requests_created_at_idx" ON "contact_requests" USING btree ("created_at");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_social_links_order_idx" ON "_footer_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_links_parent_id_idx" ON "_footer_v_version_social_links" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_requests_fk" FOREIGN KEY ("contact_requests_id") REFERENCES "public"."contact_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contact_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_requests_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_social_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_requests" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "_footer_v_version_social_links" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_requests_fk";
  
  DROP INDEX "payload_locked_documents_rels_contact_requests_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_requests_id";
  DROP TYPE "public"."enum_contact_requests_status";
  DROP TYPE "public"."enum_contact_requests_locale";
  DROP TYPE "public"."enum_contact_requests_email_status";`);
}
