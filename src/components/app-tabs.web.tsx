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
  { name: 'index', href: '/' as const, labelKey: 'drawLots' },
  { name: 'daily', href: '/daily' as any, labelKey: 'today' },
  { name: 'temple', href: '/temple' as any, labelKey: 'temple' },
  { name: 'map', href: '/map' as any, label: '廟宇' },
  { name: 'collection', href: '/collection' as const, labelKey: 'collection' },
  { name: 'wishes', href: '/wishes' as const, labelKey: 'wishes' },
  { name: 'chat', href: '/chat' as const, labelKey: 'chat' },
  { name: 'stats', href: '/stats' as const, labelKey: 'stats' },
  { name: 'settings', href: '/settings' as const, labelKey: 'settings' },
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
                <TabButton>{'label' in tab ? tab.label : t(tab.labelKey!)}</TabButton>
              </TabTrigger>
            ))}
          </CustomTabList>
        </TabList>
        <TabSlot style={{ flex: 1 }} />
      </Tabs>
    </View>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
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
        {!isMobile && (
          <ThemedText type="smallBold" style={styles.brandText}>
            {t('appName')}
          </ThemedText>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, isMobile && { gap: 8 }]}
        >
          {isMobile && (
            <ThemedText type="smallBold" style={[styles.brandTextMobile]}>
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
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: { marginRight: 'auto', paddingRight: 16 },
  brandTextMobile: { marginRight: 8 },
  pressed: { opacity: 0.7 },
  tabButtonView: { paddingVertical: Spacing.one, paddingHorizontal: 8, borderRadius: Spacing.three },
});
