import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

function ProgressBar({ label, percentage, color }: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.progressValue, { color }]}>{percentage}%</Text>
      </View>
      <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceVariant }]}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function AttendanceOverview() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Attendance Overview</Text>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'transparent' }]}>
          <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ProgressBar label="Grade 10" percentage={96} color={colors.secondary} />
        <ProgressBar label="Grade 11" percentage={92} color={colors.primaryContainer} />
        <ProgressBar label="Grade 12" percentage={88} color={colors.error} />

        <View style={[
          styles.infoBox, 
          { 
            backgroundColor: `${colors.secondaryContainer}33`, // 20% opacity
            borderColor: colors.secondaryContainer 
          }
        ]}>
          <MaterialIcons name="info" size={20} color={colors.secondary} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
            Overall attendance is above the 90% institutional target.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 24,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
    borderRadius: 4,
  },
  content: {
    gap: 24,
  },
  progressItem: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
