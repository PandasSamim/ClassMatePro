import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';

export type BadgeVariant = 'success' | 'error' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  outlined?: boolean;
  badgeIcon?: keyof typeof MaterialIcons.glyphMap;
}

export function Badge({ label, variant = 'neutral', style, outlined, badgeIcon }: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  let bgColor = colors.surfaceVariant;
  let textColor = colors.onSurfaceVariant;
  let borderColor = 'transparent';

  switch (variant) {
    case 'success':
      bgColor = 'rgba(16, 185, 129, 0.1)';
      textColor = '#059669';
      borderColor = 'rgba(16, 185, 129, 0.3)';
      break;
    case 'error':
      bgColor = 'rgba(239, 68, 68, 0.1)';
      textColor = '#dc2626';
      borderColor = 'rgba(239, 68, 68, 0.3)';
      break;
    case 'primary':
      bgColor = 'rgba(59, 130, 246, 0.1)';
      textColor = '#2563eb';
      borderColor = 'rgba(59, 130, 246, 0.3)';
      break;
  }

  const borderStyle = (outlined || variant === 'success' || variant === 'error' || variant === 'primary') 
    ? { borderWidth: 1, borderColor } 
    : {};

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: bgColor },
      borderStyle,
      style
    ]}>
      {badgeIcon && <MaterialIcons name={badgeIcon} size={10} color={textColor} style={{ marginRight: 4 }} />}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
