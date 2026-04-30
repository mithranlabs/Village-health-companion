// app/_layout.tsx
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { LangContext } from '@/hooks/useStrings';
import { strings } from '@/constants/Strings';
import type { Lang } from '@/constants/Strings';

export default function RootLayout() {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <LangContext.Provider value={{ lang, setLang, t: strings[lang] }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle:        { backgroundColor: Colors.background },
        headerTintColor:    Colors.primary,
        headerTitleStyle:   { fontWeight: '700', fontSize: 17, color: Colors.text },
        headerShadowVisible: false,
        contentStyle:       { backgroundColor: Colors.background },
        animation:          'slide_from_right',
      }}>
        <Stack.Screen name="index"          options={{ title: 'My Villages' }} />
        <Stack.Screen name="select-worker"  options={{ title: 'Who are you?', headerBackVisible: false }} />
        <Stack.Screen name="add-village"    options={{ title: 'Add Village',       presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="village/[id]"   options={{ title: 'Households' }} />
        <Stack.Screen name="add-household"  options={{ title: 'Add Household',     presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="household/[id]" options={{ title: 'Patients' }} />
        <Stack.Screen name="add-person"     options={{ title: 'Register Patient',  presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="person/[id]"    options={{ title: 'Visit History' }} />
        <Stack.Screen name="add-visit"      options={{ title: 'Record Visit',      presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </LangContext.Provider>
  );
}