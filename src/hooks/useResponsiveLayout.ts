import { useWindowDimensions } from 'react-native';

import { TempleSpacing } from '@/constants/temple-theme';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 600;
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const isWideDesktop = width >= 1360;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    isWideDesktop,
    gutter: isPhone ? TempleSpacing.md : TempleSpacing.lg,
    contentMaxWidth: isWideDesktop ? 1180 : isDesktop ? 1080 : isTablet ? 900 : 760,
    narrowMaxWidth: isDesktop ? 860 : 760,
  };
}
