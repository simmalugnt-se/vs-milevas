/**
 * The truck type's equipment and extras as groups with the models that have each option, the steps'
 * order mixing the models' fields and the groups, a list of series, and a model's photos with an
 * option (a cab); the link for a truck type without models, an option's article number, default
 * and conditions, and the model steps go.
 *
 * This is the branch's last migration, so it also moves the data `20261029_095637_truck_models`
 * kept aside (`mig_*`), through the Local API, once every table the truck types use exists: the
 * variants become models chosen by lift capacity, the batteries and masts groups under Utrustning
 * and the extras one under Tillval, in the order the configurator settings gave them, an option
 * shown only for some variants for those models, and the fixed specifications rows. A database
 * without the old rows (one seeded since) has nothing to move.
 */
import { randomBytes } from "node:crypto";
import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

type OldModel = {
  id: string;
  _parent_id: string;
  _order: number;
  sku: string | null;
  price: string | null;
  capacity_kg: string | null;
  default_selected: boolean | null;
  image_id: string | null;
  weight: string | null;
  turning_radius: string | null;
};

type OldOption = {
  id: string;
  _parent_id: string;
  _order: number;
  price: string | null;
  default_selected?: boolean | null;
  available_for: Record<string, string[]> | null;
  image_id: string | null;
  label?: string | null;
  capacity?: string | null;
  description?: string | null;
  lift_height?: string | null;
  build_height?: string | null;
};

type OldFamily = { id: string; travel_speed: string | null; lift_height_help: string | null };

const STEPS = [
  { step: "battery", label: "Batteri" },
  { step: "lift-height", label: "Lyfthöjd" },
  { step: "extras", label: "Tillval" },
] as const;

type StepKey = (typeof STEPS)[number]["step"];

const tons = (kg: number) =>
  `${new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(kg / 1000)} ton`;

/** "2 980" → "2 980 kg", as the quote showed it. */
const withUnit = (value: string | null | undefined, unit: string) => {
  const text = value?.trim();
  if (!text) return undefined;
  return text.endsWith(unit) ? text : `${text} ${unit}`;
};

const spec = (label: string, value: string | undefined) => (value ? [{ label, value }] : []);

const rowId = () => randomBytes(12).toString("hex");

const num = (value: string | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value);

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_extra_groups_columns" AS ENUM('auto', 'one', 'two');
  CREATE TYPE "public"."enum__truck_extra_groups_v_columns" AS ENUM('auto', 'one', 'two');
  CREATE TABLE "truck_family_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "truck_extra_option_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "truck_extra_option_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_extra_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid
  );
  
  CREATE TABLE "truck_extra_options_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_extra_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_truck_extra_groups_columns" DEFAULT 'auto'
  );
  
  CREATE TABLE "truck_extra_groups_locales" (
  	"label" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_step_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar
  );
  
  CREATE TABLE "_truck_family_series_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extra_option_specs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extra_option_specs_v_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_extra_options_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"price" numeric DEFAULT 0,
  	"image_id" uuid,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extra_options_v_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_extra_groups_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"columns" "enum__truck_extra_groups_v_columns" DEFAULT 'auto',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_extra_groups_v_locales" (
  	"label" varchar,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_step_order_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"step" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "truck_model_option_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option" varchar,
  	"image_id" uuid
  );
  
  CREATE TABLE "_truck_model_option_images_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"option" varchar,
  	"image_id" uuid,
  	"_uuid" varchar
  );
  
  ALTER TABLE "truck_model_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_option_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_steps_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_option_images_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_model_steps" CASCADE;
  DROP TABLE "truck_model_steps_locales" CASCADE;
  DROP TABLE "truck_option_images" CASCADE;
  DROP TABLE "_truck_model_steps_v" CASCADE;
  DROP TABLE "_truck_model_steps_v_locales" CASCADE;
  DROP TABLE "_truck_option_images_v" CASCADE;
  ALTER TABLE "truck_families_rels" DROP CONSTRAINT "truck_families_rels_pages_fk";
  
  ALTER TABLE "_truck_families_v_rels" DROP CONSTRAINT "_truck_families_v_rels_pages_fk";
  
  DROP INDEX "truck_families_rels_pages_id_idx";
  DROP INDEX "_truck_families_v_rels_pages_id_idx";
  ALTER TABLE "truck_family_series" ADD CONSTRAINT "truck_family_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_option_specs" ADD CONSTRAINT "truck_extra_option_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_option_specs_locales" ADD CONSTRAINT "truck_extra_option_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_option_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_options" ADD CONSTRAINT "truck_extra_options_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_extra_options" ADD CONSTRAINT "truck_extra_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_options_locales" ADD CONSTRAINT "truck_extra_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_groups" ADD CONSTRAINT "truck_extra_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_groups_locales" ADD CONSTRAINT "truck_extra_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_step_order" ADD CONSTRAINT "truck_step_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_family_series_v" ADD CONSTRAINT "_truck_family_series_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_option_specs_v" ADD CONSTRAINT "_truck_extra_option_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_option_specs_v_locales" ADD CONSTRAINT "_truck_extra_option_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_option_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v" ADD CONSTRAINT "_truck_extra_options_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v" ADD CONSTRAINT "_truck_extra_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v_locales" ADD CONSTRAINT "_truck_extra_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_groups_v" ADD CONSTRAINT "_truck_extra_groups_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_groups_v_locales" ADD CONSTRAINT "_truck_extra_groups_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_step_order_v" ADD CONSTRAINT "_truck_step_order_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_option_images" ADD CONSTRAINT "truck_model_option_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_model_option_images" ADD CONSTRAINT "truck_model_option_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_option_images_v" ADD CONSTRAINT "_truck_model_option_images_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_model_option_images_v" ADD CONSTRAINT "_truck_model_option_images_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_models_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_family_series_order_idx" ON "truck_family_series" USING btree ("_order");
  CREATE INDEX "truck_family_series_parent_id_idx" ON "truck_family_series" USING btree ("_parent_id");
  CREATE INDEX "truck_extra_option_specs_order_idx" ON "truck_extra_option_specs" USING btree ("_order");
  CREATE INDEX "truck_extra_option_specs_parent_id_idx" ON "truck_extra_option_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_extra_option_specs_locales_locale_parent_id_unique" ON "truck_extra_option_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_extra_options_order_idx" ON "truck_extra_options" USING btree ("_order");
  CREATE INDEX "truck_extra_options_parent_id_idx" ON "truck_extra_options" USING btree ("_parent_id");
  CREATE INDEX "truck_extra_options_image_idx" ON "truck_extra_options" USING btree ("image_id");
  CREATE UNIQUE INDEX "truck_extra_options_locales_locale_parent_id_unique" ON "truck_extra_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_extra_groups_order_idx" ON "truck_extra_groups" USING btree ("_order");
  CREATE INDEX "truck_extra_groups_parent_id_idx" ON "truck_extra_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_extra_groups_locales_locale_parent_id_unique" ON "truck_extra_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_step_order_order_idx" ON "truck_step_order" USING btree ("_order");
  CREATE INDEX "truck_step_order_parent_id_idx" ON "truck_step_order" USING btree ("_parent_id");
  CREATE INDEX "_truck_family_series_v_order_idx" ON "_truck_family_series_v" USING btree ("_order");
  CREATE INDEX "_truck_family_series_v_parent_id_idx" ON "_truck_family_series_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_extra_option_specs_v_order_idx" ON "_truck_extra_option_specs_v" USING btree ("_order");
  CREATE INDEX "_truck_extra_option_specs_v_parent_id_idx" ON "_truck_extra_option_specs_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_extra_option_specs_v_locales_locale_parent_id_unique" ON "_truck_extra_option_specs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_extra_options_v_order_idx" ON "_truck_extra_options_v" USING btree ("_order");
  CREATE INDEX "_truck_extra_options_v_parent_id_idx" ON "_truck_extra_options_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_extra_options_v_image_idx" ON "_truck_extra_options_v" USING btree ("image_id");
  CREATE UNIQUE INDEX "_truck_extra_options_v_locales_locale_parent_id_unique" ON "_truck_extra_options_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_extra_groups_v_order_idx" ON "_truck_extra_groups_v" USING btree ("_order");
  CREATE INDEX "_truck_extra_groups_v_parent_id_idx" ON "_truck_extra_groups_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_extra_groups_v_locales_locale_parent_id_unique" ON "_truck_extra_groups_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_step_order_v_order_idx" ON "_truck_step_order_v" USING btree ("_order");
  CREATE INDEX "_truck_step_order_v_parent_id_idx" ON "_truck_step_order_v" USING btree ("_parent_id");
  CREATE INDEX "truck_model_option_images_order_idx" ON "truck_model_option_images" USING btree ("_order");
  CREATE INDEX "truck_model_option_images_parent_id_idx" ON "truck_model_option_images" USING btree ("_parent_id");
  CREATE INDEX "truck_model_option_images_image_idx" ON "truck_model_option_images" USING btree ("image_id");
  CREATE INDEX "_truck_model_option_images_v_order_idx" ON "_truck_model_option_images_v" USING btree ("_order");
  CREATE INDEX "_truck_model_option_images_v_parent_id_idx" ON "_truck_model_option_images_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_model_option_images_v_image_idx" ON "_truck_model_option_images_v" USING btree ("image_id");
  ALTER TABLE "truck_question_options" DROP COLUMN "for_all_models";
  ALTER TABLE "truck_question_options" DROP COLUMN "sku";
  ALTER TABLE "truck_question_options" DROP COLUMN "default_selected";
  ALTER TABLE "truck_question_options" DROP COLUMN "available_for";
  ALTER TABLE "truck_questions" DROP COLUMN "multiple";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_type";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_anchor";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_url";
  ALTER TABLE "truck_families" DROP COLUMN "contact_link_new_tab";
  ALTER TABLE "truck_families_locales" DROP COLUMN "contact_link_label";
  ALTER TABLE "truck_families_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_truck_question_options_v" DROP COLUMN "for_all_models";
  ALTER TABLE "_truck_question_options_v" DROP COLUMN "sku";
  ALTER TABLE "_truck_question_options_v" DROP COLUMN "default_selected";
  ALTER TABLE "_truck_question_options_v" DROP COLUMN "available_for";
  ALTER TABLE "_truck_questions_v" DROP COLUMN "multiple";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_type";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_anchor";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_url";
  ALTER TABLE "_truck_families_v" DROP COLUMN "version_contact_link_new_tab";
  ALTER TABLE "_truck_families_v_locales" DROP COLUMN "version_contact_link_label";
  ALTER TABLE "_truck_families_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "truck_models" DROP COLUMN "own_options";
  ALTER TABLE "_truck_models_v" DROP COLUMN "version_own_options";
  DROP TYPE "public"."enum_truck_model_steps_step";
  DROP TYPE "public"."enum_truck_families_contact_link_type";
  DROP TYPE "public"."enum__truck_model_steps_v_step";
  DROP TYPE "public"."enum__truck_families_v_version_contact_link_type";`);

  const exists = (await db.execute(
    sql`SELECT to_regclass('public.mig_truck_models') IS NOT NULL AS found`,
  )) as unknown as { rows: Array<{ found: boolean }> };
  if (!exists.rows[0]?.found) return;

  const rows = async <T>(query: ReturnType<typeof sql>) =>
    ((await db.execute(query)) as unknown as { rows: T[] }).rows;
  const oldModels = await rows<OldModel>(sql`SELECT * FROM "mig_truck_models" ORDER BY _order`);
  const batteries = await rows<OldOption>(sql`SELECT * FROM "mig_truck_batteries" ORDER BY _order`);
  const masts = await rows<OldOption>(sql`SELECT * FROM "mig_truck_lift_heights" ORDER BY _order`);
  const extras = await rows<OldOption>(sql`SELECT * FROM "mig_truck_extras" ORDER BY _order`);
  const oldFamilies = await rows<OldFamily>(sql`SELECT * FROM "mig_truck_families"`);
  const settingsSteps = await rows<{ step: string; label: string | null }>(
    sql`SELECT * FROM "mig_settings_steps" ORDER BY _order`,
  );

  // The groups in the settings' order, each once, with their names.
  const steps = [
    ...settingsSteps.flatMap((row) => {
      const known = STEPS.find((step) => step.step === row.step);
      return known ? [{ step: known.step, label: row.label?.trim() || known.label }] : [];
    }),
    ...STEPS,
  ].filter((step, index, all) => all.findIndex((other) => other.step === step.step) === index);

  const families = await payload.find({
    collection: "truck-families",
    locale: "sv",
    draft: true,
    depth: 0,
    pagination: false,
    joins: false,
    req,
  });

  for (const family of families.docs) {
    const old = oldFamilies.find((row) => row.id === family.id);
    const ofFamily = <T extends { _parent_id: string }>(list: T[]) =>
      list.filter((row) => row._parent_id === family.id);

    // The variants become models, published as the family was.
    const modelIds = new Map<string, string>();
    for (const variant of ofFamily(oldModels)) {
      const capacityKg = num(variant.capacity_kg);
      const created = await payload.create({
        collection: "truck-models",
        locale: "sv",
        draft: false,
        data: {
          family: family.id,
          name: variant.sku?.trim() || tons(capacityKg),
          sku: variant.sku || undefined,
          capacityKg,
          price: num(variant.price),
          image: variant.image_id || undefined,
          specs: [
            ...spec("Vikt", withUnit(variant.weight, "kg")),
            ...spec("Vändradie", withUnit(variant.turning_radius, "mm")),
          ],
          _status: "published",
        },
        context: { disableRevalidate: true },
        req,
      });
      modelIds.set(variant.id, created.id);
    }

    // An option shown only for some variants is for those models; the default comes first, as
    // the first option a model has is its default.
    const models = (row: OldOption) =>
      row.available_for?.models?.flatMap((id) => modelIds.get(id) ?? []) ?? [];
    const defaultFirst = (list: OldOption[]) =>
      [...list].sort(
        (a, b) => Number(b.default_selected === true) - Number(a.default_selected === true),
      );
    const options = {
      battery: defaultFirst(ofFamily(batteries)).map((row) => ({
        id: row.id,
        label: row.label || "Batteri",
        description: row.description || undefined,
        price: num(row.price),
        image: row.image_id || undefined,
        specs: spec("Batterikapacitet", row.capacity?.trim() || undefined),
        models: models(row),
      })),
      "lift-height": defaultFirst(ofFamily(masts)).map((row) => ({
        id: row.id,
        label: `${num(row.lift_height)} mm`,
        description: row.build_height
          ? `Truckens höjd med denna mast: ${num(row.build_height)} mm`
          : undefined,
        price: num(row.price),
        image: row.image_id || undefined,
        specs: spec(
          "Truckens bygghöjd",
          row.build_height ? `${num(row.build_height)} mm` : undefined,
        ),
        models: models(row),
      })),
      extras: ofFamily(extras).map((row) => ({
        id: row.id,
        label: row.label || "Tillval",
        description: row.description || undefined,
        price: num(row.price),
        image: row.image_id || undefined,
        models: models(row),
      })),
    };
    const groupIds = { battery: rowId(), "lift-height": rowId(), extras: rowId() };
    const group = (step: StepKey, label: string) => ({
      id: groupIds[step],
      label,
      help: step === "lift-height" ? old?.lift_height_help || undefined : undefined,
      options: options[step],
    });
    const used = steps.filter(({ step }) => options[step].length > 0);

    const cardBattery =
      ofFamily(batteries).find((row) => row.default_selected) ?? ofFamily(batteries)[0];
    const defaultVariant =
      ofFamily(oldModels).find((row) => row.default_selected) ??
      (ofFamily(oldModels).length === 1 ? ofFamily(oldModels)[0] : undefined);

    await payload.update({
      collection: "truck-families",
      id: family.id,
      locale: "sv",
      draft: false,
      data: {
        _status: family._status ?? "published",
        cardSpec: cardBattery?.capacity?.trim() || undefined,
        specs: spec("Körhastighet (lastad/olastad)", withUnit(old?.travel_speed, "km/h")),
        defaultModel: defaultVariant ? modelIds.get(defaultVariant.id) : undefined,
        equipment: used
          .filter(({ step }) => step !== "extras")
          .map(({ step, label }) => group(step, label)),
        extras: used
          .filter(({ step }) => step === "extras")
          .map(({ step, label }) => group(step, label)),
        // The variants were chosen by lift capacity, then the groups.
        stepOrder: [{ step: "capacity" }, ...used.map(({ step }) => ({ step: groupIds[step] }))],
      },
      context: { disableRevalidate: true },
      req,
    });
  }

  await db.execute(sql`
  DROP TABLE "mig_truck_models";
  DROP TABLE "mig_truck_batteries";
  DROP TABLE "mig_truck_lift_heights";
  DROP TABLE "mig_truck_extras";
  DROP TABLE "mig_truck_families";
  DROP TABLE "mig_settings_steps";
  DROP TABLE "mig_settings";
`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_model_steps_step" AS ENUM('capacity', 'wheels', 'series', 'model');
  CREATE TYPE "public"."enum_truck_families_contact_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__truck_model_steps_v_step" AS ENUM('capacity', 'wheels', 'series', 'model');
  CREATE TYPE "public"."enum__truck_families_v_version_contact_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "truck_model_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" "enum_truck_model_steps_step"
  );
  
  CREATE TABLE "truck_model_steps_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "truck_option_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid
  );
  
  CREATE TABLE "_truck_model_steps_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"step" "enum__truck_model_steps_v_step",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_truck_model_steps_v_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_truck_option_images_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"image_id" uuid,
  	"_uuid" varchar
  );
  
  ALTER TABLE "truck_family_series" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_option_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_option_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_extra_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_step_order" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_family_series_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_option_specs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_option_specs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_options_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_options_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_groups_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_extra_groups_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_step_order_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "truck_model_option_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_truck_model_option_images_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "truck_family_series" CASCADE;
  DROP TABLE "truck_extra_option_specs" CASCADE;
  DROP TABLE "truck_extra_option_specs_locales" CASCADE;
  DROP TABLE "truck_extra_options" CASCADE;
  DROP TABLE "truck_extra_options_locales" CASCADE;
  DROP TABLE "truck_extra_groups" CASCADE;
  DROP TABLE "truck_extra_groups_locales" CASCADE;
  DROP TABLE "truck_step_order" CASCADE;
  DROP TABLE "_truck_family_series_v" CASCADE;
  DROP TABLE "_truck_extra_option_specs_v" CASCADE;
  DROP TABLE "_truck_extra_option_specs_v_locales" CASCADE;
  DROP TABLE "_truck_extra_options_v" CASCADE;
  DROP TABLE "_truck_extra_options_v_locales" CASCADE;
  DROP TABLE "_truck_extra_groups_v" CASCADE;
  DROP TABLE "_truck_extra_groups_v_locales" CASCADE;
  DROP TABLE "_truck_step_order_v" CASCADE;
  DROP TABLE "truck_model_option_images" CASCADE;
  DROP TABLE "_truck_model_option_images_v" CASCADE;
  ALTER TABLE "truck_question_options" ADD COLUMN "for_all_models" boolean DEFAULT true;
  ALTER TABLE "truck_question_options" ADD COLUMN "sku" varchar;
  ALTER TABLE "truck_question_options" ADD COLUMN "default_selected" boolean DEFAULT false;
  ALTER TABLE "truck_question_options" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "truck_questions" ADD COLUMN "multiple" boolean DEFAULT false;
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_type" "enum_truck_families_contact_link_type" DEFAULT 'internal';
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_anchor" varchar;
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_url" varchar;
  ALTER TABLE "truck_families" ADD COLUMN "contact_link_new_tab" boolean;
  ALTER TABLE "truck_families_locales" ADD COLUMN "contact_link_label" varchar;
  ALTER TABLE "truck_families_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "_truck_question_options_v" ADD COLUMN "for_all_models" boolean DEFAULT true;
  ALTER TABLE "_truck_question_options_v" ADD COLUMN "sku" varchar;
  ALTER TABLE "_truck_question_options_v" ADD COLUMN "default_selected" boolean DEFAULT false;
  ALTER TABLE "_truck_question_options_v" ADD COLUMN "available_for" jsonb;
  ALTER TABLE "_truck_questions_v" ADD COLUMN "multiple" boolean DEFAULT false;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_type" "enum__truck_families_v_version_contact_link_type" DEFAULT 'internal';
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_anchor" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_url" varchar;
  ALTER TABLE "_truck_families_v" ADD COLUMN "version_contact_link_new_tab" boolean;
  ALTER TABLE "_truck_families_v_locales" ADD COLUMN "version_contact_link_label" varchar;
  ALTER TABLE "_truck_families_v_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "truck_models" ADD COLUMN "own_options" jsonb;
  ALTER TABLE "_truck_models_v" ADD COLUMN "version_own_options" jsonb;
  ALTER TABLE "truck_model_steps" ADD CONSTRAINT "truck_model_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_model_steps_locales" ADD CONSTRAINT "truck_model_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_model_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_option_images" ADD CONSTRAINT "truck_option_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_option_images" ADD CONSTRAINT "truck_option_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_question_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v" ADD CONSTRAINT "_truck_model_steps_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_model_steps_v_locales" ADD CONSTRAINT "_truck_model_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_model_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_option_images_v" ADD CONSTRAINT "_truck_option_images_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_option_images_v" ADD CONSTRAINT "_truck_option_images_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_question_options_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_model_steps_order_idx" ON "truck_model_steps" USING btree ("_order");
  CREATE INDEX "truck_model_steps_parent_id_idx" ON "truck_model_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "truck_model_steps_locales_locale_parent_id_unique" ON "truck_model_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "truck_option_images_order_idx" ON "truck_option_images" USING btree ("_order");
  CREATE INDEX "truck_option_images_parent_id_idx" ON "truck_option_images" USING btree ("_parent_id");
  CREATE INDEX "truck_option_images_image_idx" ON "truck_option_images" USING btree ("image_id");
  CREATE INDEX "_truck_model_steps_v_order_idx" ON "_truck_model_steps_v" USING btree ("_order");
  CREATE INDEX "_truck_model_steps_v_parent_id_idx" ON "_truck_model_steps_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_truck_model_steps_v_locales_locale_parent_id_unique" ON "_truck_model_steps_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_truck_option_images_v_order_idx" ON "_truck_option_images_v" USING btree ("_order");
  CREATE INDEX "_truck_option_images_v_parent_id_idx" ON "_truck_option_images_v" USING btree ("_parent_id");
  CREATE INDEX "_truck_option_images_v_image_idx" ON "_truck_option_images_v" USING btree ("image_id");
  ALTER TABLE "truck_families_rels" ADD CONSTRAINT "truck_families_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_families_v_rels" ADD CONSTRAINT "_truck_families_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_families_rels_pages_id_idx" ON "truck_families_rels" USING btree ("pages_id");
  CREATE INDEX "_truck_families_v_rels_pages_id_idx" ON "_truck_families_v_rels" USING btree ("pages_id");
  DROP TYPE "public"."enum_truck_extra_groups_columns";
  DROP TYPE "public"."enum__truck_extra_groups_v_columns";`);
}
