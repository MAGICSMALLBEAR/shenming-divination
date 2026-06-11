import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
    </Stack>
  );
}
