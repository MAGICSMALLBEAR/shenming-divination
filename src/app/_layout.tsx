import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { initThemeFromSettings } from '@/services/themeStore';
import { initSentry } from '@/services/sentry';
import { OpeningCeremony } from '@/components/OpeningCeremony';

export default function RootLayout() {
  useEffect(() => {
    initThemeFromSettings();
    initSentry();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;

    const openNotificationTarget = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url as never);
      }
    };

    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse?.notification) {
      openNotificationTarget(initialResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationTarget(response.notification);
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="oracle" />
      <Stack.Screen name="bazi" />
      <Stack.Screen name="ziwei" />
      <Stack.Screen name="fate" />
      <Stack.Screen name="consult" />
      <Stack.Screen name="community" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="wishes" />
      <Stack.Screen name="map" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="source-audit" />
      <Stack.Screen name="library" />
      <Stack.Screen name="nameAnalysis" />
      <Stack.Screen name="character" />
      <Stack.Screen name="dream" />
      <Stack.Screen name="boneWeight" />
      <Stack.Screen name="yearlyReview" />
      <Stack.Screen name="fengshui" />
      <Stack.Screen name="worshipGuide" />
      <Stack.Screen name={'deity-calendar/[id]'} />
      </Stack>
      <OpeningCeremony />
    </>
  );
}
