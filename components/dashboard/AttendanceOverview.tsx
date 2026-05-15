import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ROW_PALETTES = [
  { bg: '#003fb1', bar: '#b5c4ff' },
  { bg: '#006c4b', bar: '#9ff2cc' },
  { bg: '#5e00cd', bar: '#d3baff' },
  { bg: '#8b2500', bar: '#ffb594' },
  { bg: '#006874', bar: '#82d3e0' },
];

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

  const getStatusIcon = (pct: number) => {
    if (pct >= 90) return { icon: 'check-circle' as const, color: '#9ff2cc', bg: '#006c4b' };
    if (pct >= 75) return { icon: 'warning' as const, color: '#ffb594', bg: '#8b2500' };
    return { icon: 'cancel' as const, color: '#ffdad6', bg: '#ba1a1a' };
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.headerIconBox, { backgroundColor: '#006c4b' }]}>
          <MaterialIcons name="event-available" size={20} color="#9ff2cc" />
        </View>
        <View style={styles.headerTexts}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Attendance</Text>
          <Text style={[styles.cardSubtitle, { color: colors.outline }]}>Class-wise performance</Text>
        </View>
      </View>

      {/* Dark Card */}
      <View style={[styles.darkCard, { backgroundColor: '#006c4b' }]}>
        <View style={styles.glowTop} />

        {data.length > 0 ? data.map((item, index) => {
          const pal = ROW_PALETTES[index % ROW_PALETTES.length];
          const status = getStatusIcon(item.percentage);
          return (
            <View key={index} style={styles.attendanceRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.classDot, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={styles.classDotText}>{item.grade.charAt(0)}</Text>
                </View>
                <Text style={styles.gradeLabel} numberOfLines={1}>{item.grade}</Text>
              </View>

              <View style={styles.barSection}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: pal.bar }]} />
                </View>
                <Text style={styles.pctText}>{Math.round(item.percentage)}%</Text>
              </View>

              <View style={[styles.statusDot, { backgroundColor: status.bg }]}>
                <MaterialIcons name={status.icon} size={14} color={status.color} />
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyBox}>
            <MaterialIcons name="event-busy" size={36} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No attendance data available.</Text>
          </View>
        )}

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.infoText}>90% is the institutional attendance target</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  darkCard: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#006c4b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    gap: 14,
  },
  glowTop: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(159,242,204,0.08)',
    top: -50,
    right: -30,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 110,
  },
  classDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classDotText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  gradeLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  barSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '800',
    width: 40,
    textAlign: 'right',
  },
  statusDot: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  infoText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
});
