import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppTabs from '@/components/app-tabs';
import { getSettings } from '@/services/storage';
import { setLanguage } from '@/services/i18n';
import { ONBOARDING_DONE_KEY } from '../onboarding';

export default function TabsLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function init() {
      const [settings, onboardingDone] = await Promise.all([
        getSettings(),
        AsyncStorage.getItem(ONBOARDING_DONE_KEY),
      ]);
      if (settings?.language) setLanguage(settings.language);
      if (!onboardingDone) {
        router.replace('/onboarding' as never);
      }
      setChecked(true);
    }
    init();
  }, []);

  if (!checked) return null;

  return <AppTabs />;
}
