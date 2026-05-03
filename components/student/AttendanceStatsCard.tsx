import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';

interface AttendanceStatsCardProps {
  colors: ThemeColors;
  attendanceRate: number;
  stats: { present: number; total: number };
  selectedMonth: Date;
  isCurrentMonth: boolean;
  onNavigateMonth: (direction: number) => void;
}

export function AttendanceStatsCard({
  colors,
  attendanceRate,
  stats,
  selectedMonth,
  isCurrentMonth,
  onNavigateMonth,
}: AttendanceStatsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceVariant, borderTopColor: colors.secondary }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="fact-check" size={24} color={colors.secondary} />
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Attendance</Text>
        </View>

        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={() => onNavigateMonth(-1)} style={styles.navBtn}>
            <MaterialIcons name="chevron-left" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.onSurface }]}>
            {selectedMonth.toLocaleString('default', { month: 'short' })}
          </Text>
          <TouchableOpacity 
            onPress={() => onNavigateMonth(1)} 
            style={[styles.navBtn, isCurrentMonth && { opacity: 0.3 }]}
            disabled={isCurrentMonth}
          >
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.cardSubtitle, { color: colors.outline }]}>
        {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
      </Text>

      <View style={styles.rateRow}>
        <Text style={[styles.rateValue, { color: colors.secondary }]}>{attendanceRate}%</Text>
        <Text style={[styles.rateLabel, { color: colors.onSurfaceVariant }]}>Present Rate</Text>
      </View>

      <View style={styles.statsList}>
        <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Present</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.present} Days</Text>
        </View>
        <View style={[styles.statRow, { backgroundColor: colors.surface }]}>
          <View style={styles.statLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Absent</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.total - stats.present} Days</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 4,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 4,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 8,
    minWidth: 35,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  rateRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rateValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
  },
  statsList: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
