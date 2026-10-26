/**
 * Admin navigation and dashboard groups. "Allmänt" is Payload's own group for globals (renamed in
 * `i18n.translations`), which it always lists first; the others follow in the order their first
 * collection appears: Innehåll, Förfrågningar, Konfigurator, Inställningar.
 */
export const ADMIN_GROUPS = {
  /** What editors work on every day. */
  content: "Innehåll",
  /** What visitors send in: contact and configurator requests. */
  requests: "Förfrågningar",
  /** The truck families and the configurator's settings. */
  configurator: "Konfigurator",
  /** Rarely used administration, including collections added by plugins. */
  settings: "Inställningar",
  /** Site-wide content shown on every page. */
  globals: "Allmänt",
} as const;
