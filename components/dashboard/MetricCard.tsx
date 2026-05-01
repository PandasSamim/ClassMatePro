import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MetricCardProps {
  label: string;
  value: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  trendIcon: keyof typeof MaterialIcons.glyphMap;
  trendText: string;
  trendColor: string;
  topBorderColor?: string;
}

export function MetricCard({
  label, value, iconName, iconBgColor, iconColor, trendIcon, trendText, trendColor, topBorderColor
}: MetricCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Card style={styles.card}>
      {topBorderColor && (
        <View style={[styles.topBar, { backgroundColor: topBorderColor }]} />
      )}
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <MaterialIcons name={iconName} size={18} color={iconColor} />
        </View>
      </View>
      <Text style={[styles.value, { color: colors.onSurface }]}>{value}</Text>
      <View style={styles.trendRow}>
        <MaterialIcons name={trendIcon} size={16} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '400',
  },
});
