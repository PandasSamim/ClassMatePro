import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

export interface AttendanceBreakdown {
  grade: string;
  percentage: number;
}

interface AttendanceOverviewProps {
  data: AttendanceBreakdown[];
  delay?: number;
}

export function AttendanceOverview({ data, delay = 0 }: AttendanceOverviewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return colors.secondary;
    if (percentage >= 80) return colors.primaryContainer;
    return colors.error;
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(600).springify()}
    >
      <Card style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.onSurface }]}>Attendance Overview</Text>
        </View>
        <View style={[styles.iconBadge, { backgroundColor: '#10b981' }]}>
          <MaterialIcons name="event-available" size={20} color="white" />
        </View>
      </View>

      <View style={styles.content}>
        {data.length > 0 ? data.map((item, index) => (
          <ProgressBar 
            key={index}
            label={item.grade} 
            percentage={Math.round(item.percentage)} 
            color={getProgressColor(item.percentage)} 
          />
        )) : (
          <Text style={{ color: colors.onSurfaceVariant }}>No attendance data available.</Text>
        )}

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
    </Animated.View>
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
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
