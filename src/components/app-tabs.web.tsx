import {
  Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const tabs = [
  { name: 'index', href: '/' as const, label: '求籤' },
  { name: 'collection', href: '/collection' as const, label: '收藏' },
  { name: 'wishes', href: '/wishes' as const, label: '願望' },
  { name: 'stats', href: '/stats' as const, label: '統計' },
  { name: 'settings', href: '/settings' as const, label: '設定' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {tabs.map(tab => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>{children}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>神明占卜</ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: { position: 'absolute', width: '100%', padding: Spacing.three, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  innerContainer: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.five, borderRadius: Spacing.five, flexDirection: 'row', alignItems: 'center', flexGrow: 1, gap: 4, maxWidth: MaxContentWidth },
  brandText: { marginRight: 'auto' },
  pressed: { opacity: 0.7 },
  tabButtonView: { paddingVertical: Spacing.one, paddingHorizontal: 8, borderRadius: Spacing.three },
});
