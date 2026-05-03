/**
 * Below are the colors that are used in the app.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Brand Colors
    primary: '#003fb1',
    onPrimary: '#ffffff',
    primaryContainer: '#1a56db',
    onPrimaryContainer: '#d4dcff',
    inversePrimary: '#b5c4ff',
    primaryFixed: '#dbe1ff',
    onPrimaryFixed: '#00174d',
    
    secondary: '#006c4b',
    onSecondary: '#ffffff',
    secondaryContainer: '#96f6c8',
    onSecondaryContainer: '#00734f',
    
    tertiary: '#5e00cd',
    onTertiary: '#ffffff',
    tertiaryContainer: '#e6d7ff',
    onTertiaryContainer: '#25005a',

    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    // Background & Surfaces
    background: '#f8f9fa',
    onBackground: '#191c1d',
    surface: '#f8f9fa',
    onSurface: '#191c1d',
    surfaceVariant: '#e1e3e4',
    onSurfaceVariant: '#434654',
    
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f4f5',
    surfaceContainer: '#edeeef',
    surfaceContainerHigh: '#e7e8e9',
    surfaceContainerHighest: '#e1e3e4',
    
    // Outlines
    outline: '#737686',
    outlineVariant: '#c3c5d7',

    // Legacy properties for expo-router tab bar
    text: '#191c1d',
    tint: '#1a56db',
    icon: '#434654',
    tabIconDefault: '#434654',
    tabIconSelected: '#1a56db',
  },
  dark: {
    // Brand Colors (Fallback to light mode tokens for now to satisfy TS)
    primary: '#003fb1',
    onPrimary: '#ffffff',
    primaryContainer: '#1a56db',
    onPrimaryContainer: '#d4dcff',
    inversePrimary: '#b5c4ff',
    primaryFixed: '#dbe1ff',
    onPrimaryFixed: '#00174d',
    
    secondary: '#006c4b',
    onSecondary: '#ffffff',
    secondaryContainer: '#96f6c8',
    onSecondaryContainer: '#00734f',
    
    tertiary: '#5e00cd',
    onTertiary: '#ffffff',
    tertiaryContainer: '#e6d7ff',
    onTertiaryContainer: '#25005a',

    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    // Background & Surfaces (Using dark stubs where possible)
    background: '#151718',
    onBackground: '#ECEDEE',
    surface: '#151718',
    onSurface: '#ECEDEE',
    surfaceVariant: '#2e3132',
    onSurfaceVariant: '#c3c5d7',
    
    surfaceContainerLowest: '#000000',
    surfaceContainerLow: '#151718',
    surfaceContainer: '#191c1d',
    surfaceContainerHigh: '#2e3132',
    surfaceContainerHighest: '#434654',
    
    // Outlines
    outline: '#737686',
    outlineVariant: '#434654',

    // Legacy properties for expo-router tab bar
    text: '#ECEDEE',
    tint: '#b5c4ff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#b5c4ff',
  },
};

export type ThemeColors = typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
