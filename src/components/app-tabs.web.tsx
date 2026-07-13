import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

const tabs = [
  { name: 'index', href: '/' as const, labelKey: 'drawLots', icon: '🏛️' },
  { name: 'daily', href: '/daily' as const, labelKey: 'today', icon: '📅' },
  { name: 'temple', href: '/temple' as const, labelKey: 'temple', icon: '🪔' },
  { name: 'collection', href: '/collection' as const, labelKey: 'collection', icon: '💾' },
  { name: 'more', href: '/more' as const, labelKey: 'more', icon: '🔮' },
  { name: 'settings', href: '/settings' as const, labelKey: 'settings', icon: '⚙️' },
];

export default function AppTabs() {
  const { t } = useI18n();
  return (
    <View style={{ flex: 1 }}>
      <Tabs>
        <TabList asChild>
          <CustomTabList t={t}>
            {tabs.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <TabButton icon={tab.icon}>
                  <ThemedText type="small">{t(tab.labelKey)}</ThemedText>
                </TabButton>
              </TabTrigger>
            ))}
          </CustomTabList>
        </TabList>
        <TabSlot style={{ flex: 1 }} />
      </Tabs>
    </View>
  );
}

export function TabButton({ children, isFocused, icon, ...props }: TabTriggerSlotProps & { icon?: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, isFocused && styles.tabButtonActive]}
      >
        {icon ? <ThemedText type="small" style={styles.tabIcon}>{icon}</ThemedText> : null}
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps & { t: (key: string) => string }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { t, ...restProps } = props;

  return (
    <View {...restProps} style={[styles.tabListContainer, isMobile && { padding: Spacing.two }]}>
      <ThemedView type="backgroundElement" style={[styles.innerContainer, isMobile && { paddingHorizontal: Spacing.three }]}> 
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        >
          {!isMobile && (
            <ThemedText type="smallBold" style={styles.brandText}>
              {t('appName')}
            </ThemedText>
          )}
          {isMobile && (
            <ThemedText type="smallBold" style={styles.brandTextMobile}>
              🏛️
            </ThemedText>
          )}
          {props.children}
        </ScrollView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 10,
    position: 'sticky',
    top: 0,
    backgroundColor: 'transparent',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    width: '100%',
    minWidth: 0,
    maxWidth: MaxContentWidth,
  },
  tabScroll: {
    flex: 1,
    minWidth: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentMobile: {
    gap: 6,
    justifyContent: 'flex-start',
    paddingRight: Spacing.three,
  },
  pressed: { opacity: 0.7 },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: 10,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabIcon: { lineHeight: 16 },
  tabButtonActive: { borderWidth: 1, borderColor: '#C9A96E44' },
  brandText: { marginRight: 'auto', paddingRight: 16 },
  brandTextMobile: { marginRight: 8 },
});
