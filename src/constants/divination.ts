export const DRAW_ANIMATION_DEFAULT_MS = 4200;

export const DRAW_ANIMATION_PRESETS = [
  { label: '短版', description: '快速揭籤', durationMs: 3000 },
  { label: '標準', description: '完整節奏', durationMs: 4200 },
  { label: '沉浸', description: '儀式感更強', durationMs: 6000 },
] as const;

export function normalizeDrawAnimationDuration(value?: number | null) {
  const allowed = DRAW_ANIMATION_PRESETS.map(p => p.durationMs);
  if (value && allowed.includes(value as (typeof allowed)[number])) {
    return value;
  }
  return DRAW_ANIMATION_DEFAULT_MS;
}
