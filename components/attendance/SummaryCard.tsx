import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SummaryCardProps {
  label: string;
  value: string | number;
  topBorderColor?: string;
  valueColor?: string;
}

export function SummaryCard({ label, value, topBorderColor, valueColor }: SummaryCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      topBorderColor && { borderTopWidth: 4, borderTopColor: topBorderColor }
    ]}>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
  },
});
