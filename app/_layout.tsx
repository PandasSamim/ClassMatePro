import * as React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SQLiteProvider } from 'expo-sqlite';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DB_NAME, migrateDbIfNeeded } from '@/services/database';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider 
      databaseName={DB_NAME} 
      onInit={migrateDbIfNeeded}
    >
      <SettingsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-student" />
            <Stack.Screen name="student/[id]" />
            <Stack.Screen name="student/update-fees" />
          </Stack>
          <StatusBar style="dark" backgroundColor="#f8f9fa" />
        </ThemeProvider>
      </SettingsProvider>
    </SQLiteProvider>
  );
}
