/**
 * Admin navigation and dashboard groups. "Globals" is Payload's own default group, which it always
 * lists first; the others follow in the order their first collection appears: Globals, Content,
 * Settings.
 */
export const ADMIN_GROUPS = {
  /** What editors work on every day. */
  content: "Content",
  /** Rarely used administration, including collections added by plugins. */
  settings: "Settings",
  /** Site-wide content shown on every page. */
  globals: "Globals",
} as const;
