import * as migration_20260514_115903 from "./20260514_115903";
import * as migration_20260514_161458_localize_template_fields from "./20260514_161458_localize_template_fields";
import * as migration_20260708_120954 from "./20260708_120954";
import * as migration_20260805_135632 from "./20260805_135632";

export const migrations = [
  {
    up: migration_20260514_115903.up,
    down: migration_20260514_115903.down,
    name: "20260514_115903",
  },
  {
    up: migration_20260514_161458_localize_template_fields.up,
    down: migration_20260514_161458_localize_template_fields.down,
    name: "20260514_161458_localize_template_fields",
  },
  {
    up: migration_20260708_120954.up,
    down: migration_20260708_120954.down,
    name: "20260708_120954",
  },
  {
    up: migration_20260805_135632.up,
    down: migration_20260805_135632.down,
    name: "20260805_135632",
  },
];
