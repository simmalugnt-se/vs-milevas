/**
 * "Val": the truck type's Utrustning and Tillval become one list of groups, each with "Flerval"
 * for any number of options (the extras). The extras' groups move into the list after the
 * equipment's, keeping their ids, so the steps' order, the configurator's addresses and the
 * requests still point at them; the options' models move with them.
 *
 * It also moves the data `20261029_095637_truck_models` kept aside (`mig_*`), through the Local
 * API, as the last migration that changes the truck types and models, so every table they use
 * exists (`20261030_101939_service_rates_in_settings` after it only takes a table away): the
 * variants become models chosen by lift capacity, the batteries and masts groups and the extras
 * one with "Flerval", in the order the configurator settings gave them, an option shown only for
 * some variants for those models, and the fixed specifications rows. A database without the old
 * rows (one seeded since, or migrated before this moved here) has nothing to move. A later
 * migration that adds a table the truck types or models use takes this move along.
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
  ALTER TABLE "truck_questions" ADD COLUMN "multiple" boolean DEFAULT false;
  ALTER TABLE "_truck_questions_v" ADD COLUMN "multiple" boolean DEFAULT false;

  -- The options' models: "extras.1.options.0.models" follows the equipment's groups.
  UPDATE "truck_families_rels" r
    SET "path" = 'choices.'
      || (split_part(r."path", '.', 2)::int
        + (SELECT count(*) FROM "truck_questions" q WHERE q."_parent_id" = r."parent_id"))
      || substring(r."path" from '^extras\\.[0-9]+(.*)$')
    WHERE r."path" ~ '^extras\\.[0-9]+';
  UPDATE "truck_families_rels" SET "path" = 'choices.' || substring("path" from 11)
    WHERE "path" LIKE 'equipment.%';
  UPDATE "_truck_families_v_rels" r
    SET "path" = 'version.choices.'
      || (split_part(r."path", '.', 3)::int
        + (SELECT count(*) FROM "_truck_questions_v" q WHERE q."_parent_id" = r."parent_id"))
      || substring(r."path" from '^version\\.extras\\.[0-9]+(.*)$')
    WHERE r."path" ~ '^version\\.extras\\.[0-9]+';
  UPDATE "_truck_families_v_rels" SET "path" = 'version.choices.' || substring("path" from 19)
    WHERE "path" LIKE 'version.equipment.%';

  -- The extras' groups, options and specifications, after the equipment's.
  INSERT INTO "truck_questions" ("_order", "_parent_id", "id", "columns", "multiple")
    SELECT "_order" + 1000, "_parent_id", "id", "columns"::text::"enum_truck_questions_columns", true
    FROM "truck_extra_groups";
  INSERT INTO "truck_questions_locales" ("label", "help", "_locale", "_parent_id")
    SELECT "label", "help", "_locale", "_parent_id" FROM "truck_extra_groups_locales";
  INSERT INTO "truck_question_options" ("_order", "_parent_id", "id", "price", "image_id")
    SELECT "_order", "_parent_id", "id", "price", "image_id" FROM "truck_extra_options";
  INSERT INTO "truck_question_options_locales" ("label", "description", "_locale", "_parent_id")
    SELECT "label", "description", "_locale", "_parent_id" FROM "truck_extra_options_locales";
  INSERT INTO "truck_option_specs" ("_order", "_parent_id", "id")
    SELECT "_order", "_parent_id", "id" FROM "truck_extra_option_specs";
  INSERT INTO "truck_option_specs_locales" ("label", "value", "_locale", "_parent_id")
    SELECT "label", "value", "_locale", "_parent_id" FROM "truck_extra_option_specs_locales";

  INSERT INTO "_truck_questions_v" ("_order", "_parent_id", "id", "_uuid", "columns", "multiple")
    SELECT "_order" + 1000, "_parent_id", "id", "_uuid",
      "columns"::text::"enum__truck_questions_v_columns", true
    FROM "_truck_extra_groups_v";
  INSERT INTO "_truck_questions_v_locales" ("label", "help", "_locale", "_parent_id")
    SELECT "label", "help", "_locale", "_parent_id" FROM "_truck_extra_groups_v_locales";
  INSERT INTO "_truck_question_options_v" ("_order", "_parent_id", "id", "price", "image_id", "_uuid")
    SELECT "_order", "_parent_id", "id", "price", "image_id", "_uuid" FROM "_truck_extra_options_v";
  INSERT INTO "_truck_question_options_v_locales" ("label", "description", "_locale", "_parent_id")
    SELECT "label", "description", "_locale", "_parent_id" FROM "_truck_extra_options_v_locales";
  INSERT INTO "_truck_option_specs_v" ("_order", "_parent_id", "id", "_uuid")
    SELECT "_order", "_parent_id", "id", "_uuid" FROM "_truck_extra_option_specs_v";
  INSERT INTO "_truck_option_specs_v_locales" ("label", "value", "_locale", "_parent_id")
    SELECT "label", "value", "_locale", "_parent_id" FROM "_truck_extra_option_specs_v_locales";

   DROP TABLE "truck_extra_option_specs" CASCADE;
  DROP TABLE "truck_extra_option_specs_locales" CASCADE;
  DROP TABLE "truck_extra_options" CASCADE;
  DROP TABLE "truck_extra_options_locales" CASCADE;
  DROP TABLE "truck_extra_groups" CASCADE;
  DROP TABLE "truck_extra_groups_locales" CASCADE;
  DROP TABLE "_truck_extra_option_specs_v" CASCADE;
  DROP TABLE "_truck_extra_option_specs_v_locales" CASCADE;
  DROP TABLE "_truck_extra_options_v" CASCADE;
  DROP TABLE "_truck_extra_options_v_locales" CASCADE;
  DROP TABLE "_truck_extra_groups_v" CASCADE;
  DROP TABLE "_truck_extra_groups_v_locales" CASCADE;
  DROP TYPE "public"."enum_truck_extra_groups_columns";
  DROP TYPE "public"."enum__truck_extra_groups_v_columns";`);

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
        // The extras are the one group with "Flerval".
        choices: used.map(({ step, label }) => ({
          ...group(step, label),
          multiple: step === "extras",
        })),
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
   CREATE TYPE "public"."enum_truck_extra_groups_columns" AS ENUM('auto', 'one', 'two');
  CREATE TYPE "public"."enum__truck_extra_groups_v_columns" AS ENUM('auto', 'one', 'two');
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
  
  ALTER TABLE "truck_extra_option_specs" ADD CONSTRAINT "truck_extra_option_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_option_specs_locales" ADD CONSTRAINT "truck_extra_option_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_option_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_options" ADD CONSTRAINT "truck_extra_options_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "truck_extra_options" ADD CONSTRAINT "truck_extra_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_options_locales" ADD CONSTRAINT "truck_extra_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_groups" ADD CONSTRAINT "truck_extra_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "truck_extra_groups_locales" ADD CONSTRAINT "truck_extra_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_extra_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_option_specs_v" ADD CONSTRAINT "_truck_extra_option_specs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_option_specs_v_locales" ADD CONSTRAINT "_truck_extra_option_specs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_option_specs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v" ADD CONSTRAINT "_truck_extra_options_v_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v" ADD CONSTRAINT "_truck_extra_options_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_options_v_locales" ADD CONSTRAINT "_truck_extra_options_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_options_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_groups_v" ADD CONSTRAINT "_truck_extra_groups_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_extra_groups_v_locales" ADD CONSTRAINT "_truck_extra_groups_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_extra_groups_v"("id") ON DELETE cascade ON UPDATE no action;
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

  -- Published: the groups with "Flerval" back under Tillval.
  WITH g AS (
    SELECT "_parent_id", "multiple",
      row_number() OVER (PARTITION BY "_parent_id" ORDER BY "_order") - 1 AS idx,
      row_number() OVER (PARTITION BY "_parent_id", "multiple" ORDER BY "_order") - 1 AS sub
    FROM "truck_questions"
  )
  UPDATE "truck_families_rels" r
    SET "path" = '' || (CASE WHEN g."multiple" THEN 'extras.' ELSE 'equipment.' END) || g.sub
      || substring(r."path" from '^choices\\.[0-9]+(.*)$')
    FROM g
    WHERE g."_parent_id" = r."parent_id" AND r."path" ~ '^choices\\.[0-9]+'
      AND split_part(r."path", '.', 2)::int = g.idx;
  INSERT INTO "truck_extra_groups" ("_order", "_parent_id", "id", "columns")
    SELECT "_order", "_parent_id", "id", "columns"::text::"enum_truck_extra_groups_columns" FROM "truck_questions" WHERE "multiple";
  INSERT INTO "truck_extra_groups_locales" ("label", "help", "_locale", "_parent_id")
    SELECT l."label", l."help", l."_locale", l."_parent_id" FROM "truck_questions_locales" l
    JOIN "truck_questions" q ON q."id" = l."_parent_id" WHERE q."multiple";
  INSERT INTO "truck_extra_options" ("_order", "_parent_id", "id", "price", "image_id")
    SELECT o."_order", o."_parent_id", o."id", o."price", o."image_id" FROM "truck_question_options" o
    JOIN "truck_questions" q ON q."id" = o."_parent_id" WHERE q."multiple";
  INSERT INTO "truck_extra_options_locales" ("label", "description", "_locale", "_parent_id")
    SELECT l."label", l."description", l."_locale", l."_parent_id" FROM "truck_question_options_locales" l
    JOIN "truck_extra_options" o ON o."id" = l."_parent_id";
  INSERT INTO "truck_extra_option_specs" ("_order", "_parent_id", "id")
    SELECT s."_order", s."_parent_id", s."id" FROM "truck_option_specs" s
    JOIN "truck_extra_options" o ON o."id" = s."_parent_id";
  INSERT INTO "truck_extra_option_specs_locales" ("label", "value", "_locale", "_parent_id")
    SELECT l."label", l."value", l."_locale", l."_parent_id" FROM "truck_option_specs_locales" l
    JOIN "truck_extra_option_specs" s ON s."id" = l."_parent_id";
  DELETE FROM "truck_questions" WHERE "multiple";
  UPDATE "truck_families_rels" SET "path" = 'equipment.' || substring("path" from 9)
    WHERE "path" LIKE 'choices.%';

  -- Versions: the groups with "Flerval" back under Tillval.
  WITH g AS (
    SELECT "_parent_id", "multiple",
      row_number() OVER (PARTITION BY "_parent_id" ORDER BY "_order") - 1 AS idx,
      row_number() OVER (PARTITION BY "_parent_id", "multiple" ORDER BY "_order") - 1 AS sub
    FROM "_truck_questions_v"
  )
  UPDATE "_truck_families_v_rels" r
    SET "path" = 'version.' || (CASE WHEN g."multiple" THEN 'extras.' ELSE 'equipment.' END) || g.sub
      || substring(r."path" from '^version\\.choices\\.[0-9]+(.*)$')
    FROM g
    WHERE g."_parent_id" = r."parent_id" AND r."path" ~ '^version\\.choices\\.[0-9]+'
      AND split_part(r."path", '.', 3)::int = g.idx;
  INSERT INTO "_truck_extra_groups_v" ("_order", "_parent_id", "id", "_uuid", "columns")
    SELECT "_order", "_parent_id", "id", "_uuid", "columns"::text::"enum__truck_extra_groups_v_columns" FROM "_truck_questions_v" WHERE "multiple";
  INSERT INTO "_truck_extra_groups_v_locales" ("label", "help", "_locale", "_parent_id")
    SELECT l."label", l."help", l."_locale", l."_parent_id" FROM "_truck_questions_v_locales" l
    JOIN "_truck_questions_v" q ON q."id" = l."_parent_id" WHERE q."multiple";
  INSERT INTO "_truck_extra_options_v" ("_order", "_parent_id", "id", "price", "image_id", "_uuid")
    SELECT o."_order", o."_parent_id", o."id", o."price", o."image_id", o."_uuid" FROM "_truck_question_options_v" o
    JOIN "_truck_questions_v" q ON q."id" = o."_parent_id" WHERE q."multiple";
  INSERT INTO "_truck_extra_options_v_locales" ("label", "description", "_locale", "_parent_id")
    SELECT l."label", l."description", l."_locale", l."_parent_id" FROM "_truck_question_options_v_locales" l
    JOIN "_truck_extra_options_v" o ON o."id" = l."_parent_id";
  INSERT INTO "_truck_extra_option_specs_v" ("_order", "_parent_id", "id", "_uuid")
    SELECT s."_order", s."_parent_id", s."id", s."_uuid" FROM "_truck_option_specs_v" s
    JOIN "_truck_extra_options_v" o ON o."id" = s."_parent_id";
  INSERT INTO "_truck_extra_option_specs_v_locales" ("label", "value", "_locale", "_parent_id")
    SELECT l."label", l."value", l."_locale", l."_parent_id" FROM "_truck_option_specs_v_locales" l
    JOIN "_truck_extra_option_specs_v" s ON s."id" = l."_parent_id";
  DELETE FROM "_truck_questions_v" WHERE "multiple";
  UPDATE "_truck_families_v_rels" SET "path" = 'version.equipment.' || substring("path" from 17)
    WHERE "path" LIKE 'version.choices.%';

  ALTER TABLE "truck_questions" DROP COLUMN "multiple";
  ALTER TABLE "_truck_questions_v" DROP COLUMN "multiple";`);
}
