import * as migration_20260514_115903 from "./20260514_115903";
import * as migration_20260514_161458_localize_template_fields from "./20260514_161458_localize_template_fields";
import * as migration_20260708_120954 from "./20260708_120954";
import * as migration_20260805_135632 from "./20260805_135632";
import * as migration_20260810_150422_configurator_service_agreement from "./20260810_150422_configurator_service_agreement";
import * as migration_20260811_120812_r2_media_prefix from "./20260811_120812_r2_media_prefix";
import * as migration_20260811_122754_r2_documents_prefix from "./20260811_122754_r2_documents_prefix";
import * as migration_20261002_065231_boilerplate_sync from "./20261002_065231_boilerplate_sync";
import * as migration_20261005_081141_header_cta_footer_email from "./20261005_081141_header_cta_footer_email";
import * as migration_20261005_094932_configurator_step_help from "./20261005_094932_configurator_step_help";

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
  {
    up: migration_20260810_150422_configurator_service_agreement.up,
    down: migration_20260810_150422_configurator_service_agreement.down,
    name: "20260810_150422_configurator_service_agreement",
  },
  {
    up: migration_20260811_120812_r2_media_prefix.up,
    down: migration_20260811_120812_r2_media_prefix.down,
    name: "20260811_120812_r2_media_prefix",
  },
  {
    up: migration_20260811_122754_r2_documents_prefix.up,
    down: migration_20260811_122754_r2_documents_prefix.down,
    name: "20260811_122754_r2_documents_prefix",
  },
  {
    up: migration_20261002_065231_boilerplate_sync.up,
    down: migration_20261002_065231_boilerplate_sync.down,
    name: "20261002_065231_boilerplate_sync",
  },
  {
    up: migration_20261005_081141_header_cta_footer_email.up,
    down: migration_20261005_081141_header_cta_footer_email.down,
    name: "20261005_081141_header_cta_footer_email",
  },
  {
    up: migration_20261005_094932_configurator_step_help.up,
    down: migration_20261005_094932_configurator_step_help.down,
    name: "20261005_094932_configurator_step_help",
  },
];
