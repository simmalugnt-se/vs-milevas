import * as migration_20260514_115903 from './20260514_115903';
import * as migration_20260514_161458_localize_template_fields from './20260514_161458_localize_template_fields';
import * as migration_20260708_120954 from './20260708_120954';
import * as migration_20260805_135632 from './20260805_135632';
import * as migration_20260810_150422_configurator_service_agreement from './20260810_150422_configurator_service_agreement';
import * as migration_20260811_120812_r2_media_prefix from './20260811_120812_r2_media_prefix';
import * as migration_20260811_122754_r2_documents_prefix from './20260811_122754_r2_documents_prefix';
import * as migration_20261002_065231_boilerplate_sync from './20261002_065231_boilerplate_sync';
import * as migration_20261005_081141_header_cta_footer_email from './20261005_081141_header_cta_footer_email';
import * as migration_20261005_094932_configurator_step_help from './20261005_094932_configurator_step_help';
import * as migration_20261022_123131_header_menus_login from './20261022_123131_header_menus_login';
import * as migration_20261022_125150_footer_columns_contact from './20261022_125150_footer_columns_contact';
import * as migration_20261023_091729_truck_catalog from './20261023_091729_truck_catalog';
import * as migration_20261023_094032_request_name_optional from './20261023_094032_request_name_optional';
import * as migration_20261023_094139_spec_in_quote from './20261023_094139_spec_in_quote';
import * as migration_20261023_115840_contact_requests from './20261023_115840_contact_requests';
import * as migration_20261023_140057_page_background from './20261023_140057_page_background';
import * as migration_20261026_084255_truck_fixed_fields from './20261026_084255_truck_fixed_fields';
import * as migration_20261026_135318_truck_product_page from './20261026_135318_truck_product_page';
import * as migration_20261026_140314_truck_configurable_from_variants from './20261026_140314_truck_configurable_from_variants';
import * as migration_20261026_141712_swedish_only from './20261026_141712_swedish_only';
import * as migration_20261026_143440_financing_monthly_percent from './20261026_143440_financing_monthly_percent';
import * as migration_20261026_143603_remove_unshown_header_footer_fields from './20261026_143603_remove_unshown_header_footer_fields';
import * as migration_20261026_152506_hero_column_heading from './20261026_152506_hero_column_heading';
import * as migration_20261027_091217_editor_steps_and_order from './20261027_091217_editor_steps_and_order';
import * as migration_20261027_092134_financing_terms from './20261027_092134_financing_terms';
import * as migration_20261027_123357_link_anchor from './20261027_123357_link_anchor';
import * as migration_20261027_141811_dealers_requests_fields from './20261027_141811_dealers_requests_fields';
import * as migration_20261027_144015_option_conditions_colored_headings from './20261027_144015_option_conditions_colored_headings';
import * as migration_20261028_081856_option_images from './20261028_081856_option_images';
import * as migration_20261029_095637_truck_models from './20261029_095637_truck_models';
import * as migration_20261029_143003_financing_like_vs_truck from './20261029_143003_financing_like_vs_truck';
import * as migration_20261029_152204_equipment_and_step_order from './20261029_152204_equipment_and_step_order';
import * as migration_20261029_162214_series_text from './20261029_162214_series_text';
import * as migration_20261030_090742_choice_groups from './20261030_090742_choice_groups';
import * as migration_20261030_101939_service_rates_in_settings from './20261030_101939_service_rates_in_settings';
import * as migration_20261030_131846_steps_with_previous from './20261030_131846_steps_with_previous';

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
    name: '20260811_120812_r2_media_prefix',
  },
  {
    up: migration_20260811_122754_r2_documents_prefix.up,
    down: migration_20260811_122754_r2_documents_prefix.down,
    name: '20260811_122754_r2_documents_prefix',
  },
  {
    up: migration_20261002_065231_boilerplate_sync.up,
    down: migration_20261002_065231_boilerplate_sync.down,
    name: '20261002_065231_boilerplate_sync',
  },
  {
    up: migration_20261005_081141_header_cta_footer_email.up,
    down: migration_20261005_081141_header_cta_footer_email.down,
    name: '20261005_081141_header_cta_footer_email',
  },
  {
    up: migration_20261005_094932_configurator_step_help.up,
    down: migration_20261005_094932_configurator_step_help.down,
    name: '20261005_094932_configurator_step_help',
  },
  {
    up: migration_20261022_123131_header_menus_login.up,
    down: migration_20261022_123131_header_menus_login.down,
    name: '20261022_123131_header_menus_login',
  },
  {
    up: migration_20261022_125150_footer_columns_contact.up,
    down: migration_20261022_125150_footer_columns_contact.down,
    name: '20261022_125150_footer_columns_contact',
  },
  {
    up: migration_20261023_091729_truck_catalog.up,
    down: migration_20261023_091729_truck_catalog.down,
    name: '20261023_091729_truck_catalog',
  },
  {
    up: migration_20261023_094032_request_name_optional.up,
    down: migration_20261023_094032_request_name_optional.down,
    name: '20261023_094032_request_name_optional',
  },
  {
    up: migration_20261023_094139_spec_in_quote.up,
    down: migration_20261023_094139_spec_in_quote.down,
    name: '20261023_094139_spec_in_quote',
  },
  {
    up: migration_20261023_115840_contact_requests.up,
    down: migration_20261023_115840_contact_requests.down,
    name: '20261023_115840_contact_requests',
  },
  {
    up: migration_20261023_140057_page_background.up,
    down: migration_20261023_140057_page_background.down,
    name: '20261023_140057_page_background',
  },
  {
    up: migration_20261026_084255_truck_fixed_fields.up,
    down: migration_20261026_084255_truck_fixed_fields.down,
    name: '20261026_084255_truck_fixed_fields',
  },
  {
    up: migration_20261026_135318_truck_product_page.up,
    down: migration_20261026_135318_truck_product_page.down,
    name: '20261026_135318_truck_product_page',
  },
  {
    up: migration_20261026_140314_truck_configurable_from_variants.up,
    down: migration_20261026_140314_truck_configurable_from_variants.down,
    name: '20261026_140314_truck_configurable_from_variants',
  },
  {
    up: migration_20261026_141712_swedish_only.up,
    down: migration_20261026_141712_swedish_only.down,
    name: '20261026_141712_swedish_only',
  },
  {
    up: migration_20261026_143440_financing_monthly_percent.up,
    down: migration_20261026_143440_financing_monthly_percent.down,
    name: '20261026_143440_financing_monthly_percent',
  },
  {
    up: migration_20261026_143603_remove_unshown_header_footer_fields.up,
    down: migration_20261026_143603_remove_unshown_header_footer_fields.down,
    name: '20261026_143603_remove_unshown_header_footer_fields',
  },
  {
    up: migration_20261026_152506_hero_column_heading.up,
    down: migration_20261026_152506_hero_column_heading.down,
    name: '20261026_152506_hero_column_heading',
  },
  {
    up: migration_20261027_091217_editor_steps_and_order.up,
    down: migration_20261027_091217_editor_steps_and_order.down,
    name: '20261027_091217_editor_steps_and_order',
  },
  {
    up: migration_20261027_092134_financing_terms.up,
    down: migration_20261027_092134_financing_terms.down,
    name: '20261027_092134_financing_terms',
  },
  {
    up: migration_20261027_123357_link_anchor.up,
    down: migration_20261027_123357_link_anchor.down,
    name: '20261027_123357_link_anchor',
  },
  {
    up: migration_20261027_141811_dealers_requests_fields.up,
    down: migration_20261027_141811_dealers_requests_fields.down,
    name: '20261027_141811_dealers_requests_fields',
  },
  {
    up: migration_20261027_144015_option_conditions_colored_headings.up,
    down: migration_20261027_144015_option_conditions_colored_headings.down,
    name: '20261027_144015_option_conditions_colored_headings',
  },
  {
    up: migration_20261028_081856_option_images.up,
    down: migration_20261028_081856_option_images.down,
    name: '20261028_081856_option_images',
  },
  {
    up: migration_20261029_095637_truck_models.up,
    down: migration_20261029_095637_truck_models.down,
    name: '20261029_095637_truck_models',
  },
  {
    up: migration_20261029_143003_financing_like_vs_truck.up,
    down: migration_20261029_143003_financing_like_vs_truck.down,
    name: '20261029_143003_financing_like_vs_truck',
  },
  {
    up: migration_20261029_152204_equipment_and_step_order.up,
    down: migration_20261029_152204_equipment_and_step_order.down,
    name: '20261029_152204_equipment_and_step_order',
  },
  {
    up: migration_20261029_162214_series_text.up,
    down: migration_20261029_162214_series_text.down,
    name: '20261029_162214_series_text',
  },
  {
    up: migration_20261030_090742_choice_groups.up,
    down: migration_20261030_090742_choice_groups.down,
    name: '20261030_090742_choice_groups',
  },
  {
    up: migration_20261030_101939_service_rates_in_settings.up,
    down: migration_20261030_101939_service_rates_in_settings.down,
    name: '20261030_101939_service_rates_in_settings',
  },
  {
    up: migration_20261030_131846_steps_with_previous.up,
    down: migration_20261030_131846_steps_with_previous.down,
    name: '20261030_131846_steps_with_previous'
  },
];
