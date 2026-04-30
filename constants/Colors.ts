// ─────────────────────────────────────────────────────────────
// constants/Colors.ts
// Single source of truth for all colours in the app.
// Import: import { Colors } from '@/constants/Colors';
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // ── Surfaces ──────────────────────────────────────────────
  background:   '#F7F6F2',
  surface:      '#FFFFFF',
  surfaceOffset:'#F3F0EC',

  // ── Text ──────────────────────────────────────────────────
  text:         '#28251D',
  textMuted:    '#7A7974',
  placeholder:  '#BAB9B4',

  // ── Borders ───────────────────────────────────────────────
  border:       '#D4D1CA',

  // ── Primary (teal) ────────────────────────────────────────
  primary:      '#01696F',
  primaryText:  '#FFFFFF',

  // ── Alert / High BP ───────────────────────────────────────
  alertBg:      '#FFF4EC',
  alertBorder:  '#F5C6A0',
  alertText:    '#964219',
  alertIcon:    '#DA7101',

  // ── Success ───────────────────────────────────────────────
  success:      '#437A22',
  successBg:    '#D4DFCC',
} as const;