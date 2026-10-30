/**
 * "Steg i konfiguratorn" moves under Val: each row there gets a type, its own options or a step from
 * the models' fields, and "Visa med föregående steg"; the order under Val is the steps' order. The
 * groups take their place in the old order, the steps from the models' fields become rows of their
 * own, and groups left out of it follow.
 *
 * It also moves the data `20261029_095637_truck_models` kept aside (`mig_*`), through the Local
 * API, as the last migration that changes the truck types and models, so every table they use
 * exists: the variants become models chosen by lift capacity, the batteries and masts groups and
 * the extras one with "Flerval", in the order the configurator settings gave them, an option shown
 * only for some variants for those models, and the fixed specifications rows. A database without
 * the old rows (one seeded since, or migrated before this moved here) has nothing to move. A later
 * migration that changes the truck types or models takes this move along.
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

/** The documents' tables and their versions'; a version's row keeps the row's id in `_uuid`. */
const TABLES = [
  {
    questions: "truck_questions",
    steps: "truck_step_order",
    key: "id",
    kind: "enum_truck_questions_kind",
  },
  {
    questions: "_truck_questions_v",
    steps: "_truck_step_order_v",
    key: "_uuid",
    kind: "enum__truck_questions_v_kind",
  },
];

const MODEL_STEPS = "('capacity', 'wheels', 'series', 'model')";

/** Numbers each truck type's rows 1, 2, 3 … in their current order. */
const renumber = (table: string) => `
  UPDATE "${table}" q SET "_order" = r.n
  FROM (SELECT "id", row_number() OVER (PARTITION BY "_parent_id" ORDER BY "_order") AS n FROM "${table}") r
  WHERE r."id" = q."id";`;

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_truck_questions_kind" AS ENUM('own', 'capacity', 'wheels', 'series', 'model');
  CREATE TYPE "public"."enum__truck_questions_v_kind" AS ENUM('own', 'capacity', 'wheels', 'series', 'model');
  ALTER TABLE "truck_questions" ADD COLUMN "kind" "enum_truck_questions_kind" DEFAULT 'own';
  ALTER TABLE "truck_questions" ADD COLUMN "with_previous" boolean DEFAULT false;
  ALTER TABLE "_truck_questions_v" ADD COLUMN "kind" "enum__truck_questions_v_kind" DEFAULT 'own';
  ALTER TABLE "_truck_questions_v" ADD COLUMN "with_previous" boolean DEFAULT false;`);

  for (const { questions, steps, key, kind } of TABLES) {
    await db.execute(
      sql.raw(`
  UPDATE "${questions}" q SET "_order" = 100000 + q."_order"
  WHERE NOT EXISTS (SELECT 1 FROM "${steps}" s WHERE s."_parent_id" = q."_parent_id" AND s."step" = q."${key}");
  UPDATE "${questions}" q SET "_order" = s."_order", "with_previous" = coalesce(s."with_previous", false)
  FROM "${steps}" s WHERE s."_parent_id" = q."_parent_id" AND s."step" = q."${key}";
  INSERT INTO "${questions}" ("_order", "_parent_id", "${key}", "kind", "with_previous")
  SELECT s."_order", s."_parent_id", s."${key}", s."step"::"${kind}", coalesce(s."with_previous", false)
  FROM "${steps}" s WHERE s."step" IN ${MODEL_STEPS};
  ${renumber(questions)}`),
    );
  }

  await db.execute(sql`
   DROP TABLE "truck_step_order" CASCADE;
  DROP TABLE "_truck_step_order_v" CASCADE;`);

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
        // The variants were chosen by lift capacity, then the groups; the extras are the one group
        // with "Flerval".
        choices: [
          { kind: "capacity" as const },
          ...used.map(({ step, label }) => ({
            ...group(step, label),
            multiple: step === "extras",
          })),
        ],
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
   CREATE TABLE "truck_step_order" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"with_previous" boolean DEFAULT false
  );

  CREATE TABLE "_truck_step_order_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"step" varchar,
  	"with_previous" boolean DEFAULT false,
  	"_uuid" varchar
  );

  ALTER TABLE "truck_step_order" ADD CONSTRAINT "truck_step_order_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."truck_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_truck_step_order_v" ADD CONSTRAINT "_truck_step_order_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_truck_families_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "truck_step_order_order_idx" ON "truck_step_order" USING btree ("_order");
  CREATE INDEX "truck_step_order_parent_id_idx" ON "truck_step_order" USING btree ("_parent_id");
  CREATE INDEX "_truck_step_order_v_order_idx" ON "_truck_step_order_v" USING btree ("_order");
  CREATE INDEX "_truck_step_order_v_parent_id_idx" ON "_truck_step_order_v" USING btree ("_parent_id");`);

  // Every row under Val becomes a step in the order: a group by its id, a model field by its key.
  for (const { questions, steps, key } of TABLES) {
    await db.execute(
      sql.raw(`
  INSERT INTO "${steps}" ("_order", "_parent_id", "${key}", "step", "with_previous")
  SELECT q."_order", q."_parent_id", substr(md5(random()::text || q."${key}"), 1, 24),
    CASE WHEN q."kind" IS NULL OR q."kind" = 'own' THEN q."${key}" ELSE q."kind"::text END,
    coalesce(q."with_previous", false)
  FROM "${questions}" q;
  DELETE FROM "${questions}" WHERE "kind" IN ${MODEL_STEPS};
  ${renumber(questions)}`),
    );
  }

  await db.execute(sql`
   ALTER TABLE "truck_questions" DROP COLUMN "kind";
  ALTER TABLE "truck_questions" DROP COLUMN "with_previous";
  ALTER TABLE "_truck_questions_v" DROP COLUMN "kind";
  ALTER TABLE "_truck_questions_v" DROP COLUMN "with_previous";
  DROP TYPE "public"."enum_truck_questions_kind";
  DROP TYPE "public"."enum__truck_questions_v_kind";`);
}
