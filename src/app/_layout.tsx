import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import AppTabs from '@/components/app-tabs';
import { getSettings } from '@/services/storage';
import { setLanguage } from '@/services/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    getSettings().then(settings => {
      if (settings?.language) {
        setLanguage(settings.language);
      }
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
