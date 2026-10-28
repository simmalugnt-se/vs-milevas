import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_models" ADD COLUMN "image_id" uuid;
  ALTER TABLE "truck_batteries" ADD COLUMN "image_id" uuid;
  ALTER TABLE "truck_lift_heights" ADD COLUMN "image_id" uuid;
  ALTER TABLE "_truck_models_v" ADD COLUMN "image_id" uuid;
  ALTER TABLE "_truck_batteries_v" ADD COLUMN "image_id" uuid;
  ALTER TABLE "_truck_lift_heights_v" ADD COLUMN "image_id" uuid;
  ALTER TABLE "truck_models" ADD CONSTRAINT "truck_models_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_batteries" ADD CONSTRAINT "truck_batteries_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_lift_heights" ADD CONSTRAINT "truck_lift_heights_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_models_v" ADD CONSTRAINT "_truck_models_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_batteries_v" ADD CONSTRAINT "_truck_batteries_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_lift_heights_v" ADD CONSTRAINT "_truck_lift_heights_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "truck_models_image_idx" ON "truck_models" USING btree ("image_id");
  CREATE INDEX "truck_batteries_image_idx" ON "truck_batteries" USING btree ("image_id");
  CREATE INDEX "truck_lift_heights_image_idx" ON "truck_lift_heights" USING btree ("image_id");
  CREATE INDEX "_truck_models_v_image_idx" ON "_truck_models_v" USING btree ("image_id");
  CREATE INDEX "_truck_batteries_v_image_idx" ON "_truck_batteries_v" USING btree ("image_id");
  CREATE INDEX "_truck_lift_heights_v_image_idx" ON "_truck_lift_heights_v" USING btree ("image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_models" DROP CONSTRAINT "truck_models_image_id_images_id_fk";
  
  ALTER TABLE "truck_batteries" DROP CONSTRAINT "truck_batteries_image_id_images_id_fk";
  
  ALTER TABLE "truck_lift_heights" DROP CONSTRAINT "truck_lift_heights_image_id_images_id_fk";
  
  ALTER TABLE "_truck_models_v" DROP CONSTRAINT "_truck_models_v_image_id_images_id_fk";
  
  ALTER TABLE "_truck_batteries_v" DROP CONSTRAINT "_truck_batteries_v_image_id_images_id_fk";
  
  ALTER TABLE "_truck_lift_heights_v" DROP CONSTRAINT "_truck_lift_heights_v_image_id_images_id_fk";
  
  DROP INDEX "truck_models_image_idx";
  DROP INDEX "truck_batteries_image_idx";
  DROP INDEX "truck_lift_heights_image_idx";
  DROP INDEX "_truck_models_v_image_idx";
  DROP INDEX "_truck_batteries_v_image_idx";
  DROP INDEX "_truck_lift_heights_v_image_idx";
  ALTER TABLE "truck_models" DROP COLUMN "image_id";
  ALTER TABLE "truck_batteries" DROP COLUMN "image_id";
  ALTER TABLE "truck_lift_heights" DROP COLUMN "image_id";
  ALTER TABLE "_truck_models_v" DROP COLUMN "image_id";
  ALTER TABLE "_truck_batteries_v" DROP COLUMN "image_id";
  ALTER TABLE "_truck_lift_heights_v" DROP COLUMN "image_id";`)
}
