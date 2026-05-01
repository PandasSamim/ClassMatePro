import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type BadgeVariant = 'success' | 'error' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  outlined?: boolean;
}

export function Badge({ label, variant = 'neutral', style, outlined }: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  let bgColor = colors.surfaceVariant;
  let textColor = colors.onSurfaceVariant;
  let borderColor = 'transparent';

  switch (variant) {
    case 'success':
      bgColor = colors.secondaryContainer;
      textColor = colors.onSecondaryContainer;
      break;
    case 'error':
      bgColor = colors.errorContainer;
      textColor = colors.onErrorContainer;
      if (outlined) {
         borderColor = 'rgba(186, 26, 26, 0.2)'; // semi-transparent error
      }
      break;
    case 'primary':
      bgColor = colors.primaryContainer;
      textColor = colors.onPrimaryContainer;
      break;
  }

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: bgColor },
      outlined && { borderWidth: 1, borderColor },
      style
    ]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
});
