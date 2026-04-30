// constants/Config.ts
// ─────────────────────────────────────────────────────────────
// Central config — change values here, they propagate everywhere.
// ─────────────────────────────────────────────────────────────

const Config = {
  // ── Backend ───────────────────────────────────────────────
  /** Your teammate's server. Change this one line when deployed. */
  API_BASE_URL: 'http://192.168.1.10:3000',
  API_TIMEOUT_MS: 10_000,

  // ── App identity ──────────────────────────────────────────
  APP_NAME: 'Village Health Worker',
  APP_VERSION: '1.0.0',

  // ── Business rules ────────────────────────────────────────
  /** Visits with BP above this are auto-flagged. */
  BP_ALERT_THRESHOLD: 140,

  /** Visits older than this many days trigger a "due for visit" reminder. */
  VISIT_OVERDUE_DAYS: 30,

  // ── Geography (customise per deployment) ─────────────────
  DEFAULT_STATE: 'Karnataka',
  DEFAULT_DISTRICT: '',
  DEFAULT_BLOCK:       '',
} as const;

export default Config;