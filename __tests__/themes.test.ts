import { DarkTheme, LightTheme, getThemeColors } from '@/constants/themes';

describe('getThemeColors', () => {
  it('returns DarkTheme for mode "dark" regardless of system setting', () => {
    expect(getThemeColors('dark', true)).toBe(DarkTheme);
    expect(getThemeColors('dark', false)).toBe(DarkTheme);
  });

  it('returns LightTheme for mode "light" regardless of system setting', () => {
    expect(getThemeColors('light', true)).toBe(LightTheme);
    expect(getThemeColors('light', false)).toBe(LightTheme);
  });

  it('follows the system setting for mode "system"', () => {
    expect(getThemeColors('system', true)).toBe(DarkTheme);
    expect(getThemeColors('system', false)).toBe(LightTheme);
  });
});
