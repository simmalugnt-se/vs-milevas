/** "Visa med föregående steg" on each row of a truck type's "Steg i konfiguratorn". */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_step_order" ADD COLUMN "with_previous" boolean DEFAULT false;
  ALTER TABLE "_truck_step_order_v" ADD COLUMN "with_previous" boolean DEFAULT false;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "truck_step_order" DROP COLUMN "with_previous";
  ALTER TABLE "_truck_step_order_v" DROP COLUMN "with_previous";`);
}
