import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_families" ADD COLUMN "contact_link_anchor" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_anchor" varchar;
  ALTER TABLE "header_nav_items_links" ADD COLUMN "link_anchor" varchar;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_anchor" varchar;
  ALTER TABLE "header" ADD COLUMN "login_link_anchor" varchar;
  ALTER TABLE "header" ADD COLUMN "announcement_link_anchor" varchar;
  ALTER TABLE "_header_v_version_nav_items_links" ADD COLUMN "link_anchor" varchar;
  ALTER TABLE "_header_v_version_nav_items" ADD COLUMN "link_anchor" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_login_link_anchor" varchar;
  ALTER TABLE "_header_v" ADD COLUMN "version_announcement_link_anchor" varchar;
  ALTER TABLE "footer_link_groups_links" ADD COLUMN "link_anchor" varchar;
  ALTER TABLE "_footer_v_version_link_groups_links" ADD COLUMN "link_anchor" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_families" DROP COLUMN "contact_link_anchor";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_anchor";
  ALTER TABLE "header_nav_items_links" DROP COLUMN "link_anchor";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_anchor";
  ALTER TABLE "header" DROP COLUMN "login_link_anchor";
  ALTER TABLE "header" DROP COLUMN "announcement_link_anchor";
  ALTER TABLE "_header_v_version_nav_items_links" DROP COLUMN "link_anchor";
  ALTER TABLE "_header_v_version_nav_items" DROP COLUMN "link_anchor";
  ALTER TABLE "_header_v" DROP COLUMN "version_login_link_anchor";
  ALTER TABLE "_header_v" DROP COLUMN "version_announcement_link_anchor";
  ALTER TABLE "footer_link_groups_links" DROP COLUMN "link_anchor";
  ALTER TABLE "_footer_v_version_link_groups_links" DROP COLUMN "link_anchor";`)
}
