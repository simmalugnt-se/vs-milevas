import * as migration_20260514_115903 from './20260514_115903';
import * as migration_20260514_161458_localize_template_fields from './20260514_161458_localize_template_fields';
import * as migration_20260708_120954 from './20260708_120954';
import * as migration_20260805_135632 from './20260805_135632';
import * as migration_20260810_150422_configurator_service_agreement from './20260810_150422_configurator_service_agreement';
import * as migration_20260811_120812_r2_media_prefix from './20260811_120812_r2_media_prefix';

export const migrations = [
  {
    up: migration_20260514_115903.up,
    down: migration_20260514_115903.down,
    name: '20260514_115903',
  },
  {
    up: migration_20260514_161458_localize_template_fields.up,
    down: migration_20260514_161458_localize_template_fields.down,
    name: '20260514_161458_localize_template_fields',
  },
  {
    up: migration_20260708_120954.up,
    down: migration_20260708_120954.down,
    name: '20260708_120954',
  },
  {
    up: migration_20260805_135632.up,
    down: migration_20260805_135632.down,
    name: '20260805_135632',
  },
  {
    up: migration_20260810_150422_configurator_service_agreement.up,
    down: migration_20260810_150422_configurator_service_agreement.down,
    name: '20260810_150422_configurator_service_agreement',
  },
  {
    up: migration_20260811_120812_r2_media_prefix.up,
    down: migration_20260811_120812_r2_media_prefix.down,
    name: '20260811_120812_r2_media_prefix'
  },
];
