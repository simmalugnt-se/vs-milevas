import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Milevas brought up to date with payload-boilerplate-v2 (2026-10-01). The boilerplate's
 * migrations from 20260812 to 20261001, ported onto this project's own schema:
 *
 * - Payload 3.90: `users.reset_password_requested_at`.
 * - Storage: `_objectkey` on the upload collections (`prefix` is already here, with its defaults).
 * - `media` becomes `images` (renamed, so rows and files stay) without the Mux field, and videos
 *   get their own collection, `videos`. Truck families point at `images`. Hero and media blocks
 *   store `{ relationTo, value }`.
 * - The header's announcement bar.
 *
 * Left out: the editor assistant's tables. The plugin is commented out in plugins/index.ts; turning
 * it on later needs its own migration.
 */

/** Where pages keep their blocks as JSON. */
const LAYOUTS = [
  ["pages", "layout"],
  ["_pages_v", "version_layout"],
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  CREATE TYPE "public"."enum_videos_status" AS ENUM('waiting', 'preparing', 'ready', 'errored', 'deleted');
  CREATE TABLE "videos" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"poster_id" uuid,
  	"poster_time" numeric,
  	"status" "enum_videos_status",
  	"upload_id" varchar,
  	"asset_id" varchar,
  	"playback_id" varchar,
  	"mp4" varchar,
  	"duration" numeric,
  	"aspect_ratio" varchar,
  	"width" numeric,
  	"height" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "videos_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  ALTER TABLE "media" RENAME TO "images";
  ALTER TABLE "media_locales" RENAME TO "images_locales";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "media_find" TO "images_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "media_create" TO "images_create";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "media_update" TO "images_update";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "media_delete" TO "images_delete";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "media_id" TO "images_id";
  ALTER TABLE "images_locales" DROP CONSTRAINT "media_locales_parent_id_fk";
  
  ALTER TABLE "pages_locales" DROP CONSTRAINT "pages_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_locales" DROP CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  ALTER TABLE "truck_families" DROP CONSTRAINT "truck_families_image_id_media_id_fk";
  ALTER TABLE "_truck_families_v" DROP CONSTRAINT "_truck_families_v_version_image_id_media_id_fk";
  
  DROP INDEX "media_updated_at_idx";
  DROP INDEX "media_created_at_idx";
  DROP INDEX "media_filename_idx";
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_locales_locale_parent_id_unique";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "videos_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "videos_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "videos_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "videos_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" uuid;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_poster_id_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos_locales" ADD CONSTRAINT "videos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "videos_poster_idx" ON "videos" USING btree ("poster_id");
  CREATE INDEX "videos_upload_id_idx" ON "videos" USING btree ("upload_id");
  CREATE INDEX "videos_asset_id_idx" ON "videos" USING btree ("asset_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_locales_locale_parent_id_unique" ON "videos_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "images_locales" ADD CONSTRAINT "images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_images_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_images_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_families" ADD CONSTRAINT "truck_families_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_version_image_id_images_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_images_fk" FOREIGN KEY ("images_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "images_updated_at_idx" ON "images" USING btree ("updated_at");
  CREATE INDEX "images_created_at_idx" ON "images" USING btree ("created_at");
  CREATE UNIQUE INDEX "images_filename_idx" ON "images" USING btree ("filename");
  CREATE INDEX "images_sizes_card_sizes_card_filename_idx" ON "images" USING btree ("sizes_card_filename");
  CREATE INDEX "images_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "images" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "images_locales_locale_parent_id_unique" ON "images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "payload_locked_documents_rels_images_id_idx" ON "payload_locked_documents_rels" USING btree ("images_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  ALTER TABLE "images_locales" DROP COLUMN "mux_video";
  CREATE TYPE "public"."enum_header_announcement_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__header_v_version_announcement_link_type" AS ENUM('internal', 'external');
  ALTER TABLE "header" ADD COLUMN "show_announcement" boolean;
  ALTER TABLE "header" ADD COLUMN "announcement_link_type" "enum_header_announcement_link_type" DEFAULT 'internal';
  ALTER TABLE "header" ADD COLUMN "announcement_link_url" varchar;
  ALTER TABLE "header" ADD COLUMN "announcement_link_new_tab" boolean;
  ALTER TABLE "header_locales" ADD COLUMN "announcement" varchar;
  ALTER TABLE "header_locales" ADD COLUMN "announcement_link_label" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_show_announcement" boolean;
  ALTER TABLE "_header_v" ADD COLUMN "version_announcement_link_type" "enum__header_v_version_announcement_link_type" DEFAULT 'internal';
  ALTER TABLE "_header_v" ADD COLUMN "version_announcement_link_url" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_announcement_link_new_tab" boolean;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_announcement" varchar;
  ALTER TABLE "_header_v_locales" ADD COLUMN "version_announcement_link_label" varchar;`);
  // Hero and media blocks take an image or a video now, stored as `{ relationTo, value }`; Hero's
  // field is `media` instead of `image`. Blocks are JSON (`blocksAsJSON`), in pages and versions.
  for (const [table, column] of LAYOUTS) {
    await db.execute(
      sql.raw(`
      UPDATE "${table}" SET "${column}" = (
        SELECT jsonb_agg(
          CASE
            WHEN block->>'blockType' = 'hero' AND block ? 'image' THEN
              (block - 'image') || CASE
                WHEN jsonb_typeof(block->'image') IN ('string', 'number')
                THEN jsonb_build_object('media', jsonb_build_object('relationTo', 'images', 'value', block->'image'))
                ELSE '{}'::jsonb
              END
            WHEN block->>'blockType' = 'media' AND jsonb_typeof(block->'media') IN ('string', 'number') THEN
              jsonb_set(block, '{media}', jsonb_build_object('relationTo', 'images', 'value', block->'media'))
            ELSE block
          END
          ORDER BY position
        )
        FROM jsonb_array_elements("${column}") WITH ORDINALITY AS item(block, position)
      )
      WHERE jsonb_typeof("${column}") = 'array';
    `),
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Blocks back to plain image ids; a video in a hero or media block has nowhere to go and is
  // left out.
  for (const [table, column] of LAYOUTS) {
    await db.execute(
      sql.raw(`
      UPDATE "${table}" SET "${column}" = (
        SELECT jsonb_agg(
          CASE
            WHEN block->>'blockType' = 'hero' AND block ? 'media' THEN
              (block - 'media') || CASE
                WHEN block->'media'->>'relationTo' = 'images'
                THEN jsonb_build_object('image', block->'media'->'value')
                ELSE '{}'::jsonb
              END
            WHEN block->>'blockType' = 'media' AND jsonb_typeof(block->'media') = 'object' THEN
              CASE
                WHEN block->'media'->>'relationTo' = 'images'
                THEN jsonb_set(block, '{media}', block->'media'->'value')
                ELSE block - 'media'
              END
            ELSE block
          END
          ORDER BY position
        )
        FROM jsonb_array_elements("${column}") WITH ORDINALITY AS item(block, position)
      )
      WHERE jsonb_typeof("${column}") = 'array';
    `),
    );
  }
  // The reverse of up, renaming back, so images keep their rows and files.
  await db.execute(sql`
  ALTER TABLE "header" DROP COLUMN "show_announcement";
  ALTER TABLE "header" DROP COLUMN "announcement_link_type";
  ALTER TABLE "header" DROP COLUMN "announcement_link_url";
  ALTER TABLE "header" DROP COLUMN "announcement_link_new_tab";
  ALTER TABLE "header_locales" DROP COLUMN "announcement";
  ALTER TABLE "header_locales" DROP COLUMN "announcement_link_label";
  ALTER TABLE "_header_v" DROP COLUMN "version_show_announcement";
  ALTER TABLE "_header_v" DROP COLUMN "version_announcement_link_type";
  ALTER TABLE "_header_v" DROP COLUMN "version_announcement_link_url";
  ALTER TABLE "_header_v" DROP COLUMN "version_announcement_link_new_tab";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_announcement";
  ALTER TABLE "_header_v_locales" DROP COLUMN "version_announcement_link_label";
  DROP TYPE "public"."enum_header_announcement_link_type";
  DROP TYPE "public"."enum__header_v_version_announcement_link_type";
  ALTER TABLE "truck_families" DROP CONSTRAINT "truck_families_image_id_images_id_fk";
  ALTER TABLE "_truck_families_v" DROP CONSTRAINT "_truck_families_v_version_image_id_images_id_fk";
  ALTER TABLE "pages_locales" DROP CONSTRAINT "pages_locales_meta_image_id_images_id_fk";
  ALTER TABLE "_pages_v_locales" DROP CONSTRAINT "_pages_v_locales_version_meta_image_id_images_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_images_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_videos_fk";
  ALTER TABLE "images_locales" DROP CONSTRAINT "images_locales_parent_id_fk";
  DROP INDEX "payload_locked_documents_rels_images_id_idx";
  DROP INDEX "payload_locked_documents_rels_videos_id_idx";
  DROP INDEX "images_updated_at_idx";
  DROP INDEX "images_created_at_idx";
  DROP INDEX "images_filename_idx";
  DROP INDEX "images_sizes_card_sizes_card_filename_idx";
  DROP INDEX "images_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "images_locales_locale_parent_id_unique";
  DROP TABLE "videos_locales" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TYPE "public"."enum_videos_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "videos_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "videos_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "videos_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "videos_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "videos_delete";
  ALTER TABLE "images" RENAME TO "media";
  ALTER TABLE "images_locales" RENAME TO "media_locales";
  ALTER TABLE "media_locales" ADD COLUMN "mux_video" jsonb;
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "images_find" TO "media_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "images_create" TO "media_create";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "images_update" TO "media_update";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "images_delete" TO "media_delete";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "images_id" TO "media_id";
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_families" ADD CONSTRAINT "truck_families_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_families_v" ADD CONSTRAINT "_truck_families_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" DROP COLUMN "_objectkey";
  ALTER TABLE "documents" DROP COLUMN "_objectkey";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";`);
}
