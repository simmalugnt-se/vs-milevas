/**
 * Admin navigation and dashboard groups. "Globals" is Payload's own default group, which it always
 * lists first; the others follow in the order their first collection appears: Globals, Content,
 * Requests, Configurator, Settings.
 */
export const ADMIN_GROUPS = {
  /** What editors work on every day. */
  content: "Content",
  /** What visitors send in: contact and configurator requests. */
  requests: "Requests",
  /** The truck families and the configurator's settings. */
  configurator: "Configurator",
  /** Rarely used administration, including collections added by plugins. */
  settings: "Settings",
  /** Site-wide content shown on every page. */
  globals: "Globals",
} as const;
